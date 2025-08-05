import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/mutual-funds/[id] - Delete a specific mutual fund investment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Missing mutual fund ID' }, { status: 400 })
    }

    // Verify ownership
    const existingFund = await prisma.mutualFund.findFirst({
      where: { id, userId }
    })

    if (!existingFund) {
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
    }

    await prisma.mutualFund.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mutual fund deleted successfully' })
  } catch (error) {
    console.error('Error deleting mutual fund:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/mutual-funds/[id] - Update a specific mutual fund investment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { units, avgPrice, totalInvested, currentNAV, notes, isActive, tags, investmentType } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing mutual fund ID' }, { status: 400 })
    }

    // Verify ownership
    const existingFund = await prisma.mutualFund.findFirst({
      where: { id, userId }
    })

    if (!existingFund) {
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
    }

    const updatedData: any = { lastUpdated: new Date() }
    
    if (units !== undefined) updatedData.units = parseFloat(units)
    if (avgPrice !== undefined) updatedData.avgPrice = parseFloat(avgPrice)
    if (totalInvested !== undefined) updatedData.totalInvested = parseFloat(totalInvested)
    if (currentNAV !== undefined) updatedData.currentNAV = parseFloat(currentNAV)
    if (notes !== undefined) updatedData.notes = notes
    if (isActive !== undefined) updatedData.isActive = isActive
    if (tags !== undefined) updatedData.tags = JSON.stringify(tags)
    if (investmentType !== undefined) updatedData.investmentType = investmentType

    const mutualFund = await prisma.mutualFund.update({
      where: { id },
      data: updatedData
    })

    // Parse JSON tags before returning
    const formattedFund = {
      ...mutualFund,
      tags: JSON.parse(mutualFund.tags || '[]'),
      investmentType: mutualFund.investmentType as 'lumpsum' | 'sip'
    }

    return NextResponse.json(formattedFund)
  } catch (error) {
    console.error('Error updating mutual fund:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
