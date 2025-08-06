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

    // Verify the FD belongs to the authenticated user
    const fd = await prisma.fD.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    })

    if (!fd) {
      return NextResponse.json(
        { error: 'FD not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.fD.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'FD deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete FD' },
      { status: 500 }
    )
  }
}
