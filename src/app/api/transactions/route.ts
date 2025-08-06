import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    // Build where clause
    const where: any = { userId }
    
    if (category) {
      where.category = category
    }
    
    if (type) {
      where.type = type
    }
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { type, amount, category, note, date, accountId } = body

    if (!type || !amount || !category || !accountId) {
      return NextResponse.json(
        { error: 'Type, amount, category, and account are required' },
        { status: 400 }
      )
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 }
      )
    }

    // Verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 403 }
      )
    }

    const transactionAmount = parseFloat(amount)

    // Start a database transaction to ensure consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount: transactionAmount,
          category,
          note: note || null,
          date: date ? new Date(date) : new Date(),
          accountId,
          userId,
        },
        include: {
          account: true,
        },
      })

      // Update the account balance based on transaction type
      const balanceChange = type === 'income' ? transactionAmount : -transactionAmount
      
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
