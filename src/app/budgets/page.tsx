'use client'

import PageHeader from '@/components/PageHeader'
import { useEffect, useState } from 'react'

interface Budget {
  id: string
  category: string
  limit: number
  period: string
  startDate: string
  endDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BudgetStatus {
  budget: Budget
  actualSpend: number
  remaining: number
  percentUsed: number
  status: 'within' | 'over' | 'near_limit'
  daysInPeriod: number
  daysRemaining: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    endDate: ''
  })

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
        await calculateBudgetStatuses(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateBudgetStatuses = async (budgets: Budget[]) => {
    const statuses: BudgetStatus[] = []
    
    for (const budget of budgets) {
      if (!budget.isActive) continue
      
      try {
        // Calculate date range for the current period
        const now = new Date()
        let startDate: Date
        let endDate: Date
        
        if (budget.period === 'monthly') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        } else if (budget.period === 'weekly') {
          const dayOfWeek = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - dayOfWeek)
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6)
        } else { // yearly
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
        }

        // Fetch actual spending for this category in the period
        const transactionsResponse = await fetch(`/api/transactions?category=${budget.category}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&type=expense`)
        const transactions = transactionsResponse.ok ? await transactionsResponse.json() : []
        
        const actualSpend = transactions.reduce((sum: number, txn: any) => sum + txn.amount, 0)
        const remaining = budget.limit - actualSpend
        const percentUsed = (actualSpend / budget.limit) * 100
        
        const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        let status: 'within' | 'over' | 'near_limit' = 'within'
        if (actualSpend > budget.limit) {
          status = 'over'
        } else if (percentUsed >= 80) {
          status = 'near_limit'
        }

        statuses.push({
          budget,
          actualSpend,
          remaining,
          percentUsed,
          status,
          daysInPeriod,
          daysRemaining: Math.max(0, daysRemaining)
        })
      } catch (error) {
        console.error(`Error calculating status for budget ${budget.id}:`, error)
      }
    }
    
    setBudgetStatuses(statuses)
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchBudgets()
        setShowAddForm(false)
        setFormData({
          category: '',
          limit: '',
          period: 'monthly',
          endDate: ''
        })
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create budget')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      alert('Failed to create budget')
    }
  }

  const deleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBudgets()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const toggleBudgetStatus = async (budgetId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchBudgets()
      }
    } catch (error) {
      console.error('Error updating budget:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'border-red-500 bg-red-50'
      case 'near_limit': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-green-500 bg-green-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return '❌'
      case 'near_limit': return '⚠️'
      default: return '✅'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading budgets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Budget Management"
          description="Set spending limits and track your expenses against budgets"
          buttonText="Add Budget"
          onButtonClick={() => setShowAddForm(true)}
          buttonColor="primary"
        />

        {/* Budget Summary */}
        {budgetStatuses.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">
                {budgetStatuses.filter(b => b.status === 'within').length}
              </div>
              <div className="text-sm text-gray-700">Within Budget</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">
                {budgetStatuses.filter(b => b.status === 'near_limit').length}
              </div>
              <div className="text-sm text-gray-700">Near Limit (80%+)</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-700">
                {budgetStatuses.filter(b => b.status === 'over').length}
              </div>
              <div className="text-sm text-gray-700">Over Budget</div>
            </div>
          </div>
        )}

        {/* Add Budget Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Budget</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grocery, Travel, Entertainment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Limit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.limit}
                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStatuses.map((budgetStatus) => {
            const { budget, actualSpend, remaining, percentUsed, status, daysRemaining } = budgetStatus
            
            return (
              <div key={budget.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getStatusColor(status)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-600 capitalize">{budget.period} Budget</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBudgetStatus(budget.id, budget.isActive)}
                      className={`text-xs px-2 py-1 rounded ${
                        budget.isActive ? 'bg-green-100 text-gray-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {budget.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-gray-700 rounded hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress {getStatusIcon(status)}</span>
                    <span>{percentUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'over' ? 'bg-red-500' : 
                        status === 'near_limit' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">₹{budget.limit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spent:</span>
                    <span className={`font-medium ${status === 'over' ? 'text-gray-700' : ''}`}>
                      ₹{actualSpend.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className={`font-medium ${remaining < 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                      ₹{remaining.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {daysRemaining > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days left:</span>
                      <span className="font-medium">{daysRemaining}</span>
                    </div>
                  )}
                </div>

                {status === 'over' && (
                  <div className="mt-3 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">
                      ⚠️ Over budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {status === 'near_limit' && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">
                      ⚠️ Approaching limit - ₹{remaining.toLocaleString('en-IN')} remaining
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {budgets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first budget to track spending limits</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Budget
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
