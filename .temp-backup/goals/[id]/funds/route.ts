import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { amount, note, date } = body
    const params = await context.params
    const { id } = params

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id, userId }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 })
    }

    const fundAddition = await prisma.fundAddition.create({
      data: {
        amount: parseFloat(amount),
        note: note || null,
        date: date ? new Date(date) : new Date(),
        goalId: id,
        userId,
      }
    })

    // Return the goal with updated fund additions
    const updatedGoal = await prisma.goal.findUnique({
      where: { id: id },
      include: {
        fundAdditions: {
          orderBy: { date: 'desc' }
        }
      }
    })

    return NextResponse.json({ fundAddition, goal: updatedGoal }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error adding funds:', error)
    return NextResponse.json({ error: 'Failed to add funds' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const params = await context.params
    const { id } = params
    const { id } = params

    // First verify the goal belongs to the authenticated user
    const goal = await prisma.goal.findFirst({
      where: { 
        id,
        userId,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 })
    }

    const fundAdditions = await prisma.fundAddition.findMany({
      where: { goalId: id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(fundAdditions)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching fund additions:', error)
    return NextResponse.json({ error: 'Failed to fetch fund additions' }, { status: 500 })
  }
}
