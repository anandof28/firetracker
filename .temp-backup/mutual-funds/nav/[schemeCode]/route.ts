import { NextRequest, NextResponse } from 'next/server'

// GET /api/mutual-funds/nav/[schemeCode] - Get NAV data for a specific mutual fund
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schemeCode: string }> }
) {
  try {
    const { schemeCode } = await params
    
    if (!schemeCode) {
      return NextResponse.json({ error: 'Scheme code is required' }, { status: 400 })
    }

    // Fetch NAV data from MF API
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, {
      next: { revalidate: 3600 } // Cache for 1 hour since NAV updates daily
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 })
      }
      throw new Error('Failed to fetch NAV data')
    }

    const navData = await response.json()
    
    // Return the complete data including meta information and NAV history
    return NextResponse.json(navData)
  } catch (error) {
    console.error('Error fetching NAV data:', error)
    return NextResponse.json({ error: 'Failed to fetch NAV data' }, { status: 500 })
  }
}
