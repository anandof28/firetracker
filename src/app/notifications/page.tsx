'use client'

import { calculateMaturityAmount, getApproachingMaturityFDs, getMaturedFDs } from '@/utils/fdUtils'
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

interface FD {
  id: string
  amount: number
  rate: number
  startDate: string
  endDate: string
  account: {
    id: string
    name: string
  }
}

interface Notification {
  id: string
  type: 'budget' | 'fd' | 'transaction' | 'system'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  severity: 'high' | 'medium' | 'low'
  actionUrl?: string
  icon: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'budget' | 'fd' | 'system'>('all')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Fetch budget alerts and FD data (same logic as NotificationBell)
      const [budgetsRes, transactionsRes, fdsRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/transactions'),
        fetch('/api/fds')
      ])

      let budgetNotifications: Notification[] = []
      let fdNotifications: Notification[] = []

      if (budgetsRes.ok && transactionsRes.ok) {
        const budgets: Budget[] = await budgetsRes.json()
        const transactions: Transaction[] = await transactionsRes.json()

        const activeBudgets = budgets.filter(budget => budget.isActive)
        const currentDate = new Date()

        activeBudgets.forEach(budget => {
          const budgetStart = new Date(budget.startDate)
          const budgetEnd = new Date(budget.endDate)

          if (currentDate >= budgetStart && currentDate <= budgetEnd) {
            const categoryTransactions = transactions.filter(transaction => 
              transaction.type === 'expense' &&
              transaction.category === budget.category &&
              new Date(transaction.date) >= budgetStart &&
              new Date(transaction.date) <= budgetEnd
            )

            const actualSpend = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
            const percentage = (actualSpend / budget.limit) * 100
            const remaining = budget.limit - actualSpend

            let status: 'over' | 'warning' | 'approaching' | 'good'
            let severity: 'high' | 'medium' | 'low'
            let icon: string
            let title: string
            let message: string

            if (percentage > 100) {
              status = 'over'
              severity = 'high'
              icon = '🚨'
              title = `Budget Exceeded: ${budget.category}`
              message = `You've spent ₹${actualSpend.toLocaleString()} (${percentage.toFixed(0)}%) of your ₹${budget.limit.toLocaleString()} budget. Over by ₹${Math.abs(remaining).toLocaleString()}.`
            } else if (percentage >= 90) {
              status = 'warning'
              severity = 'high'
              icon = '⚠️'
              title = `Budget Warning: ${budget.category}`
              message = `You've used ${percentage.toFixed(0)}% of your budget. Only ₹${remaining.toLocaleString()} remaining.`
            } else if (percentage >= 75) {
              status = 'approaching'
              severity = 'medium'
              icon = '📊'
              title = `Budget Alert: ${budget.category}`
              message = `You've used ${percentage.toFixed(0)}% of your budget. ₹${remaining.toLocaleString()} remaining.`
            } else {
              status = 'good'
              severity = 'low'
              icon = '✅'
              title = `Budget On Track: ${budget.category}`
              message = `You've used ${percentage.toFixed(0)}% of your budget. ₹${remaining.toLocaleString()} remaining.`
            }

            // Include all budget statuses on this page (unlike the header bell which only shows problems)
            budgetNotifications.push({
              id: `budget-${budget.id}`,
              type: 'budget',
              title,
              message,
              timestamp: new Date(),
              isRead: status === 'good', // Mark 'good' statuses as read by default
              severity,
              actionUrl: '/budgets',
              icon
            })
          }
        })
      }

      // FD notifications
      if (fdsRes.ok) {
        const fds: FD[] = await fdsRes.json()
        
        // Get matured and approaching maturity FDs
        const maturedFDs = getMaturedFDs(fds)
        const approachingMaturityFDs = getApproachingMaturityFDs(fds, 45)

        // Add matured FD notifications (highest priority)
        maturedFDs.forEach(fd => {
          const maturityAmount = calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate)
          fdNotifications.push({
            id: `fd-matured-${fd.id}`,
            type: 'fd',
            title: `FD Matured: ${fd.account.name}`,
            message: `Your FD of ₹${fd.amount.toLocaleString()} has matured ${fd.daysPastMaturity} days ago. Maturity amount: ₹${maturityAmount.toLocaleString()}. Please renew or withdraw.`,
            timestamp: new Date(),
            isRead: false,
            severity: 'high',
            actionUrl: '/fds',
            icon: '🚨'
          })
        })

        // Add approaching maturity FD notifications
        approachingMaturityFDs.forEach(fd => {
          const maturityAmount = calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate)
          const urgency = fd.daysUntilMaturity <= 7 ? 'high' : fd.daysUntilMaturity <= 30 ? 'medium' : 'low'
          const icon = fd.daysUntilMaturity <= 7 ? '⚠️' : fd.daysUntilMaturity <= 30 ? '⏰' : '📅'
          
          fdNotifications.push({
            id: `fd-approaching-${fd.id}`,
            type: 'fd',
            title: `FD Maturing Soon: ${fd.account.name}`,
            message: `Your FD of ₹${fd.amount.toLocaleString()} will mature in ${fd.daysUntilMaturity} days. Expected amount: ₹${maturityAmount.toLocaleString()}. Plan for renewal or withdrawal.`,
            timestamp: new Date(),
            isRead: false,
            severity: urgency,
            actionUrl: '/fds',
            icon
          })
        })
      }

      const allNotifications = [...budgetNotifications, ...fdNotifications]

      // Sort by severity and timestamp
      allNotifications.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      setNotifications(allNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'budget') return notification.type === 'budget'
    if (filter === 'fd') return notification.type === 'fd'
    if (filter === 'system') return notification.type === 'system'
    return true
  })

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with your financial alerts and budget status</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread', 'budget', 'fd', 'system'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' && 'All'}
                {filterOption === 'unread' && 'Unread'}
                {filterOption === 'budget' && 'Budget Alerts'}
                {filterOption === 'fd' && 'FD Alerts'}
                {filterOption === 'system' && 'System'}
              </button>
            ))}
          </div>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! 🎉" 
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                !notification.isRead ? getSeverityColor(notification.severity) : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl flex-shrink-0">{notification.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          notification.severity === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : notification.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {notification.severity}
                        </span>
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
