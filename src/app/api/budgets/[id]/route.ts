import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { category, limit, period, endDate, isActive } = body

    // First verify the budget belongs to the authenticated user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found or unauthorized' }, { status: 404 })
    }

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        ...(category !== undefined && { category }),
        ...(limit !== undefined && { limit: parseFloat(limit) }),
        ...(period !== undefined && { period }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating budget:', error)
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthenticatedUser()

    // First verify the budget belongs to the authenticated user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found or unauthorized' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting budget:', error)
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}
