import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(budgets)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { category, limit, period, endDate } = body

    if (!category || !limit || limit <= 0) {
      return NextResponse.json(
        { error: 'Category and positive limit are required' },
        { status: 400 }
      )
    }

    // Check if budget already exists for this category and period
    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_category_period: {
          userId,
          category,
          period: period || 'monthly'
        }
      }
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: `Budget for ${category} (${period || 'monthly'}) already exists` },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        limit: parseFloat(limit),
        period: period || 'monthly',
        endDate: endDate ? new Date(endDate) : null,
        userId,
      }
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}
