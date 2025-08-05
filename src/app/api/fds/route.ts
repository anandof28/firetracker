import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await getAuthenticatedUser()

    const fds = await prisma.fD.findMany({
      where: {
        userId,
      },
      include: {
        account: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(fds)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FDs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { amount, rate, startDate, endDate, accountId } = body

    if (!amount || !rate || !startDate || !endDate || !accountId) {
      return NextResponse.json(
        { error: 'Amount, rate, start date, end date, and account are required' },
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

    const fd = await prisma.fD.create({
      data: {
        amount: parseFloat(amount),
        rate: parseFloat(rate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        accountId: accountId,
        userId,
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(fd, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create FD' },
      { status: 500 }
    )
  }
}
