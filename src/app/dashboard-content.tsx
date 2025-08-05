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
  accountId: string
  account: {
    id: string
    name: string
    balance: number
  }
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
  accountId?: string
  account?: {
    id: string
    name: string
    balance: number
  }
}

export default function DashboardContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fds, setFds] = useState<FD[]>([])
  const [gold, setGold] = useState<Gold[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentGoldRate, setCurrentGoldRate] = useState<number>(9295) // Default current gold rate per gram
  const [currentSilverRate, setCurrentSilverRate] = useState<number>(85) // Default current silver rate per gram
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]) // For account selection
  const [goldRateLoading, setGoldRateLoading] = useState(false)
  const [goldRateError, setGoldRateError] = useState('')

  // Fetch current gold and silver rates from external API
  const fetchGoldRate = async () => {
    setGoldRateLoading(true)
    setGoldRateError('')
    try {
      const response = await fetch('/api/gold-rate')
      if (response.ok) {
        const data = await response.json()
        if (data.gold) {
          setCurrentGoldRate(data.gold.rate)
        }
        if (data.silver) {
          setCurrentSilverRate(data.silver.rate)
        }
        if (!data.success) {
          setGoldRateError(data.error || 'Using fallback rates')
        }
      } else {
        setGoldRateError('Failed to fetch current rates')
      }
    } catch (error) {
      setGoldRateError('Failed to fetch current rates')
      console.error('Rates fetch error:', error)
    } finally {
      setGoldRateLoading(false)
    }
  }

  const fetchAllData = async () => {
    try {
      const [accountsRes, fdsRes, goldRes, transactionsRes, budgetsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/gold'),
        fetch('/api/transactions'),
        fetch('/api/budgets')
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
      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json()
        setBudgets(budgetsData)
      }
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    fetchGoldRate() // Fetch current gold rate on component mount
  }, [])

  // Set accounts with recent transactions as selected by default
  useEffect(() => {
    if (accounts.length > 0 && transactions.length > 0 && selectedAccounts.length === 0) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const activeAccountIds = accounts
        .filter(account => 
          transactions.some(t => 
            t.accountId === account.id && 
            new Date(t.date) >= sevenDaysAgo
          )
        )
        .map(account => account.id)
      
      setSelectedAccounts(activeAccountIds)
    }
  }, [accounts, transactions, selectedAccounts.length])

  // Auto-refresh gold rate every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGoldRate()
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
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
  // Calculate gold value based on current market rate instead of purchase value
  const totalGoldWeight = gold.reduce((sum, g) => sum + g.grams, 0)
  const totalGoldCurrentValue = totalGoldWeight * currentGoldRate
  const totalGoldPurchaseValue = gold.reduce((sum, g) => sum + g.value, 0)
  
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const netCashFlow = totalIncome - totalExpense

  const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldCurrentValue

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-blue-100 text-sm font-medium mb-2">Total Assets</h3>
            <p className="text-3xl font-bold mb-1">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-blue-100 text-sm">Across all investments</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-green-100 text-sm font-medium mb-2">Net Cash Flow</h3>
            <p className="text-3xl font-bold mb-1">₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-green-100 text-sm">Income - Expenses</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-purple-100 text-sm font-medium mb-2">Bank Balance</h3>
            <p className="text-3xl font-bold mb-1">₹{totalAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-purple-100 text-sm">{accounts.length} accounts</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
            <h3 className="text-yellow-100 text-sm font-medium mb-2">Gold Holdings</h3>
            <p className="text-3xl font-bold mb-1">{totalGoldWeight.toFixed(1)}g</p>
            <p className="text-yellow-100 text-sm">₹{totalGoldCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} value</p>
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
                  <p className="text-2xl font-bold text-blue-600 mt-2">{accounts.length}</p>
                </div>
                <div className="text-blue-500 group-hover:text-blue-600">
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
                  <p className="text-2xl font-bold text-green-600 mt-2">{fds.length}</p>
                </div>
                <div className="text-green-500 group-hover:text-green-600">
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
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{gold.length}</p>
                </div>
                <div className="text-yellow-500 group-hover:text-yellow-600">
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
                  <p className="text-2xl font-bold text-purple-600 mt-2">{transactions.length}</p>
                </div>
                <div className="text-purple-500 group-hover:text-purple-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/budgets" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Budgets</h3>
                  <p className="text-gray-600 text-sm">Track spending limits</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{budgets.length}</p>
                </div>
                <div className="text-indigo-500 group-hover:text-indigo-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

         

          
        </div>

        {/* Recent Activity & Summary */}
        <div className="space-y-6">
          {/* Account Summary & Investment Overview Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Summary</h2>
              <div className="space-y-4">
                {accounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No accounts found</p>
                ) : (
                  <>
                    {(() => {
                      // Filter accounts that have transactions in the last 7 days
                      const sevenDaysAgo = new Date()
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                      
                      const activeAccounts = accounts.filter(account => 
                        transactions.some(t => 
                          t.accountId === account.id && 
                          new Date(t.date) >= sevenDaysAgo
                        )
                      )

                      const selectedAccountsData = selectedAccounts.length > 0 
                        ? accounts.filter(acc => selectedAccounts.includes(acc.id))
                        : activeAccounts

                      const totalSelectedBalance = selectedAccountsData.reduce((sum, acc) => sum + acc.balance, 0)
                      const totalSpent = transactions
                        .filter(t => t.type === 'expense' && new Date(t.date) >= sevenDaysAgo)
                        .reduce((sum, t) => sum + t.amount, 0)

                      const handleAccountToggle = (accountId: string) => {
                        setSelectedAccounts(prev => 
                          prev.includes(accountId) 
                            ? prev.filter(id => id !== accountId)
                            : [...prev, accountId]
                        )
                      }

                      const clearSelection = () => {
                        setSelectedAccounts([])
                      }

                      const selectAll = () => {
                        setSelectedAccounts(accounts.map(acc => acc.id))
                      }

                      return (
                        <>
                          {/* Selected Summary */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-semibold text-blue-900 text-lg">
                                {selectedAccounts.length > 0 ? 'Selected Accounts Summary' : 'All Accounts Summary'}
                              </h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={selectAll}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Select All
                                </button>
                                {selectedAccounts.length > 0 && (
                                  <button
                                    onClick={clearSelection}
                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                  >
                                    Clear All
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-sm text-blue-600 mb-1">Selected Accounts</p>
                                <p className="text-2xl font-bold text-blue-900">{selectedAccounts.length}</p>
                                <p className="text-xs text-gray-500">of {accounts.length} total</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-blue-600 mb-1">Selected Balance</p>
                                <p className="text-2xl font-bold text-green-600">
                                  ₹{totalSelectedBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-gray-500">from selected accounts</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-blue-600 mb-1">Total Spent (7 days)</p>
                                <p className="text-2xl font-bold text-red-600">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-500">all transactions</p>
                              </div>
                            </div>
                          </div>

                          {/* Account Tags */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-3">All Accounts ({accounts.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {accounts.map((account) => {
                                const isSelected = selectedAccounts.includes(account.id)
                                const isActive = activeAccounts.some(acc => acc.id === account.id)
                                
                                return (
                                  <button
                                    key={account.id}
                                    onClick={() => handleAccountToggle(account.id)}
                                    className={`px-2 py-1 rounded border-2 cursor-pointer transition-all text-xs font-medium ${
                                      isSelected 
                                        ? 'border-blue-500 bg-blue-500 text-white' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>{account.name.toUpperCase()}</span>
                                      {isActive && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-200' : 'bg-green-400'}`} title="Active (has recent transactions)"></span>
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Active Accounts Info */}
                          {activeAccounts.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                              <p className="text-green-800 font-medium text-sm">
                                {activeAccounts.length} account{activeAccounts.length > 1 ? 's' : ''} with recent transactions (automatically selected)
                              </p>
                              <p className="text-green-700 text-xs mt-1">
                                Active accounts are shown with a green dot and selected by default
                              </p>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Investment Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Investment Overview</h2>
              <div className="space-y-4">
                {(() => {
                  const liquidCashPercentage = totalAssets > 0 ? (totalAccountBalance / totalAssets) * 100 : 0
                  const fdPercentage = totalAssets > 0 ? (totalFDInvestment / totalAssets) * 100 : 0
                  const goldPercentage = totalAssets > 0 ? (totalGoldCurrentValue / totalAssets) * 100 : 0

                  return (
                    <>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Fixed Deposits</span>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₹{totalFDInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-gray-600">{fdPercentage.toFixed(1)}% • Maturity: ₹{totalFDMaturity.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Gold Holdings</span>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">₹{totalGoldCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-gray-600">{goldPercentage.toFixed(1)}% • {totalGoldWeight.toFixed(1)}g total</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Liquid Cash</span>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{totalAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-gray-600">{liquidCashPercentage.toFixed(1)}% • {accounts.length} accounts</p>
                        </div>
                      </div>

                      {/* Precious Metals Rates */}
                      <div className="pt-2">
                        <div className="p-3 bg-gradient-to-r from-yellow-50 to-gray-50 rounded-lg">
                          {/* Header with refresh button */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 font-medium text-sm">Live Precious Metals</span>
                              <span className="text-xs text-gray-500">GRT Jewels</span>
                              {goldRateLoading && (
                                <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={fetchGoldRate}
                                disabled={goldRateLoading}
                                className="text-xs text-gray-600 hover:text-gray-700 underline disabled:opacity-50"
                                title="Refresh rates"
                              >
                                ↻ Refresh
                              </button>
                            </div>
                          </div>
                          
                          {/* Gold and Silver Rates */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {/* Gold Rate */}
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-yellow-800 font-medium">22K Gold</span>
                                <button 
                                  onClick={() => {
                                    const newRate = prompt('Manual override - Enter gold rate per gram:', currentGoldRate.toString())
                                    if (newRate && !isNaN(parseFloat(newRate))) {
                                      setCurrentGoldRate(parseFloat(newRate))
                                    }
                                  }}
                                  className="text-xs text-yellow-700 hover:text-yellow-800 underline"
                                  title="Manual override"
                                >
                                  ✎
                                </button>
                              </div>
                              <p className="font-bold text-yellow-800 text-lg">
                                ₹{currentGoldRate.toLocaleString('en-IN')}<span className="text-xs font-normal">/g</span>
                              </p>
                            </div>
                            
                            {/* Silver Rate */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-800 font-medium">Silver</span>
                                <button 
                                  onClick={() => {
                                    const newRate = prompt('Manual override - Enter silver rate per gram:', currentSilverRate.toString())
                                    if (newRate && !isNaN(parseFloat(newRate))) {
                                      setCurrentSilverRate(parseFloat(newRate))
                                    }
                                  }}
                                  className="text-xs text-gray-700 hover:text-gray-800 underline"
                                  title="Manual override"
                                >
                                  ✎
                                </button>
                              </div>
                              <p className="font-bold text-gray-800 text-lg">
                                ₹{currentSilverRate.toLocaleString('en-IN')}<span className="text-xs font-normal">/g</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Error message */}
                          {goldRateError && (
                            <p className="text-xs text-red-500 mb-2">{goldRateError}</p>
                          )}
                          
                          {/* Gold Performance summary */}
                          {(() => {
                            const goldGainLoss = totalGoldCurrentValue - totalGoldPurchaseValue
                            const goldGainLossPercentage = totalGoldPurchaseValue > 0 ? (goldGainLoss / totalGoldPurchaseValue) * 100 : 0
                            
                            return totalGoldWeight > 0 ? (
                              <div className="pt-2 border-t border-yellow-200">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-500">Gold Portfolio Performance:</span>
                                  <span className={`font-medium ${goldGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {goldGainLoss >= 0 ? '+' : ''}₹{(goldGainLoss/1000).toFixed(0)}K ({goldGainLoss >= 0 ? '+' : ''}{goldGainLossPercentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Enhanced Recent Transactions - Full Width Row */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Last 10 days</span>
                <Link href="/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const tenDaysAgo = new Date()
                tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
                
                const recentTransactions = transactions
                  .filter(t => new Date(t.date) >= tenDaysAgo)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 15) // Show up to 15 recent transactions

                if (recentTransactions.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transactions in the last 10 days</p>
                      <Link href="/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                        Add Transaction →
                      </Link>
                    </div>
                  )
                }

                // Group transactions by date
                const groupedTransactions = recentTransactions.reduce((groups, transaction) => {
                  const date = formatDateForDisplay(transaction.date)
                  if (!groups[date]) {
                    groups[date] = []
                  }
                  groups[date].push(transaction)
                  return groups
                }, {} as Record<string, typeof recentTransactions>)

                return (
                  <div className="space-y-4">
                    {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                      <div key={date} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                          <span>{date}</span>
                          <span className="text-xs text-gray-500">
                            {dayTransactions.length} transaction{dayTransactions.length > 1 ? 's' : ''}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dayTransactions.map((transaction) => (
                            <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === 'income' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.type === 'income' ? '↗' : '↙'} {transaction.type.toUpperCase()}
                                </span>
                                <span className={`font-bold text-sm ${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 text-sm mb-1">{transaction.category}</p>
                              {transaction.note && (
                                <p className="text-xs text-gray-600 mb-2">{transaction.note}</p>
                              )}
                              <div className="flex items-center justify-between">
                                {transaction.account && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {transaction.account.name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(transaction.date).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Daily Summary */}
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Day Total:</span>
                            <div className="flex gap-4">
                              {(() => {
                                const dayIncome = dayTransactions
                                  .filter(t => t.type === 'income')
                                  .reduce((sum, t) => sum + t.amount, 0)
                                const dayExpense = dayTransactions
                                  .filter(t => t.type === 'expense')
                                  .reduce((sum, t) => sum + t.amount, 0)
                                const dayNet = dayIncome - dayExpense
                                
                                return (
                                  <>
                                    {dayIncome > 0 && (
                                      <span className="text-green-600 font-medium">
                                        +₹{dayIncome.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      </span>
                                    )}
                                    {dayExpense > 0 && (
                                      <span className="text-red-600 font-medium">
                                        -₹{dayExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      </span>
                                    )}
                                    <span className={`font-bold ${dayNet >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                      Net: {dayNet >= 0 ? '+' : ''}₹{dayNet.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                  </>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {recentTransactions.length >= 15 && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <Link href="/transactions" className="text-blue-600 hover:text-blue-800 font-medium">
                          View More Transactions →
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
