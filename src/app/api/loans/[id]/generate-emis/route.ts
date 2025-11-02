import { generateEMISchedule } from '@/lib/emi-calculator';
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

    // Fetch the loan
    const loan = await (prisma as any).loan.findUnique({
      where: { id: loanId, userId },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Delete existing EMI payments for this loan
    await (prisma as any).eMIPayment.deleteMany({
      where: { loanId, userId },
    });

    // Generate EMI schedule
    const scheduleData = generateEMISchedule(
      loan.principalAmount,
      loan.interestRate,
      loan.tenureMonths
    );

    const startDate = loan.startDate ? new Date(loan.startDate) : new Date();
    const currentDate = new Date();

    // Create all EMI records from the monthly breakdown
    const emiRecords = scheduleData.monthlyBreakdown.map((emi: any, index: number) => {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + index);

      // Auto-mark past EMIs as paid
      const isPastDue = dueDate < currentDate;

      return {
        loanId: loan.id,
        userId,
        emiNumber: emi.month,
        dueDate,
        emiAmount: emi.emiAmount,
        principalAmount: emi.principalAmount,
        interestAmount: emi.interestAmount,
        remainingPrincipal: emi.remainingPrincipal,
        status: isPastDue ? 'paid' : 'pending',
        paidDate: isPastDue ? dueDate : null,
        amountPaid: isPastDue ? emi.emiAmount : null,
      };
    });

    await (prisma as any).eMIPayment.createMany({
      data: emiRecords,
    });

    return NextResponse.json({
      success: true,
      message: 'EMI schedule generated successfully',
      emisCreated: emiRecords.length,
    });
  } catch (error) {
    console.error('Error generating EMI schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
