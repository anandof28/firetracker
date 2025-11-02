import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds/[id] - Get a single mutual fund
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const { id } = await params

    const mutualFund = await prisma.mutualFund.findFirst({
      where: { 
        id,
        userId
      }
    })

    if (!mutualFund) {
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
    }

    // Parse tags
    const formattedFund = {
      ...mutualFund,
      tags: JSON.parse(mutualFund.tags || '[]')
    }

    return NextResponse.json(formattedFund)
  } catch (error) {
    console.error('Error fetching mutual fund:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/mutual-funds/[id] - Update a mutual fund
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await prisma.mutualFund.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (body.units !== undefined) updateData.units = parseFloat(body.units.toString())
    if (body.avgPrice !== undefined) updateData.avgPrice = parseFloat(body.avgPrice.toString())
    if (body.totalInvested !== undefined) updateData.totalInvested = parseFloat(body.totalInvested.toString())
    if (body.currentNAV !== undefined) updateData.currentNAV = parseFloat(body.currentNAV.toString())
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags)
    if (body.investmentType !== undefined) updateData.investmentType = body.investmentType
    if (body.sipAmount !== undefined) updateData.sipAmount = body.sipAmount ? parseFloat(body.sipAmount.toString()) : null
    if (body.sipDate !== undefined) updateData.sipDate = body.sipDate ? parseInt(body.sipDate.toString()) : null
    if (body.sipStartDate !== undefined) updateData.sipStartDate = body.sipStartDate ? new Date(body.sipStartDate) : null
    if (body.sipEndDate !== undefined) updateData.sipEndDate = body.sipEndDate ? new Date(body.sipEndDate) : null
    if (body.sipFrequency !== undefined) updateData.sipFrequency = body.sipFrequency

    updateData.lastUpdated = new Date()

    const mutualFund = await prisma.mutualFund.update({
      where: { id },
      data: updateData
    })

    // Parse tags before returning
    const formattedFund = {
      ...mutualFund,
      tags: JSON.parse(mutualFund.tags || '[]')
    }

    return NextResponse.json(formattedFund)
  } catch (error: any) {
    console.error('Error updating mutual fund:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to update mutual fund' 
    }, { status: 500 })
  }
}

// DELETE /api/mutual-funds/[id] - Delete a mutual fund
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getAuthenticatedUser()
    const { id } = await params

    console.log('Attempting to delete mutual fund:', id, 'for user:', userId)

    // Verify ownership
    const existing = await prisma.mutualFund.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      console.error('Mutual fund not found or unauthorized:', id)
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
    }

    // Delete the mutual fund
    await prisma.mutualFund.delete({
      where: { id }
    })

    console.log('Successfully deleted mutual fund:', id)
    return NextResponse.json({ message: 'Mutual fund deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting mutual fund:', error)
    return NextResponse.json({ 
      error: error?.message || 'Failed to delete mutual fund' 
    }, { status: 500 })
  }
}
