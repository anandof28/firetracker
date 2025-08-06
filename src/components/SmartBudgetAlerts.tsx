'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Budget {
  id: string
  category: string
  limit: number
  period: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  date: string
}

interface BudgetAlert {
  budget: Budget
  actualSpend: number
  percentage: number
  status: 'over' | 'warning' | 'approaching' | 'good'
  remaining: number
}

export default function SmartBudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [allBudgets, setAllBudgets] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBudgetAlerts = async () => {
    try {
      setLoading(true)
      setError('') // Clear previous errors
      
      // Fetch budgets and transactions
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/transactions')
      ])

      console.log('API Response Status:', {
        budgets: budgetsRes.status,
        transactions: transactionsRes.status
      })

      let budgets: Budget[] = []
      let transactions: Transaction[] = []
      let errors: string[] = []

      // Handle budgets API response
      if (budgetsRes.ok) {
        budgets = await budgetsRes.json()
      } else {
        const budgetError = await budgetsRes.text()
        errors.push(`Budgets API: ${budgetsRes.status}`)
        console.error('Budgets API Error:', budgetError)
      }

      // Handle transactions API response
      if (transactionsRes.ok) {
        transactions = await transactionsRes.json()
      } else {
        const transactionError = await transactionsRes.text()
        errors.push(`Transactions API: ${transactionsRes.status}`)
        console.error('Transactions API Error:', transactionError)
      }

      // If both APIs failed, show error
      if (errors.length === 2) {
        throw new Error(`API calls failed: ${errors.join(', ')}`)
      }

      // If only one API failed, show warning but continue
      if (errors.length === 1) {
        setError(`Warning: ${errors[0]} - Some data may be incomplete`)
      }

      console.log('Fetched Data:', {
        budgetsCount: budgets.length,
        transactionsCount: transactions.length,
        budgets: budgets.map(b => ({ id: b.id, category: b.category, isActive: b.isActive }))
      })

      // Filter only active budgets
      const activeBudgets = budgets.filter(budget => budget.isActive)

      if (activeBudgets.length === 0) {
        setAlerts([])
        setAllBudgets([])
        return
      }

      // Calculate spending for each budget
      const budgetAlerts: BudgetAlert[] = []
      const allBudgetStatuses: BudgetAlert[] = []
      const currentDate = new Date()

      activeBudgets.forEach(budget => {
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = new Date(budget.endDate)

        // Only include budgets that are currently active
        if (currentDate >= budgetStart && currentDate <= budgetEnd) {
          // Calculate actual spending for this category within the budget period
          const categoryTransactions = transactions.filter(transaction => 
            transaction.type === 'expense' &&
            transaction.category === budget.category &&
            new Date(transaction.date) >= budgetStart &&
            new Date(transaction.date) <= budgetEnd
          )

          const actualSpend = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
          const percentage = (actualSpend / budget.limit) * 100
          const remaining = budget.limit - actualSpend

          // Determine status for all budgets
          let status: 'over' | 'warning' | 'approaching' | 'good'

          if (percentage > 100) {
            status = 'over'
          } else if (percentage >= 90) {
            status = 'warning'
          } else if (percentage >= 75) {
            status = 'approaching'
          } else {
            status = 'good'
          }

          const budgetStatus: BudgetAlert = {
            budget,
            actualSpend,
            percentage,
            status,
            remaining
          }

          // Add to all budgets list
          allBudgetStatuses.push(budgetStatus)

          // Only add to alerts if it needs attention
          if (status !== 'good') {
            budgetAlerts.push(budgetStatus)
          }
        }
      })

      // Sort alerts by priority (over budget first, then by percentage)
      budgetAlerts.sort((a, b) => {
        if (a.status === 'over' && b.status !== 'over') return -1
        if (b.status === 'over' && a.status !== 'over') return 1
        return b.percentage - a.percentage
      })

      setAlerts(budgetAlerts)
      setAllBudgets(allBudgetStatuses)
      
      // Debug logging
      console.log('Budget Alerts Debug:', {
        totalBudgets: activeBudgets.length,
        allBudgetStatuses: allBudgetStatuses.length,
        budgetAlerts: budgetAlerts.length,
        statusBreakdown: {
          over: allBudgetStatuses.filter(b => b.status === 'over').length,
          warning: allBudgetStatuses.filter(b => b.status === 'warning').length,
          approaching: allBudgetStatuses.filter(b => b.status === 'approaching').length,
          good: allBudgetStatuses.filter(b => b.status === 'good').length,
        },
        budgetDetails: allBudgetStatuses.map(b => ({
          category: b.budget.category,
          percentage: b.percentage.toFixed(1),
          status: b.status,
          actualSpend: b.actualSpend,
          limit: b.budget.limit
        }))
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budget alerts'
      setError(errorMessage)
      console.error('Budget alerts error:', err)
      
      // Set empty arrays so the component can still render
      setAlerts([])
      setAllBudgets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgetAlerts()
  }, [])

  // Also refresh every 30 seconds to catch real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBudgetAlerts()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <h2 className="text-lg font-semibold text-gray-800">Loading Budget Alerts...</h2>
        </div>
      </div>
    )
  }

  if (error && !error.startsWith('Warning:')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-700 text-sm font-medium">Budget Alerts Error</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBudgetAlerts}
            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100"
            title="Retry loading budget alerts"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <Link 
            href="/budgets" 
            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
          >
            Go to Budgets page →
          </Link>
        </div>
      </div>
    )
  }

  const hasAlertsToShow = alerts.length > 0
  const hasOverBudget = allBudgets.some(b => b.status === 'over')
  const hasWarning = allBudgets.some(b => b.status === 'warning')
  const hasApproaching = allBudgets.some(b => b.status === 'approaching')
  const needsAttention = hasOverBudget || hasWarning || hasApproaching

  if (!needsAttention && allBudgets.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Warning banner for partial failures */}
        {error && error.startsWith('Warning:') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Budget Status</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              All Good
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchBudgetAlerts}
              className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
              title="Refresh alerts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Link 
              href="/budgets" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              Manage Budgets →
            </Link>
          </div>
        </div>
        
        {allBudgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 text-sm font-medium">Over Budget</span>
              </div>
              <p className="text-red-600 text-lg font-bold mt-1">
                {allBudgets.filter(a => a.status === 'over').length}
              </p>
              {allBudgets.filter(a => a.status === 'over').length > 0 && (
                <p className="text-red-500 text-xs mt-1">
                  {allBudgets.filter(a => a.status === 'over').map(b => b.budget.category).join(', ')}
                </p>
              )}
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 text-sm font-medium">Near Limit</span>
              </div>
              <p className="text-orange-600 text-lg font-bold mt-1">
                {allBudgets.filter(a => a.status === 'warning').length}
              </p>
              {allBudgets.filter(a => a.status === 'warning').length > 0 && (
                <p className="text-orange-500 text-xs mt-1">
                  {allBudgets.filter(a => a.status === 'warning').map(b => b.budget.category).join(', ')}
                </p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-700 text-sm font-medium">Approaching</span>
              </div>
              <p className="text-yellow-600 text-lg font-bold mt-1">
                {allBudgets.filter(a => a.status === 'approaching').length}
              </p>
              {allBudgets.filter(a => a.status === 'approaching').length > 0 && (
                <p className="text-yellow-500 text-xs mt-1">
                  {allBudgets.filter(a => a.status === 'approaching').map(b => b.budget.category).join(', ')}
                </p>
              )}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 text-sm font-medium">On Track</span>
              </div>
              <p className="text-green-600 text-lg font-bold mt-1">
                {allBudgets.filter(a => a.status === 'good').length}
              </p>
              {allBudgets.filter(a => a.status === 'good').length > 0 && (
                <p className="text-green-500 text-xs mt-1">
                  {allBudgets.filter(a => a.status === 'good').map(b => b.budget.category).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 text-sm font-medium">All budgets are on track! 🎉</p>
          </div>
          <p className="text-green-600 text-sm mt-1 ml-7">
            Your spending is within healthy limits across all categories.
          </p>
        </div>
        
        {/* Debug section - show all budgets */}
        {allBudgets.length > 0 && (
          <div className="mt-4">
            <details className="text-sm">
              <summary className="text-gray-600 cursor-pointer hover:text-gray-800 font-medium">
                🔍 View detailed budget analysis ({allBudgets.length} budgets) - Click to debug
              </summary>
              <div className="mt-3 bg-gray-50 p-3 rounded space-y-2">
                <p className="text-xs text-gray-500 mb-2">Last updated: {new Date().toLocaleTimeString()}</p>
                {allBudgets.map((budget) => (
                  <div key={budget.budget.id} className={`p-2 rounded text-xs border ${
                    budget.status === 'over' ? 'bg-red-50 border-red-200' :
                    budget.status === 'warning' ? 'bg-orange-50 border-orange-200' :
                    budget.status === 'approaching' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="font-medium">
                      <strong>{budget.budget.category}</strong> ({budget.budget.period})
                    </div>
                    <div className="mt-1">
                      Spent: <strong>₹{budget.actualSpend.toLocaleString('en-IN')}</strong> / 
                      Budget: <strong>₹{budget.budget.limit.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Progress: <strong>{budget.percentage.toFixed(1)}%</strong></span>
                      <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                        budget.status === 'over' ? 'bg-red-100 text-red-700' :
                        budget.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                        budget.status === 'approaching' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {budget.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Period: {new Date(budget.budget.startDate).toLocaleDateString()} - {new Date(budget.budget.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      Remaining: <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600 font-medium'}>
                        ₹{budget.remaining.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    )
  }

  const getAlertColor = (status: string) => {
    switch (status) {
      case 'over':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-500',
          badge: 'bg-red-100 text-red-800'
        }
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-500',
          badge: 'bg-orange-100 text-orange-800'
        }
      case 'approaching':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-500',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const getAlertMessage = (alert: BudgetAlert) => {
    const { status, percentage, remaining } = alert
    
    if (status === 'over') {
      return `Over budget by ₹${Math.abs(remaining).toLocaleString('en-IN')}`
    } else if (status === 'warning') {
      return `Only ₹${remaining.toLocaleString('en-IN')} remaining`
    } else {
      return `₹${remaining.toLocaleString('en-IN')} remaining`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  // Show the main alert interface when there are budget issues
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Warning banner for partial failures */}
      {error && error.startsWith('Warning:') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className={`w-6 h-6 ${hasOverBudget ? 'text-red-600' : hasWarning ? 'text-orange-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Smart Budget Alerts</h2>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            hasOverBudget ? 'bg-red-100 text-red-800' :
            hasWarning ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBudgetAlerts}
            className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
            title="Refresh alerts"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Link 
            href="/budgets" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            Manage Budgets →
          </Link>
        </div>
      </div>

      {/* Budget Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700 text-sm font-medium">Over Budget</span>
          </div>
          <p className="text-red-600 text-lg font-bold mt-1">
            {allBudgets.filter(a => a.status === 'over').length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-orange-700 text-sm font-medium">Near Limit</span>
          </div>
          <p className="text-orange-600 text-lg font-bold mt-1">
            {allBudgets.filter(a => a.status === 'warning').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-700 text-sm font-medium">Approaching</span>
          </div>
          <p className="text-yellow-600 text-lg font-bold mt-1">
            {allBudgets.filter(a => a.status === 'approaching').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-sm font-medium">On Track</span>
          </div>
          <p className="text-green-600 text-lg font-bold mt-1">
            {allBudgets.filter(a => a.status === 'good').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const colors = getAlertColor(alert.status)
          return (
            <div 
              key={alert.budget.id} 
              className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={colors.icon}>
                    {getStatusIcon(alert.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${colors.text}`}>
                        {alert.budget.category}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                        {alert.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className={`text-sm ${colors.text}`}>
                      {getAlertMessage(alert)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${colors.text}`}>
                    ₹{alert.actualSpend.toLocaleString('en-IN')} / ₹{alert.budget.limit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.budget.period}
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      alert.status === 'over' ? 'bg-red-500' :
                      alert.status === 'warning' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex-1">
              <p className="text-blue-700 text-sm font-medium mb-1">Smart Budget Tips</p>
              <div className="text-blue-600 text-sm space-y-1">
                {alerts.some(alert => alert.status === 'over') && (
                  <p>• Consider reviewing spending habits for over-budget categories</p>
                )}
                {alerts.some(alert => alert.status === 'warning') && (
                  <p>• Set up spending alerts to avoid going over budget</p>
                )}
                <p>• Click "Manage Budgets" to adjust limits or create new budgets</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
