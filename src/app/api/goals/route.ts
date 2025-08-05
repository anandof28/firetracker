import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await getAuthenticatedUser()

    const goals = await prisma.goal.findMany({
      where: {
        userId,
      },
      include: {
        fundAdditions: true
      },
      orderBy: [
        { isCompleted: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(goals)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { title, targetAmount, targetDate, category, description } = body

    if (!title || !targetAmount || !category) {
      return NextResponse.json(
        { error: 'Title, target amount, and category are required' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate ? new Date(targetDate) : null,
        category,
        description: description || null,
        userId,
      },
      include: {
        fundAdditions: true
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
