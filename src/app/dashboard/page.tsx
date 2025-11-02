'use client'

import { formatDateForDisplay } from '@/utils/dateHelpers'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Account {
  id: string
  name: string
  balance: number
  createdAt: string
}

interface FD {
  id: string
  amount: number
  rate: number
  startDate: string
  endDate: string
  createdAt: string
}

interface Gold {
  id: string
  grams: number
  value: number
  date: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  note: string | null
  date: string
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fds, setFds] = useState<FD[]>([])
  const [gold, setGold] = useState<Gold[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAllData = async () => {
    try {
      const [accountsRes, fdsRes, goldRes, transactionsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/gold'),
        fetch('/api/transactions')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData)
      }
      if (fdsRes.ok) {
        const fdsData = await fdsRes.json()
        setFds(fdsData)
      }
      if (goldRes.ok) {
        const goldData = await goldRes.json()
        setGold(goldData)
      }
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const calculateFDMaturityAmount = (amount: number, rate: number, startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
    return amount * Math.pow(1 + rate / 100, diffYears)
  }

  const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalFDInvestment = fds.reduce((sum, fd) => sum + fd.amount, 0)
  const totalFDMaturity = fds.reduce((sum, fd) => sum + calculateFDMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate), 0)
  const totalGoldValue = gold.reduce((sum, g) => sum + g.value, 0)
  const totalGoldWeight = gold.reduce((sum, g) => sum + g.grams, 0)
  
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const netCashFlow = totalIncome - totalExpense

  const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldValue

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-700 text-sm font-medium mb-2">Total Assets</h3>
            <p className="text-3xl font-bold mb-1">₹{totalAssets.toFixed(2)}</p>
            <p className="text-gray-700 text-sm">Across all investments</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-700 text-sm font-medium mb-2">Net Cash Flow</h3>
            <p className="text-3xl font-bold mb-1">₹{netCashFlow.toFixed(2)}</p>
            <p className="text-gray-700 text-sm">Income - Expenses</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-700 text-sm font-medium mb-2">Bank Balance</h3>
            <p className="text-3xl font-bold mb-1">₹{totalAccountBalance.toFixed(2)}</p>
            <p className="text-gray-700 text-sm">{accounts.length} accounts</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-700 text-sm font-medium mb-2">Gold Holdings</h3>
            <p className="text-3xl font-bold mb-1">{totalGoldWeight.toFixed(1)}g</p>
            <p className="text-gray-700 text-sm">₹{totalGoldValue.toFixed(2)} value</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link href="/accounts" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Bank Accounts</h3>
                  <p className="text-gray-600 text-sm">Manage your accounts</p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">{accounts.length}</p>
                </div>
                <div className="text-gray-700 group-hover:text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/fds" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Fixed Deposits</h3>
                  <p className="text-gray-600 text-sm">Track FD investments</p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">{fds.length}</p>
                </div>
                <div className="text-gray-700 group-hover:text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/gold" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Gold Investments</h3>
                  <p className="text-gray-600 text-sm">Track gold purchases</p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">{gold.length}</p>
                </div>
                <div className="text-gray-700 group-hover:text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/transactions" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Transactions</h3>
                  <p className="text-gray-600 text-sm">Income & expenses</p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">{transactions.length}</p>
                </div>
                <div className="text-gray-700 group-hover:text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/reports" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Portfolio Reports</h3>
                  <p className="text-gray-600 text-sm">Generate reports</p>
                  <p className="text-2xl font-bold text-gray-700 mt-2">📊</p>
                </div>
                <div className="text-gray-700 group-hover:text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <Link href="/transactions" className="text-gray-700 hover:text-gray-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="p-6">
              {transactions.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-gray-700' 
                            : 'bg-red-100 text-gray-700'
                        }`}>
                          {transaction.type}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.category}</p>
                          <p className="text-sm text-gray-600">{formatDateForDisplay(transaction.date)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₹{transaction.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Investment Summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Investment Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Fixed Deposits</span>
                <div className="text-right">
                  <p className="font-bold text-gray-700">₹{totalFDInvestment.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Maturity: ₹{totalFDMaturity.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">Gold Holdings</span>
                <div className="text-right">
                  <p className="font-bold text-gray-700">₹{totalGoldValue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{totalGoldWeight.toFixed(3)}g total</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">Liquid Cash</span>
                <div className="text-right">
                  <p className="font-bold text-gray-700">₹{totalAccountBalance.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{accounts.length} accounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
