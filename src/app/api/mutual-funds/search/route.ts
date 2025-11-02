import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds/search - Search mutual funds from MF API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    // Fetch all mutual funds from the MF API
    const response = await fetch('https://api.mfapi.in/mf', {
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error('Failed to fetch mutual funds from API')
    }

    const allFunds = await response.json()
    
    // Filter funds based on search query
    const searchTerm = query.toLowerCase()
    const filteredFunds = allFunds
      .filter((fund: any) => {
        const schemeName = fund.schemeName?.toLowerCase() || ''
        return schemeName.includes(searchTerm)
      })
      .slice(0, 50) // Limit to 50 results
      .map((fund: any) => ({
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName
      }))

    return NextResponse.json(filteredFunds)
  } catch (error) {
    console.error('Error searching mutual funds:', error)
    return NextResponse.json(
      { error: 'Failed to search mutual funds. Please try again.' }, 
      { status: 500 }
    )
  }
}
