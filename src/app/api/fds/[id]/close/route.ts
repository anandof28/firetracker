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
    const body = await request.json();
    const { accountId, maturityAmount } = body;

    if (!accountId || !maturityAmount) {
      return NextResponse.json(
        { error: 'Account ID and maturity amount are required' },
        { status: 400 }
      );
    }

    // Check if FD exists and belongs to user
    const fd = await (prisma as any).fD.findUnique({
      where: { id, userId },
    });

    if (!fd) {
      return NextResponse.json({ error: 'FD not found' }, { status: 404 });
    }

    // Check if account exists and belongs to user
    const account = await (prisma as any).account.findUnique({
      where: { id: accountId, userId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Create a transaction record for the FD closure FIRST
    const transaction = await (prisma as any).transaction.create({
      data: {
        type: 'income',
        amount: maturityAmount,
        category: 'FD Maturity',
        note: `FD Maturity - Principal: ₹${fd.amount.toLocaleString('en-IN')}, Interest: ₹${(maturityAmount - fd.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        date: new Date(),
        userId,
        accountId,
      },
    });

    // Update account balance with maturity amount
    await (prisma as any).account.update({
      where: { id: accountId, userId },
      data: {
        balance: {
          increment: maturityAmount,
        },
      },
    });

    // Delete the FD
    await (prisma as any).fD.delete({
      where: { id, userId },
    });

    return NextResponse.json({
      message: 'FD closed successfully and amount credited to account',
      maturityAmount,
      accountId,
      transaction,
    });
  } catch (error) {
    console.error('Error closing FD:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
