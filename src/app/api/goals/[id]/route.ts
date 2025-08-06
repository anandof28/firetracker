import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const params = await context.params

    const goal = await prisma.goal.findFirst({
      where: { 
        id: params.id,
        userId: userId, // Verify ownership
      },
      include: {
        fundAdditions: true
      }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching goal:', error)
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { title, targetAmount, targetDate, category, description, isCompleted } = body
    const params = await context.params

    // First verify the goal belongs to the authenticated user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: params.id,
        userId: userId,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 })
    }

    const goal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
      include: {
        fundAdditions: true
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const params = await context.params

    // First verify the goal belongs to the authenticated user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: params.id,
        userId: userId,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
