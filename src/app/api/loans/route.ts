import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isActive = url.searchParams.get('active');
    const loanType = url.searchParams.get('type');

    const whereClause: any = { userId };
    
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }
    
    if (loanType) {
      whereClause.loanType = loanType;
    }

    const loans = await (prisma as any).loan.findMany({
      where: whereClause,
      include: {
        emiPayments: {
          orderBy: { emiNumber: 'asc' },
          take: 5, // Get first 5 EMIs for preview
        },
        _count: {
          select: {
            emiPayments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate additional loan statistics
    const loansWithStats = loans.map((loan: any) => ({
      ...loan,
      totalEmisPaid: loan.emiPayments.filter((emi: any) => emi.status === 'paid').length,
      nextEmiDue: loan.emiPayments.find((emi: any) => emi.status === 'pending')?.dueDate || null,
      completionPercentage: loan.tenureMonths > 0 ? 
        ((loan.tenureMonths - loan.remainingEmis) / loan.tenureMonths) * 100 : 0,
    }));

    return NextResponse.json(loansWithStats);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      loanName,
      loanType,
      principalAmount,
      interestRate,
      tenureMonths,
      emiAmount,
      lender,
      loanAccountNumber,
      startDate,
      processingFee,
      insurance,
      prepaymentCharges,
      description
    } = body;

    // Validate required fields
    if (!loanName || !loanType || !principalAmount || !interestRate || !tenureMonths || !emiAmount || !lender || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate end date
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + tenureMonths);

    // Create loan
    const loan = await (prisma as any).loan.create({
      data: {
        loanName,
        loanType,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        tenureMonths: parseInt(tenureMonths),
        emiAmount: parseFloat(emiAmount),
        lender,
        loanAccountNumber,
        startDate: new Date(startDate),
        endDate,
        currentBalance: parseFloat(principalAmount),
        remainingEmis: parseInt(tenureMonths),
        processingFee: processingFee ? parseFloat(processingFee) : null,
        insurance: insurance ? parseFloat(insurance) : null,
        prepaymentCharges: prepaymentCharges ? parseFloat(prepaymentCharges) : null,
        description,
        userId,
      },
    });

    // Generate EMI schedule
    await generateEMISchedule(loan.id, loan, userId);

    // Fetch the created loan with EMI data
    const createdLoan = await (prisma as any).loan.findUnique({
      where: { id: loan.id },
      include: {
        emiPayments: {
          orderBy: { emiNumber: 'asc' },
          take: 5,
        },
        _count: {
          select: {
            emiPayments: true,
          }
        }
      },
    });

    return NextResponse.json(createdLoan, { status: 201 });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate EMI schedule
async function generateEMISchedule(loanId: string, loan: any, userId: string) {
  const { principalAmount, interestRate, tenureMonths, emiAmount, startDate } = loan;
  const monthlyRate = interestRate / 12 / 100;
  let remainingPrincipal = principalAmount;

  const emiPayments = [];

  for (let emiNumber = 1; emiNumber <= tenureMonths; emiNumber++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + emiNumber - 1);

    // Calculate interest and principal components
    const interestAmount = remainingPrincipal * monthlyRate;
    const principalComponent = emiAmount - interestAmount;
    
    // Ensure we don't have negative principal in the last EMI
    const adjustedPrincipalComponent = Math.min(principalComponent, remainingPrincipal);
    const adjustedInterestAmount = emiAmount - adjustedPrincipalComponent;

    emiPayments.push({
      loanId,
      emiNumber,
      dueDate,
      emiAmount,
      principalAmount: adjustedPrincipalComponent,
      interestAmount: adjustedInterestAmount,
      userId,
    });

    remainingPrincipal -= adjustedPrincipalComponent;
    
    // Break if principal is fully paid
    if (remainingPrincipal <= 0) break;
  }

  // Create all EMI records
  await (prisma as any).eMIPayment.createMany({
    data: emiPayments,
  });
}