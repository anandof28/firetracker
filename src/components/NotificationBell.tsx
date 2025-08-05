'use client'

import { calculateMaturityAmount, getApproachingMaturityFDs, getMaturedFDs } from '@/utils/fdUtils'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Fetch budget alerts and FD data
      const [budgetsRes, transactionsRes, fdsRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/transactions'),
        fetch('/api/fds')
      ])

      let budgetNotifications: Notification[] = []
      let fdNotifications: Notification[] = []

      // Budget notifications (existing logic)
      if (budgetsRes.ok && transactionsRes.ok) {
        const budgets: Budget[] = await budgetsRes.json()
        const transactions: Transaction[] = await transactionsRes.json()

        // Calculate budget alerts
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

            // Only add notifications for budgets that need attention
            if (status !== 'good') {
              budgetNotifications.push({
                id: `budget-${budget.id}`,
                type: 'budget',
                title,
                message,
                timestamp: new Date(),
                isRead: false,
                severity,
                actionUrl: '/budgets',
                icon
              })
            }
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

      // Add other types of notifications here in the future
      // e.g., upcoming goal targets, etc.

      const allNotifications = [
        ...budgetNotifications,
        ...fdNotifications,
        // Add more notification types here
      ]

      // Sort by severity and timestamp
      allNotifications.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity]
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">All caught up! 🎉</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</p>
                        <div className="flex space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark read
                            </button>
                          )}
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              onClick={() => {
                                markAsRead(notification.id)
                                setIsDropdownOpen(false)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View details
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/notifications"
                onClick={() => setIsDropdownOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
