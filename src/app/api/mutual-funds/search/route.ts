import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds/search - Search mutual funds from MF API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    // Fetch all mutual funds from the API
    const response = await fetch('https://api.mfapi.in/mf', {
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error('Failed to fetch mutual funds from API')
    }

    const allFunds = await response.json()
    
    // Filter funds based on search query
    const filteredFunds = allFunds.filter((fund: any) => 
      fund.schemeName.toLowerCase().includes(query.toLowerCase()) ||
      (fund.fundHouse && fund.fundHouse.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 20) // Limit to 20 results

    return NextResponse.json(filteredFunds)
  } catch (error) {
    console.error('Error searching mutual funds:', error)
    return NextResponse.json({ error: 'Failed to search mutual funds' }, { status: 500 })
  }
}
