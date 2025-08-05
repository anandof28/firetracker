import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const { id } = await params

    // First get the transaction to reverse the account balance
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId: userId, // Verify ownership
      },
      include: { account: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Start a database transaction to ensure consistency
    await prisma.$transaction(async (tx: any) => {
      // Reverse the account balance change
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
      
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      })

      // Delete the transaction
      await tx.transaction.delete({
        where: { id },
      })
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
