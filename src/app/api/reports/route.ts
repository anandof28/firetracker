import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { calculateMaturityAmount, getApproachingMaturityFDs, getMaturedFDs } from '@/utils/fdUtils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const { userId } = await getAuthenticatedUser()
    
    const { searchParams } = new URL(request.url)
    const goldRate = parseFloat(searchParams.get('goldRate') || '9290')

    // Fetch user-specific data in parallel
    const [accounts, fds, gold, transactions] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fD.findMany({
        where: { userId },
        include: {
          account: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      }),
      prisma.gold.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: {
          account: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 50 // Get last 50 transactions for the report
      })
    ])

    // Calculate summary metrics
    const totalAccountBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0)
    const totalFDInvestment = fds.reduce((sum: number, fd: any) => sum + fd.amount, 0)
    const totalFDMaturityValue = fds.reduce((sum: number, fd: any) => 
      sum + calculateMaturityAmount(fd.amount, fd.rate, fd.startDate.toISOString(), fd.endDate.toISOString()), 0
    )
    
    const totalGoldWeight = gold.reduce((sum: number, g: any) => sum + g.grams, 0)
    const totalGoldPurchaseValue = gold.reduce((sum: number, g: any) => sum + g.value, 0)
    const totalGoldCurrentValue = totalGoldWeight * goldRate

    const incomeTransactions = transactions.filter((t: any) => t.type === 'income')
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense')
    const totalIncome = incomeTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    const totalExpense = expenseTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    const netCashFlow = totalIncome - totalExpense

    const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldCurrentValue

    // Get notifications
    const maturedFDs = getMaturedFDs(fds.map((fd: any) => ({
      ...fd,
      startDate: fd.startDate.toISOString(),
      endDate: fd.endDate.toISOString()
    })))
    
    const approachingMaturityFDs = getApproachingMaturityFDs(fds.map((fd: any) => ({
      ...fd,
      startDate: fd.startDate.toISOString(),
      endDate: fd.endDate.toISOString()
    })), 45)

    // Format data for response
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalAccounts: accounts.length,
        totalAccountBalance,
        totalFDs: fds.length,
        totalFDInvestment,
        totalFDMaturityValue,
        totalGoldPurchases: gold.length,
        totalGoldWeight,
        totalGoldPurchaseValue,
        totalGoldCurrentValue,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        netCashFlow,
        totalAssets
      },
      accounts: accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        balance: acc.balance,
        createdAt: acc.createdAt.toISOString()
      })),
      fds: fds.map((fd: any) => ({
        id: fd.id,
        amount: fd.amount,
        rate: fd.rate,
        startDate: fd.startDate.toISOString(),
        endDate: fd.endDate.toISOString(),
        account: fd.account
      })),
      gold: gold.map((g: any) => ({
        id: g.id,
        grams: g.grams,
        value: g.value,
        date: g.date.toISOString()
      })),
      recentTransactions: transactions.slice(0, 10).map((txn: any) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        category: txn.category,
        note: txn.note,
        date: txn.date.toISOString(),
        account: txn.account
      })),
      notifications: {
        maturedFDs,
        approachingMaturityFDs
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
