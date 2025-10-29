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
    const loanId = url.searchParams.get('loanId');
    const status = url.searchParams.get('status');
    const upcoming = url.searchParams.get('upcoming');
    const overdue = url.searchParams.get('overdue');
    const limit = url.searchParams.get('limit');

    const whereClause: any = { userId };
    
    if (loanId) {
      whereClause.loanId = loanId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Handle upcoming EMIs (due within next 30 days)
    if (upcoming === 'true') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      whereClause.dueDate = {
        gte: today,
        lte: thirtyDaysFromNow,
      };
      whereClause.status = 'pending';
    }

    // Handle overdue EMIs
    if (overdue === 'true') {
      const today = new Date();
      whereClause.dueDate = {
        lt: today,
      };
      whereClause.status = 'pending';
    }

    const queryOptions: any = {
      where: whereClause,
      include: {
        loan: {
          select: {
            id: true,
            loanName: true,
            lender: true,
            loanType: true,
          }
        }
      },
      orderBy: { dueDate: 'asc' },
    };

    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const emiPayments = await (prisma as any).eMIPayment.findMany(queryOptions);

    return NextResponse.json(emiPayments);
  } catch (error) {
    console.error('Error fetching EMI payments:', error);
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
      emiId,
      amountPaid,
      paymentMode,
      transactionId,
      lateFee,
      prepaymentAmount,
      description,
      accountId
    } = body;

    if (!emiId || !amountPaid || !accountId) {
      return NextResponse.json(
        { error: 'EMI ID, payment amount, and account ID are required' },
        { status: 400 }
      );
    }

    // Get the EMI payment record
    const emiPayment = await (prisma as any).eMIPayment.findFirst({
      where: {
        id: emiId,
        userId,
      },
      include: {
        loan: true,
      }
    });

    if (!emiPayment) {
      return NextResponse.json({ error: 'EMI payment not found' }, { status: 404 });
    }

    if (emiPayment.status === 'paid') {
      return NextResponse.json({ error: 'EMI already paid' }, { status: 400 });
    }

    const totalAmount = parseFloat(amountPaid) + (lateFee ? parseFloat(lateFee) : 0);
    const paidDate = new Date();
    
    // Determine payment status
    let status = 'paid';
    if (totalAmount < emiPayment.emiAmount) {
      status = 'partial';
    }

    // Update EMI payment record
    const updatedEmiPayment = await (prisma as any).eMIPayment.update({
      where: { id: emiId },
      data: {
        amountPaid: parseFloat(amountPaid),
        paymentMode,
        transactionId,
        lateFee: lateFee ? parseFloat(lateFee) : null,
        prepaymentAmount: prepaymentAmount ? parseFloat(prepaymentAmount) : null,
        description,
        status,
        paidDate,
        updatedAt: new Date(),
      },
      include: {
        loan: true,
      }
    });

    // Update loan balance and statistics
    if (status === 'paid') {
      const newBalance = Math.max(0, emiPayment.loan.currentBalance - emiPayment.principalAmount);
      const newRemainingEmis = emiPayment.loan.remainingEmis - 1;
      const newTotalPaid = emiPayment.loan.totalPaidAmount + totalAmount;
      const newTotalInterestPaid = emiPayment.loan.totalInterestPaid + emiPayment.interestAmount;

      await (prisma as any).loan.update({
        where: { id: emiPayment.loanId },
        data: {
          currentBalance: newBalance,
          remainingEmis: newRemainingEmis,
          totalPaidAmount: newTotalPaid,
          totalInterestPaid: newTotalInterestPaid,
          updatedAt: new Date(),
        },
      });

      // Handle prepayment if any
      if (prepaymentAmount && parseFloat(prepaymentAmount) > 0) {
        await handlePrepayment(emiPayment.loanId, parseFloat(prepaymentAmount), userId);
      }
    }

    // Create expense transaction for the EMI payment
    const transactionDescription = `EMI Payment - ${emiPayment.loan.loanName} (EMI #${emiPayment.emiNumber})${description ? ` - ${description}` : ''}`;
    
    await (prisma as any).transaction.create({
      data: {
        type: 'expense',
        amount: totalAmount,
        category: 'EMI Payment',
        note: transactionDescription,
        date: paidDate,
        accountId,
        userId,
      },
    });

    // Update account balance
    await (prisma as any).account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: totalAmount,
        },
      },
    });

    return NextResponse.json(updatedEmiPayment, { status: 201 });
  } catch (error) {
    console.error('Error recording EMI payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to handle prepayments
async function handlePrepayment(loanId: string, prepaymentAmount: number, userId: string) {
  const loan = await (prisma as any).loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) return;

  // Reduce the outstanding principal
  const newBalance = Math.max(0, loan.currentBalance - prepaymentAmount);
  
  // If loan is fully paid, mark remaining EMIs as not applicable
  if (newBalance === 0) {
    await (prisma as any).eMIPayment.updateMany({
      where: {
        loanId,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    await (prisma as any).loan.update({
      where: { id: loanId },
      data: {
        currentBalance: 0,
        remainingEmis: 0,
        isActive: false,
        updatedAt: new Date(),
      },
    });
  } else {
    // Update the loan balance
    await (prisma as any).loan.update({
      where: { id: loanId },
      data: {
        currentBalance: newBalance,
        totalPaidAmount: loan.totalPaidAmount + prepaymentAmount,
        updatedAt: new Date(),
      },
    });
  }
}