import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds - Get all mutual funds for the authenticated user
export async function GET() {
  try {
    const { userId } = await getAuthenticatedUser()

    const mutualFunds = await prisma.mutualFund.findMany({
      where: { 
        userId,
        isActive: true
      },
      orderBy: { lastUpdated: 'desc' }
    })

    // Parse JSON tags for each fund
    const formattedFunds = mutualFunds.map(fund => ({
      ...fund,
      tags: JSON.parse(fund.tags || '[]')
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
    const { userId } = await getAuthenticatedUser()

    const body = await request.json()
    console.log('Received MF creation request:', body)
    
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
      sipAmount,
      sipDate,
      sipStartDate,
      sipEndDate,
      sipFrequency
    } = body

    // Validate required fields
    if (!schemeCode || !schemeName || !units || !avgPrice) {
      console.error('Missing required fields:', { schemeCode, schemeName, units, avgPrice })
      return NextResponse.json(
        { error: 'Missing required fields: schemeCode, schemeName, units, avgPrice' },
        { status: 400 }
      )
    }

    // Parse and validate numeric values
    const parsedUnits = parseFloat(units.toString())
    const parsedAvgPrice = parseFloat(avgPrice.toString())
    
    if (isNaN(parsedUnits) || isNaN(parsedAvgPrice)) {
      console.error('Invalid numeric values:', { units, avgPrice })
      return NextResponse.json(
        { error: 'Units and avgPrice must be valid numbers' },
        { status: 400 }
      )
    }

    // Calculate total invested if not provided
    const calculatedTotalInvested = totalInvested 
      ? parseFloat(totalInvested.toString()) 
      : (parsedUnits * parsedAvgPrice)

    const dataToCreate = {
      schemeCode: parseInt(schemeCode.toString()),
      schemeName,
      fundHouse: fundHouse || 'Unknown',
      schemeType: schemeType || 'Equity',
      schemeCategory: schemeCategory || 'Growth',
      units: parsedUnits,
      avgPrice: parsedAvgPrice,
      totalInvested: calculatedTotalInvested,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      currentNAV: currentNAV ? parseFloat(currentNAV.toString()) : null,
      notes: notes || null,
      investmentType: investmentType || 'lumpsum',
      tags: '[]',
      sipAmount: sipAmount ? parseFloat(sipAmount.toString()) : null,
      sipDate: sipDate ? parseInt(sipDate.toString()) : null,
      sipStartDate: sipStartDate ? new Date(sipStartDate) : null,
      sipEndDate: sipEndDate ? new Date(sipEndDate) : null,
      sipFrequency: sipFrequency || null,
      userId
    }
    
    console.log('Creating MF with data:', dataToCreate)
    
    const mutualFund = await prisma.mutualFund.create({
      data: dataToCreate
    })

    return NextResponse.json(mutualFund, { status: 201 })
  } catch (error: any) {
    console.error('Error creating mutual fund:', error)
    
    // Return more specific error message
    const errorMessage = error?.message || 'Failed to create mutual fund investment'
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
    }, { status: 500 })
  }
}
