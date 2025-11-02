import { calculateOutstandingPrincipal, generateEMISchedule, simulatePrepayment } from '@/lib/emi-calculator';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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
      amount,
      prepaymentDate = new Date(),
      prepaymentType = 'principal',
      description
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid prepayment amount is required' },
        { status: 400 }
      );
    }

    // Get loan details
    const loan = await (prisma as any).loan.findUnique({
      where: { id: loanId, userId },
      include: {
        emiPayments: {
          where: { status: 'paid' },
          orderBy: { emiNumber: 'asc' }
        }
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const elapsedMonths = loan.emiPayments.length;
    const remainingTenure = loan.tenureMonths - elapsedMonths;

    // Calculate current outstanding principal
    const currentPrincipal = calculateOutstandingPrincipal(
      loan.principalAmount,
      loan.interestRate,
      loan.tenureMonths,
      elapsedMonths
    );

    // Validate prepayment amount
    if (amount >= currentPrincipal) {
      return NextResponse.json(
        { error: 'Prepayment amount cannot be greater than or equal to remaining principal' },
        { status: 400 }
      );
    }

    // Simulate prepayment impact
    const simulation = simulatePrepayment(
      currentPrincipal,
      loan.interestRate,
      remainingTenure,
      amount,
      prepaymentType === 'tenure_reduction' ? 'reduce_tenure' : 'reduce_emi'
    );

    // Record the prepayment
    const prepayment = await (prisma as any).prepayment.create({
      data: {
        loanId,
        amount: parseFloat(amount),
        prepaymentDate: new Date(prepaymentDate),
        principalReduction: amount,
        interestSavings: simulation.interestSavings,
        tenureReduction: simulation.tenureReduction,
        newRemainingTenure: simulation.newTenure,
        newEmiAmount: simulation.newEmiAmount,
        prepaymentType,
        description,
        userId,
      }
    });

    // Update loan details
    const newCurrentBalance = currentPrincipal - amount;
    let updateData: any = {
      currentBalance: newCurrentBalance,
    };

    if (prepaymentType === 'tenure_reduction') {
      updateData.remainingEmis = simulation.newTenure;
    } else if (prepaymentType === 'emi_reduction') {
      updateData.emiAmount = simulation.newEmiAmount;
    }

    await (prisma as any).loan.update({
      where: { id: loanId, userId },
      data: updateData
    });

    // Delete ALL future EMI payments and regenerate schedule
    // Delete unpaid future EMIs
    await (prisma as any).eMIPayment.deleteMany({
      where: {
        loanId,
        userId,
        status: 'pending',
        emiNumber: {
          gt: elapsedMonths
        }
      }
    });

    // Generate new EMI schedule for remaining tenure
    const newSchedule = generateEMISchedule(
      newCurrentBalance,
      loan.interestRate,
      simulation.newTenure
    );

    // Calculate the date for the next EMI (1 month after prepayment or loan start date + elapsed months)
    const nextEmiDate = new Date(prepaymentDate);
    nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);

    const newEmiPayments = newSchedule.monthlyBreakdown.map((breakdown, index) => {
      const dueDate = new Date(nextEmiDate);
      dueDate.setMonth(dueDate.getMonth() + index);
      
      // Auto-mark as paid if due date is before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isBeforeToday = dueDate < today;

      return {
        loanId,
        emiNumber: elapsedMonths + breakdown.month,
        dueDate,
        emiAmount: breakdown.emiAmount,
        principalAmount: breakdown.principalAmount,
        interestAmount: breakdown.interestAmount,
        remainingPrincipal: breakdown.remainingPrincipal,
        status: isBeforeToday ? 'paid' : 'pending',
        paidDate: isBeforeToday ? dueDate : null,
        amountPaid: isBeforeToday ? breakdown.emiAmount : null,
        userId,
      };
    });

    // Create new EMI payments
    await (prisma as any).eMIPayment.createMany({
      data: newEmiPayments,
    });

    return NextResponse.json({
      prepayment,
      simulation,
      message: 'Prepayment recorded successfully and loan schedule updated'
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording prepayment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
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

    const prepayments = await (prisma as any).prepayment.findMany({
      where: { loanId, userId },
      orderBy: { prepaymentDate: 'desc' }
    });

    const totalPrepayments = prepayments.reduce((sum: number, prep: any) => sum + prep.amount, 0);
    const totalInterestSavings = prepayments.reduce((sum: number, prep: any) => sum + prep.interestSavings, 0);
    const totalTenureReduction = prepayments.reduce((sum: number, prep: any) => sum + prep.tenureReduction, 0);

    return NextResponse.json({
      prepayments,
      summary: {
        totalPrepayments,
        totalInterestSavings,
        totalTenureReduction,
        numberOfPrepayments: prepayments.length,
      }
    });
  } catch (error) {
    console.error('Error fetching prepayments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}