import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loanId = params.id;
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'paid', 'pending', 'overdue'

    // Mark all past-due pending EMIs as paid (auto-catchup)
    await (prisma as any).eMIPayment.updateMany({
      where: {
        loanId,
        userId,
        status: 'pending',
        dueDate: { lt: new Date() }
      },
      data: {
        status: 'paid',
        paidDate: new Date(),
      }
    });

    // Build where clause
    const whereClause: any = { 
      loanId,
      userId 
    };
    
    if (status) {
      whereClause.status = status;
    }

    // Get EMI payments
    const [emiPayments, totalCount, loan] = await Promise.all([
      (prisma as any).eMIPayment.findMany({
        where: whereClause,
        orderBy: { emiNumber: 'asc' },
      }),
      (prisma as any).eMIPayment.count({ where: whereClause }),
      (prisma as any).loan.findUnique({
        where: { id: loanId, userId },
        include: {
          prepayments: true,
        }
      })
    ]);

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Calculate summary statistics
    const paidEmis = await (prisma as any).eMIPayment.findMany({
      where: { 
        loanId,
        userId,
        status: 'paid'
      }
    });

    const pendingEmis = await (prisma as any).eMIPayment.findMany({
      where: { 
        loanId,
        userId,
        status: 'pending'
      }
    });

    const overdueEmis = await (prisma as any).eMIPayment.findMany({
      where: { 
        loanId,
        userId,
        status: 'pending',
        dueDate: {
          lt: new Date()
        }
      }
    });

    const summary = {
      totalEmis: loan.tenureMonths,
      paidEmis: paidEmis.length,
      pendingEmis: pendingEmis.length,
      overdueEmis: overdueEmis.length,
      totalPaidPrincipal: paidEmis.reduce((sum: number, emi: any) => sum + emi.principalAmount, 0),
      totalPaidInterest: paidEmis.reduce((sum: number, emi: any) => sum + emi.interestAmount, 0),
      totalPaidAmount: paidEmis.reduce((sum: number, emi: any) => sum + (emi.amountPaid || emi.emiAmount), 0),
      totalPrepayments: loan.prepayments?.reduce((sum: number, prep: any) => sum + prep.amount, 0) || 0,
      nextEmiDue: pendingEmis[0]?.dueDate || null,
      completionPercentage: (paidEmis.length / loan.tenureMonths) * 100,
    };

    // Enhanced EMI data with additional calculations
    const enhancedEmiPayments = emiPayments.map((emi: any) => ({
      ...emi,
      isOverdue: emi.status === 'pending' && new Date(emi.dueDate) < new Date(),
      daysOverdue:
        emi.status === 'pending' && new Date(emi.dueDate) < new Date()
          ? Math.floor((new Date().getTime() - new Date(emi.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      principalPercentage: (emi.principalAmount / emi.emiAmount) * 100,
      interestPercentage: (emi.interestAmount / emi.emiAmount) * 100,
    }));

    return NextResponse.json({
      emiPayments: enhancedEmiPayments,
      summary,
      loan: {
        id: loan.id,
        loanName: loan.loanName,
        loanType: loan.loanType,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        tenureMonths: loan.tenureMonths,
        emiAmount: loan.emiAmount,
        currentBalance: loan.currentBalance,
        notificationEmail: loan.notificationEmail,
        prepayments: loan.prepayments,
      },
      pagination: {
        totalRecords: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching EMI payment history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update EMI payment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const loanId = id;
    const body = await request.json();
    const {
      emiId,
      status,
      paidDate,
      amountPaid,
      paymentMode,
      transactionId,
      lateFee,
      prepaymentAmount,
      description
    } = body;

    // Validate required fields
    if (!emiId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: emiId, status' },
        { status: 400 }
      );
    }

    // Update EMI payment
    const updatedEmi = await (prisma as any).eMIPayment.update({
      where: {
        id: emiId,
        loanId,
        userId,
      },
      data: {
        status,
        paidDate: paidDate ? new Date(paidDate) : null,
        amountPaid: amountPaid ? parseFloat(amountPaid) : null,
        paymentMode,
        transactionId,
        lateFee: lateFee ? parseFloat(lateFee) : null,
        prepaymentAmount: prepaymentAmount ? parseFloat(prepaymentAmount) : null,
        description,
      },
    });

    // If marked as paid, update loan totals
    if (status === 'paid') {
      await updateLoanTotals(loanId, userId);
    }

    return NextResponse.json(updatedEmi);
  } catch (error) {
    console.error('Error updating EMI payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update loan totals
async function updateLoanTotals(loanId: string, userId: string) {
  const paidEmis = await (prisma as any).eMIPayment.findMany({
    where: { 
      loanId,
      userId,
      status: 'paid'
    }
  });

  const totalPaidAmount = paidEmis.reduce((sum: number, emi: any) => sum + (emi.amountPaid || emi.emiAmount), 0);
  const totalInterestPaid = paidEmis.reduce((sum: number, emi: any) => sum + emi.interestAmount, 0);
  const totalPrincipalPaid = paidEmis.reduce((sum: number, emi: any) => sum + emi.principalAmount, 0);

  const loan = await (prisma as any).loan.findUnique({
    where: { id: loanId, userId }
  });

  if (loan) {
    const currentBalance = loan.principalAmount - totalPrincipalPaid;
    const remainingEmis = loan.tenureMonths - paidEmis.length;

    await (prisma as any).loan.update({
      where: { id: loanId, userId },
      data: {
        totalPaidAmount,
        totalInterestPaid,
        currentBalance: Math.max(0, currentBalance),
        remainingEmis: Math.max(0, remainingEmis),
      }
    });
  }
}