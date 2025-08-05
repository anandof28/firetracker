import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds - Get all mutual funds for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mutualFunds = await prisma.mutualFund.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Parse JSON tags and return properly formatted data
    const formattedFunds = mutualFunds.map(fund => ({
      ...fund,
      tags: JSON.parse(fund.tags || '[]'),
      investmentType: fund.investmentType as 'lumpsum' | 'sip'
    }))

    return NextResponse.json(formattedFunds)
  } catch (error) {
    console.error('Error fetching mutual funds:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/mutual-funds - Create a new mutual fund investment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      schemeCode,
      schemeName,
      fundHouse,
      schemeType,
      schemeCategory,
      units,
      avgPrice,
      totalInvested,
      purchaseDate,
      currentNAV,
      notes,
      investmentType,
      tags,
      sipAmount,
      sipDate,
      sipStartDate,
      sipEndDate,
      sipFrequency
    } = body

    // Validate required fields
    if (!schemeCode || !schemeName || !units || !avgPrice || !totalInvested) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const mutualFund = await prisma.mutualFund.create({
      data: {
        schemeCode: parseInt(schemeCode),
        schemeName,
        fundHouse: fundHouse || '',
        schemeType: schemeType || '',
        schemeCategory: schemeCategory || '',
        units: parseFloat(units),
        avgPrice: parseFloat(avgPrice),
        totalInvested: parseFloat(totalInvested),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        currentNAV: currentNAV ? parseFloat(currentNAV) : null,
        notes: notes || null,
        investmentType: investmentType || 'lumpsum',
        tags: JSON.stringify(tags || []),
        sipAmount: sipAmount ? parseFloat(sipAmount) : null,
        sipDate: sipDate ? parseInt(sipDate) : null,
        sipStartDate: sipStartDate ? new Date(sipStartDate) : null,
        sipEndDate: sipEndDate ? new Date(sipEndDate) : null,
        sipFrequency: sipFrequency || null,
        userId
      }
    })

    return NextResponse.json(mutualFund, { status: 201 })
  } catch (error) {
    console.error('Error creating mutual fund:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/mutual-funds - Update existing mutual fund investment
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, units, avgPrice, totalInvested, currentNAV, notes, isActive } = body

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

    const mutualFund = await prisma.mutualFund.update({
      where: { id },
      data: updatedData
    })

    return NextResponse.json(mutualFund)
  } catch (error) {
    console.error('Error updating mutual fund:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/mutual-funds - Delete a mutual fund investment
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

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
