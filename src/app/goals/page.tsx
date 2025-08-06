'use client'

import { useEffect, useState } from 'react'

interface FundAddition {
  id: string
  amount: number
  note: string | null
  date: string
  goalId: string
  createdAt: string
}

interface Goal {
  id: string
  title: string
  targetAmount: number
  targetDate: string | null
  category: string
  description: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  fundAdditions: FundAddition[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFundForm, setShowFundForm] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: 'savings',
    description: ''
  })
  const [fundData, setFundData] = useState({
    amount: '',
    note: '',
    date: ''
  })

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchGoals()
        setShowAddForm(false)
        setFormData({
          title: '',
          targetAmount: '',
          targetDate: '',
          category: 'savings',
          description: ''
        })
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const addFunds = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundData),
      })

      if (response.ok) {
        await fetchGoals()
        setShowFundForm(null)
        setFundData({
          amount: '',
          note: '',
          date: ''
        })
      }
    } catch (error) {
      console.error('Error adding funds:', error)
    }
  }

  const calculateCurrentAmount = (fundAdditions: FundAddition[]): number => {
    return fundAdditions.reduce((sum, addition) => sum + addition.amount, 0)
  }

  const toggleComplete = async (goalId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      })

      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error('Error toggling goal completion:', error)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800',
      investment: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      purchase: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateRecommendedContribution = (goal: Goal, currentAmount: number) => {
    const remaining = goal.targetAmount - currentAmount
    
    if (remaining <= 0 || goal.isCompleted) {
      return null // Goal already achieved
    }

    if (!goal.targetDate) {
      // No target date - suggest monthly contribution based on reasonable timeframe
      const monthlyRecommendation = remaining / 12 // Spread over 1 year
      return {
        monthly: monthlyRecommendation,
        weekly: monthlyRecommendation / 4.33,
        daily: monthlyRecommendation / 30,
        timeframe: 'No target date set - based on 12 months'
      }
    }

    const targetDate = new Date(goal.targetDate)
    const today = new Date()
    const timeDiff = targetDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
    const monthsRemaining = daysRemaining / 30.44 // Average days per month
    const weeksRemaining = daysRemaining / 7

    if (daysRemaining <= 0) {
      return {
        overdue: true,
        message: 'Goal is overdue! Consider extending the target date.',
        monthly: remaining, // Show full amount needed
        weekly: remaining,
        daily: remaining
      }
    }

    return {
      monthly: monthsRemaining > 0 ? remaining / monthsRemaining : remaining,
      weekly: weeksRemaining > 0 ? remaining / weeksRemaining : remaining,
      daily: daysRemaining > 0 ? remaining / daysRemaining : remaining,
      daysRemaining,
      monthsRemaining: Math.ceil(monthsRemaining),
      weeksRemaining: Math.ceil(weeksRemaining)
    }
  }

  const getQuickRecommendation = (recommendation: any) => {
    if (!recommendation) return null
    if (recommendation.overdue) return "⚠️ Overdue"
    
    // Show the most reasonable contribution period
    if (recommendation.monthsRemaining && recommendation.monthsRemaining > 1) {
      return `₹${Math.ceil(recommendation.monthly).toLocaleString('en-IN')}/month`
    } else if (recommendation.weeksRemaining && recommendation.weeksRemaining > 1) {
      return `₹${Math.ceil(recommendation.weekly).toLocaleString('en-IN')}/week`
    } else {
      return `₹${Math.ceil(recommendation.daily).toLocaleString('en-IN')}/day`
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading goals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
              <p className="text-gray-600 mt-2">Track your financial objectives and measure progress</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Goal
            </button>
          </div>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="emergency">Emergency Fund</option>
                    <option value="investment">Investment</option>
                    <option value="savings">Savings</option>
                    <option value="purchase">Purchase</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional details about this goal..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Goal
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

        {/* Add Funds Form */}
        {showFundForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Funds to Goal</h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                addFunds(showFundForm)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={fundData.amount}
                    onChange={(e) => setFundData({...fundData, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={fundData.date}
                    onChange={(e) => setFundData({...fundData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (Optional)
                  </label>
                  <textarea
                    value={fundData.note}
                    onChange={(e) => setFundData({...fundData, note: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Salary bonus, side income, etc..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFundForm(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const currentAmount = calculateCurrentAmount(goal.fundAdditions)
            const progress = calculateProgress(currentAmount, goal.targetAmount)
            const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !goal.isCompleted
            const recommendation = calculateRecommendedContribution(goal, currentAmount)
            
            return (
              <div key={goal.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                goal.isCompleted ? 'border-green-500' : 
                isOverdue ? 'border-red-500' : 'border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    {!goal.isCompleted && recommendation && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {getQuickRecommendation(recommendation)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleComplete(goal.id, goal.isCompleted)}
                      className={`text-xs px-2 py-1 rounded ${
                        goal.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {goal.isCompleted ? '✓' : '○'}
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(goal.category)}`}>
                  {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        goal.isCompleted ? 'bg-green-500' : 
                        progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">₹{currentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">₹{Math.max(0, goal.targetAmount - currentAmount).toLocaleString('en-IN')}</span>
                  </div>
                  {goal.fundAdditions.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contributions:</span>
                      <span className="font-medium">{goal.fundAdditions.length}</span>
                    </div>
                  )}
                  {goal.targetDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Date:</span>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommended Contribution Section */}
                {!goal.isCompleted && (() => {
                  const recommendation = calculateRecommendedContribution(goal, currentAmount)
                  return recommendation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Recommended Contributions</h4>
                      {recommendation.overdue ? (
                        <div className="bg-red-50 rounded-lg p-2">
                          <p className="text-xs text-red-600 font-medium">{recommendation.message}</p>
                          <p className="text-xs text-red-500 mt-1">Amount needed: ₹{Math.max(0, goal.targetAmount - currentAmount).toLocaleString('en-IN')}</p>
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-lg p-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Monthly:</span>
                            <span className="font-medium text-blue-700">₹{Math.ceil(recommendation.monthly).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Weekly:</span>
                            <span className="font-medium text-blue-700">₹{Math.ceil(recommendation.weekly).toLocaleString('en-IN')}</span>  
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Daily:</span>
                            <span className="font-medium text-blue-700">₹{Math.ceil(recommendation.daily).toLocaleString('en-IN')}</span>
                          </div>
                          {recommendation.monthsRemaining && recommendation.monthsRemaining > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {recommendation.monthsRemaining} months remaining ({recommendation.daysRemaining} days)
                            </p>
                          )}
                          {recommendation.timeframe && (
                            <p className="text-xs text-gray-500 mt-1">{recommendation.timeframe}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {goal.description && (
                  <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-200">
                    {goal.description}
                  </p>
                )}

                {/* Fund History Section */}
                {goal.fundAdditions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowHistory(showHistory === goal.id ? null : goal.id)}
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <span>Fund History ({goal.fundAdditions.length})</span>
                      <span className={`transform transition-transform ${showHistory === goal.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {showHistory === goal.id && (
                      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                        {goal.fundAdditions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((addition) => (
                          <div key={addition.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-green-600">
                                +₹{addition.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(addition.date).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            {addition.note && (
                              <p className="text-gray-600 text-xs">{addition.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setShowFundForm(goal.id)}
                    className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first financial goal</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
