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
    const emiPayment = await (prisma as any).eMIPayment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        loan: {
          select: {
            id: true,
            loanName: true,
            lender: true,
            loanType: true,
            emiAmount: true,
          }
        }
      },
    });

    if (!emiPayment) {
      return NextResponse.json({ error: 'EMI payment not found' }, { status: 404 });
    }

    return NextResponse.json(emiPayment);
  } catch (error) {
    console.error('Error fetching EMI payment:', error);
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
      amountPaid,
      paymentMode,
      transactionId,
      lateFee,
      prepaymentAmount,
      description,
      status
    } = body;

    // Check if EMI payment exists and belongs to user
    const existingEmi = await (prisma as any).eMIPayment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        loan: true,
      }
    });

    if (!existingEmi) {
      return NextResponse.json({ error: 'EMI payment not found' }, { status: 404 });
    }

    // Update EMI payment
    const updatedEmiPayment = await (prisma as any).eMIPayment.update({
      where: { id },
      data: {
        amountPaid: amountPaid ? parseFloat(amountPaid) : existingEmi.amountPaid,
        paymentMode: paymentMode || existingEmi.paymentMode,
        transactionId: transactionId || existingEmi.transactionId,
        lateFee: lateFee ? parseFloat(lateFee) : existingEmi.lateFee,
        prepaymentAmount: prepaymentAmount ? parseFloat(prepaymentAmount) : existingEmi.prepaymentAmount,
        description: description || existingEmi.description,
        status: status || existingEmi.status,
        updatedAt: new Date(),
      },
      include: {
        loan: {
          select: {
            id: true,
            loanName: true,
            lender: true,
            loanType: true,
            emiAmount: true,
          }
        }
      },
    });

    return NextResponse.json(updatedEmiPayment);
  } catch (error) {
    console.error('Error updating EMI payment:', error);
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
    // Check if EMI payment exists and belongs to user
    const existingEmi = await (prisma as any).eMIPayment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEmi) {
      return NextResponse.json({ error: 'EMI payment not found' }, { status: 404 });
    }

    // Only allow deletion if payment is not yet made
    if (existingEmi.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete a paid EMI payment' }, 
        { status: 400 }
      );
    }

    // Delete EMI payment
    await (prisma as any).eMIPayment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'EMI payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting EMI payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}