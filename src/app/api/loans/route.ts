import {
    calculateEMI,
    calculateEMIEndDate,
    generateEMISchedule as calculateEMISchedule,
    calculateNextEMIDue,
    calculatePendingAmounts,
    calculateTimeBasedCompletion
} from '@/lib/emi-calculator';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const loansWithStats = loans.map((loan: any) => {
      const totalEmisPaid = loan.emiPayments.filter((emi: any) => emi.status === 'paid').length;
      
      // Calculate completion based ONLY on time elapsed from loan start date
      const startDate = new Date(loan.startDate);
      const currentDate = new Date();
      
      const { completionPercentage, monthsElapsed } = calculateTimeBasedCompletion(
        startDate,
        loan.tenureMonths,
        currentDate
      );
      
      // Calculate remaining EMIs based on time elapsed
      const remainingEMIsTimeBase = Math.max(0, loan.tenureMonths - Math.floor(monthsElapsed));
      
      // Calculate EMI end date
      const emiEndDate = calculateEMIEndDate(startDate, loan.tenureMonths);
      
      // Calculate next EMI due date
      const nextEmiDue = calculateNextEMIDue(startDate, monthsElapsed, loan.tenureMonths);
      
      // Calculate individual pending amounts
      const pendingAmounts = calculatePendingAmounts(
        loan.principalAmount, // Original principal amount
        loan.interestRate,
        loan.tenureMonths, // Total tenure
        monthsElapsed // Months elapsed since loan start
      );
      
      // Calculate total outstanding using the accurate remaining principal
      const totalOutstanding = pendingAmounts.totalPending;
      
      return {
        ...loan,
        totalEmisPaid,
        nextEmiDue,
        completionPercentage,
        monthsElapsed,
        remainingEmis: remainingEMIsTimeBase, // Override with time-based calculation
        emiEndDate,
        totalOutstanding, // New field with principal + interest
        pendingPrincipal: pendingAmounts.pendingPrincipal,
        pendingInterest: pendingAmounts.pendingInterest,
        isOverdue: false, // Removed overdue logic as requested
      };
    });

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
      description,
      notificationEmail,
      reminderDays
    } = body;

    // Validate required fields
    if (!loanName || !loanType || !principalAmount || !interestRate || !tenureMonths || !lender || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate accurate EMI if not provided
    const calculatedEMI = emiAmount || calculateEMI(principalAmount, interestRate, tenureMonths);

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
        emiAmount: calculatedEMI,
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
        notificationEmail,
        reminderDays: reminderDays || 3,
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

// Helper function to generate EMI schedule using improved calculations
async function generateEMISchedule(loanId: string, loan: any, userId: string) {
  const { principalAmount, interestRate, tenureMonths, emiAmount, startDate } = loan;
  
  // Use the improved EMI schedule calculation
  const emiDetails = calculateEMISchedule(principalAmount, interestRate, tenureMonths);
  
  const emiPayments = emiDetails.monthlyBreakdown.map((breakdown, index) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + index);

    return {
      loanId,
      emiNumber: breakdown.month,
      dueDate,
      emiAmount: breakdown.emiAmount,
      principalAmount: breakdown.principalAmount,
      interestAmount: breakdown.interestAmount,
      remainingPrincipal: breakdown.remainingPrincipal,
      userId,
    };
  });

  // Create all EMI records
  await (prisma as any).eMIPayment.createMany({
    data: emiPayments,
  });
}