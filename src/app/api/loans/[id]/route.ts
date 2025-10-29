import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    const nextEmiDue = loan.emiPayments.find((emi: any) => emi.status === 'pending')?.dueDate || null;
    const completionPercentage = loan.tenureMonths > 0 ? 
      ((loan.tenureMonths - loan.remainingEmis) / loan.tenureMonths) * 100 : 0;

    const loanWithStats = {
      ...loan,
      totalEmisPaid,
      nextEmiDue,
      completionPercentage,
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
      isActive
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