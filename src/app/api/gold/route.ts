import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await getAuthenticatedUser()

    const gold = await prisma.gold.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(gold)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gold records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()
    const body = await request.json()
    const { grams, value, date } = body

    if (!grams || !value) {
      return NextResponse.json(
        { error: 'Grams and value are required' },
        { status: 400 }
      )
    }

    const goldRecord = await prisma.gold.create({
      data: {
        grams: parseFloat(grams),
        value: parseFloat(value),
        date: date ? new Date(date) : new Date(),
        userId,
      },
    })

    return NextResponse.json(goldRecord, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create gold record' },
      { status: 500 }
    )
  }
}
