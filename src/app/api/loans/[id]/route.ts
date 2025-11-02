import {
    calculateEMIEndDate,
    calculateNextEMIDue,
    calculatePendingAmounts,
    calculateTimeBasedCompletion
} from '@/lib/emi-calculator';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const loan = await (prisma as any).loan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        emiPayments: {
          orderBy: { emiNumber: 'asc' },
        },
        _count: {
          select: {
            emiPayments: true,
          }
        }
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Calculate loan statistics
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

    const loanWithStats = {
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

    return NextResponse.json(loanWithStats);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const body = await request.json();
    const {
      loanName,
      loanType,
      lender,
      loanAccountNumber,
      processingFee,
      insurance,
      prepaymentCharges,
      description,
      isActive,
      notificationEmail,
      reminderDays
    } = body;

    // Check if loan exists and belongs to user
    const existingLoan = await (prisma as any).loan.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Update loan (only allow updating certain fields)
    const updatedLoan = await (prisma as any).loan.update({
      where: { id },
      data: {
        loanName,
        loanType,
        lender,
        loanAccountNumber,
        processingFee: processingFee ? parseFloat(processingFee) : null,
        insurance: insurance ? parseFloat(insurance) : null,
        prepaymentCharges: prepaymentCharges ? parseFloat(prepaymentCharges) : null,
        description,
        isActive: isActive !== undefined ? isActive : existingLoan.isActive,
        notificationEmail,
        reminderDays: reminderDays ? parseInt(reminderDays) : existingLoan.reminderDays,
        updatedAt: new Date(),
      },
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

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if loan exists and belongs to user
    const existingLoan = await (prisma as any).loan.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Delete loan (this will cascade delete all EMI payments due to onDelete: Cascade)
    await (prisma as any).loan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}