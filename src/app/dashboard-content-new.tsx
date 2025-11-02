'use client'

import { LoadingStates } from '@/components/LoadingComponents'
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

interface Loan {
  id: string
  loanName: string
  loanType: string
  principalAmount: number
  interestRate: number
  tenureMonths: number
  emiAmount: number
  lender: string
  loanAccountNumber?: string
  startDate: string
  endDate: string
  currentBalance: number
  totalPaidAmount: number
  totalInterestPaid: number
  remainingEmis: number
  processingFee?: number
  insurance?: number
  prepaymentCharges?: number
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
  userId: string
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
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAllData = async () => {
    try {
      const [accountsRes, fdsRes, goldRes, transactionsRes, loansRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/gold'),
        fetch('/api/transactions'),
        fetch('/api/loans')
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
      if (loansRes.ok) {
        const loansData = await loansRes.json()
        setLoans(loansData)
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

  // Calculations
  const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalFDInvestment = fds.reduce((sum, fd) => sum + fd.amount, 0)
  const totalGoldWeight = gold.reduce((sum, g) => sum + g.grams, 0)
  const totalGoldValue = gold.reduce((sum, g) => sum + g.value, 0)
  
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const activeLoans = loans.filter(loan => loan.isActive)
  const totalLoanBalance = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0)
  const totalMonthlyEMI = activeLoans.reduce((sum, loan) => sum + loan.emiAmount, 0)

  const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldValue
  const netWorth = totalAssets - totalLoanBalance

  if (loading) {
    return <LoadingStates.Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome Back! 👋</h1>
          <p className="text-slate-600">Here's your financial overview</p>
        </div>

        {/* Net Worth Card - Hero */}
        <div className="mb-8 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">TOTAL NET WORTH</p>
                <h2 className="text-6xl font-bold text-white mb-2">₹{(netWorth / 100000).toFixed(2)}L</h2>
                <p className="text-blue-100">₹{netWorth.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-xs mb-1">Assets</p>
                <p className="text-white text-xl font-bold">₹{(totalAssets / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-xs mb-1">Liabilities</p>
                <p className="text-white text-xl font-bold">₹{(totalLoanBalance / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-xs mb-1">Income</p>
                <p className="text-green-300 text-xl font-bold">+₹{(totalIncome / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-xs mb-1">Expenses</p>
                <p className="text-red-300 text-xl font-bold">-₹{(totalExpense / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bank Accounts */}
          <Link href="/accounts">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-slate-800">{accounts.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-2">Bank Accounts</h3>
              <p className="text-2xl font-bold text-slate-800">₹{(totalAccountBalance / 100000).toFixed(1)}L</p>
            </div>
          </Link>

          {/* Fixed Deposits */}
          <Link href="/fds">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-slate-800">{fds.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-2">Fixed Deposits</h3>
              <p className="text-2xl font-bold text-slate-800">₹{(totalFDInvestment / 100000).toFixed(1)}L</p>
            </div>
          </Link>

          {/* Gold */}
          <Link href="/gold">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-slate-800">{totalGoldWeight.toFixed(0)}g</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-2">Gold Holdings</h3>
              <p className="text-2xl font-bold text-slate-800">₹{(totalGoldValue / 1000).toFixed(0)}K</p>
            </div>
          </Link>

          {/* Loans */}
          <Link href="/emis">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-red-200 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-slate-800">{activeLoans.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-2">Active Loans</h3>
              <p className="text-2xl font-bold text-slate-800">₹{(totalLoanBalance / 100000).toFixed(1)}L</p>
            </div>
          </Link>
        </div>

        {/* Bottom Grid - Transactions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                  <p className="text-sm text-slate-500 mt-1">Last 7 days</p>
                </div>
                <Link href="/transactions" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                
                const recentTransactions = transactions
                  .filter(t => new Date(t.date) >= sevenDaysAgo)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 8)

                if (recentTransactions.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-slate-500 mb-4">No recent transactions</p>
                      <Link href="/transactions" className="text-blue-600 hover:text-blue-700 font-medium">
                        Add Transaction →
                      </Link>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{transaction.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {transaction.account && (
                                <span className="text-xs text-slate-500">{transaction.account.name}</span>
                              )}
                              {transaction.note && (
                                <>
                                  <span className="text-xs text-slate-300">•</span>
                                  <span className="text-xs text-slate-500">{transaction.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateForDisplay(transaction.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/transactions" className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Add Transaction</p>
                    <p className="text-xs text-slate-600">Record income/expense</p>
                  </div>
                </div>
              </Link>

              <Link href="/budgets" className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">View Budgets</p>
                    <p className="text-xs text-slate-600">Track spending limits</p>
                  </div>
                </div>
              </Link>

              <Link href="/emis" className="block p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Pay EMI</p>
                    <p className="text-xs text-slate-600">₹{(totalMonthlyEMI / 1000).toFixed(0)}K monthly</p>
                  </div>
                </div>
              </Link>

              <Link href="/accounts" className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Manage Accounts</p>
                    <p className="text-xs text-slate-600">{accounts.length} active accounts</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
