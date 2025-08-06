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

    // Verify the gold investment belongs to the authenticated user
    const gold = await prisma.gold.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    })

    if (!gold) {
      return NextResponse.json(
        { error: 'Gold investment not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.gold.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'Gold deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete gold' },
      { status: 500 }
    )
  }
}
