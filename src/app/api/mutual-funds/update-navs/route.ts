import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST /api/mutual-funds/update-navs - Update NAVs for all user's mutual funds
export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active mutual funds for the user
    const mutualFunds = await prisma.mutualFund.findMany({
      where: { userId, isActive: true }
    })

    if (mutualFunds.length === 0) {
      return NextResponse.json({ message: 'No mutual funds to update' })
    }

    const updatePromises = mutualFunds.map(async (fund) => {
      try {
        // Fetch latest NAV from MF API
        const response = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)
        
        if (!response.ok) {
          console.error(`Failed to fetch NAV for scheme ${fund.schemeCode}`)
          return null
        }

        const navData = await response.json()
        
        if (navData.data && navData.data.length > 0) {
          const latestNAV = parseFloat(navData.data[0].nav)
          
          // Update the fund with latest NAV
          return await prisma.mutualFund.update({
            where: { id: fund.id },
            data: {
              currentNAV: latestNAV,
              lastUpdated: new Date()
            }
          })
        }
        
        return null
      } catch (error) {
        console.error(`Error updating NAV for fund ${fund.id}:`, error)
        return null
      }
    })

    const results = await Promise.all(updatePromises)
    const successfulUpdates = results.filter(result => result !== null)

    return NextResponse.json({
      message: `Updated NAVs for ${successfulUpdates.length} out of ${mutualFunds.length} mutual funds`,
      updatedCount: successfulUpdates.length,
      totalCount: mutualFunds.length
    })
  } catch (error) {
    console.error('Error updating NAVs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
