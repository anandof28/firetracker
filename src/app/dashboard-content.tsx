'use client'

import { LoadingStates } from '@/components/LoadingComponents'
import { formatDateForDisplay } from '@/utils/dateHelpers'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface Account {
  id: string
  name: string
  accountNumber?: string
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
  type: 'income' | 'expense'
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

interface MutualFund {
  id: string
  schemeCode: number
  schemeName: string
  fundHouse: string
  schemeType: string
  schemeCategory: string
  units: number
  avgPrice: number
  totalInvested: number
  currentNAV: number | null
  lastUpdated: string
  isActive: boolean
}

// --- Utilities ---------------------------------------------------------------
const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const compactInr = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })

const formatINR = (n: number) => `₹${inr.format(Math.round(n))}`
const formatINRCompact = (n: number) => `₹${compactInr.format(Math.round(n))}`

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardContent() {
  // --- State -----------------------------------------------------------------
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fds, setFds] = useState<FD[]>([])
  const [gold, setGold] = useState<Gold[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('') // '' = All
  
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showFDModal, setShowFDModal] = useState(false)
  const [showGoldModal, setShowGoldModal] = useState(false)

  // --- Data fetch ------------------------------------------------------------
  const fetchAllData = async () => {
    try {
      setError('')
      
      // Fetch sequentially to avoid overwhelming connection pool
      // This is slower but more reliable with limited database connections
      const accountsRes = await fetch('/api/accounts')
      const fdsRes = await fetch('/api/fds')
      const goldRes = await fetch('/api/gold')
      const transactionsRes = await fetch('/api/transactions')
      const loansRes = await fetch('/api/loans')
      const mfRes = await fetch('/api/mutual-funds').catch(err => {
        console.error('Mutual funds API failed:', err)
        return { ok: false, json: async () => [] }
      })

      // Log response statuses for debugging
      console.log('API Response Statuses:', {
        accounts: accountsRes.status,
        fds: fdsRes.status,
        gold: goldRes.status,
        transactions: transactionsRes.status,
        loans: loansRes.status,
        mutualFunds: mfRes.ok ? 200 : 'failed'
      })

      // Check critical APIs (all except mutual-funds which is optional)
      if (!accountsRes.ok || !fdsRes.ok || !goldRes.ok || !transactionsRes.ok || !loansRes.ok) {
        const failedApis = []
        if (!accountsRes.ok) failedApis.push(`accounts (${accountsRes.status})`)
        if (!fdsRes.ok) failedApis.push(`fds (${fdsRes.status})`)
        if (!goldRes.ok) failedApis.push(`gold (${goldRes.status})`)
        if (!transactionsRes.ok) failedApis.push(`transactions (${transactionsRes.status})`)
        if (!loansRes.ok) failedApis.push(`loans (${loansRes.status})`)
        
        console.error('Failed APIs:', failedApis)
        throw new Error(`Failed to load: ${failedApis.join(', ')}`)
      }

      const accountsData = await accountsRes.json()
      const fdsData = await fdsRes.json()
      const goldData = await goldRes.json()
      const transactionsData = await transactionsRes.json()
      const loansData = await loansRes.json()
      const mfData = mfRes.ok ? await mfRes.json() : []

      setAccounts(accountsData)
      setFds(fdsData)
      setGold(goldData)
      setTransactions(transactionsData)
      setLoans(loansData)
      setMutualFunds(mfData || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Unable to load your data right now. Please try again.\n\nIf this keeps happening, check your network or refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAllData() }, [])

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) setSelectedAccountId('')
  }, [accounts, selectedAccountId])

  // --- Derived values (memoized) --------------------------------------------
  const {
    totalAccountBalance,
    totalFDInvestment,
    totalGoldWeight,
    totalGoldValue,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpense,
    activeLoans,
    totalLoanBalance,
    totalMonthlyEMI,
    totalAssets,
    netWorth
  } = useMemo(() => {
    const totalAccountBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)
    const totalFDInvestment = fds.reduce((s, fd) => s + (fd.amount || 0), 0)
    const totalGoldWeight = gold.reduce((s, g) => s + (g.grams || 0), 0)
    const totalGoldValue = gold.reduce((s, g) => s + (g.value || 0), 0)

    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    const totalIncome = incomeTransactions.reduce((s, t) => s + (t.amount || 0), 0)
    const totalExpense = expenseTransactions.reduce((s, t) => s + (t.amount || 0), 0)

    const activeLoans = loans.filter(l => l.isActive)
    const totalLoanBalance = activeLoans.reduce((s, l) => s + (l.currentBalance || 0), 0)
    const totalMonthlyEMI = activeLoans.reduce((s, l) => s + (l.emiAmount || 0), 0)

    const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldValue
    const netWorth = totalAssets - totalLoanBalance

    return {
      totalAccountBalance,
      totalFDInvestment,
      totalGoldWeight,
      totalGoldValue,
      incomeTransactions,
      expenseTransactions,
      totalIncome,
      totalExpense,
      activeLoans,
      totalLoanBalance,
      totalMonthlyEMI,
      totalAssets,
      netWorth
    }
  }, [accounts, fds, gold, transactions, loans])

  const selectedAccount = useMemo(
    () => accounts.find(a => a.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  )

  const displayBalance = selectedAccount ? selectedAccount.balance : totalAccountBalance
  const displayAccountName = selectedAccount ? selectedAccount.name : 'All Accounts'
  const displayAccountNumber = selectedAccount?.accountNumber ? selectedAccount.accountNumber.slice(-4) : '****'

  // Monthly aggregates for current year
  const monthlyData = useMemo(() => {
    const year = new Date().getFullYear()
    return MONTHS.map((m, idx) => {
      const monthIncome = transactions
        .filter(t => {
          const d = new Date(t.date)
          return t.type === 'income' && d.getFullYear() === year && d.getMonth() === idx
        })
        .reduce((s, t) => s + t.amount, 0)

      const monthExpense = transactions
        .filter(t => {
          const d = new Date(t.date)
          return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === idx
        })
        .reduce((s, t) => s + t.amount, 0)

      return { month: m, monthIncome, monthExpense }
    })
  }, [transactions])

  const maxBar = useMemo(() => Math.max(1, ...monthlyData.map(d => Math.max(d.monthIncome, d.monthExpense))), [monthlyData])

  if (loading) return <LoadingStates.Dashboard />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-xs mt-0.5">If this keeps happening, check your network or refresh the page.</p>
            </div>
            <button onClick={fetchAllData} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Retry</button>
          </div>
        )}

        {/* TOP: KPI row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Balance */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-700 text-xs font-semibold">Available Balance</p>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-md px-2 h-8 max-w-[60%] truncate focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Select account"
              >
                <option value="">All Accounts</option>
                {accounts.map(ac => (<option key={ac.id} value={ac.id}>{ac.name}</option>))}
              </select>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">{formatINR(displayBalance)}</h2>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {displayAccountName} • **** {displayAccountNumber}
            </p>
          </div>

          {/* Net Worth */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-center">
            <p className="text-emerald-700 text-xs font-semibold mb-1">Net Worth</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{formatINR(netWorth)}</h2>
            <p className="text-xs text-gray-600 mt-1">Assets {formatINR(totalAssets)} • Liabilities {formatINR(totalLoanBalance)}</p>
          </div>

          {/* Monthly EMI */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-center">
            <p className="text-amber-700 text-xs font-semibold mb-1">Monthly EMIs</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{formatINR(totalMonthlyEMI)}</h2>
            <p className="text-xs text-gray-600 mt-1">Active Loans {activeLoans.length}</p>
          </div>

          {/* Quick Add */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-center gap-2">
            <p className="text-purple-700 text-xs font-semibold">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowIncomeModal(true)} className="text-xs text-green-700 text-center bg-green-100 border border-green-200 hover:bg-green-200 hover:shadow-sm rounded-lg px-3 py-2 transition-all">+ Income</button>
              <button onClick={() => setShowExpenseModal(true)} className="text-xs text-rose-700 text-center bg-rose-100 border border-rose-200 hover:bg-rose-200 hover:shadow-sm rounded-lg px-3 py-2 transition-all">+ Expense</button>
              <button onClick={() => setShowFDModal(true)} className="text-xs text-indigo-700 text-center bg-indigo-100 border border-indigo-200 hover:bg-indigo-200 hover:shadow-sm rounded-lg px-3 py-2 transition-all">+ FD</button>
              <button onClick={() => setShowGoldModal(true)} className="text-xs text-amber-700 text-center bg-amber-100 border border-amber-200 hover:bg-amber-200 hover:shadow-sm rounded-lg px-3 py-2 transition-all">+ Gold</button>
            </div>
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Assets Overview */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Assets Overview</h3>
              <Link href="/accounts" className="text-xs text-blue-600 hover:underline">Manage</Link>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-3">
              <Link href="/accounts" className="group rounded-xl bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 font-medium">Bank Accounts</p>
                  <span className="text-sm font-bold text-green-600">{accounts.length}</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{formatINR(totalAccountBalance)}</p>
              </Link>

              <Link href="/fds" className="group rounded-xl bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 font-medium">Fixed Deposits</p>
                  <span className="text-sm font-bold text-indigo-600">{fds.length}</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{formatINR(totalFDInvestment)}</p>
              </Link>

              <Link href="/gold" className="group rounded-xl bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 font-medium">Gold</p>
                  <span className="text-sm font-bold text-yellow-600">{Math.round(totalGoldWeight)}g</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{formatINR(totalGoldValue)}</p>
              </Link>

              <Link href="/emis" className="group rounded-xl bg-white border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-rose-400 hover:bg-rose-50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600 font-medium">Active Loans</p>
                  <span className="text-sm font-bold text-rose-600">{activeLoans.length}</span>
                </div>
                <p className="text-base font-extrabold text-gray-900">{formatINR(totalLoanBalance)}</p>
              </Link>
            </div>
            {/* tiny allocation badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Cash {formatINRCompact(totalAccountBalance)}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">FD {formatINRCompact(totalFDInvestment)}</span>
              <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Gold {formatINRCompact(totalGoldValue)}</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-1 rounded-full">Loans {formatINRCompact(totalLoanBalance)}</span>
            </div>
            </div>
          </div>

          {/* Income vs Expense (bars) */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Income & Expenses — {new Date().getFullYear()}</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-green-400 rounded-sm shadow-sm"/> 
                  <span className="font-medium text-gray-700">Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 bg-rose-400 rounded-sm shadow-sm"/> 
                  <span className="font-medium text-gray-700">Expense</span>
                </div>
              </div>
            </div>
            <div className="h-44 flex items-end justify-between gap-1.5">
              {monthlyData.map(({ month, monthIncome, monthExpense }) => {
                const hasData = monthIncome > 0 || monthExpense > 0
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex flex-col justify-end gap-1 h-40">
                      {monthExpense > 0 && (
                        <div className="relative">
                          <div
                            className="w-full bg-rose-400 hover:bg-rose-500 rounded-t transition-all cursor-pointer shadow-sm"
                            style={{ height: `${Math.max((monthExpense / maxBar) * 160, 3)}px` }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Exp: ₹{formatINR(monthExpense)}
                          </div>
                        </div>
                      )}
                      {monthIncome > 0 && (
                        <div className="relative">
                          <div
                            className="w-full bg-green-400 hover:bg-green-500 rounded-t transition-all cursor-pointer shadow-sm"
                            style={{ height: `${Math.max((monthIncome / maxBar) * 160, 3)}px` }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Inc: ₹{formatINR(monthIncome)}
                          </div>
                        </div>
                      )}
                      {!hasData && (
                        <div className="w-full h-1 bg-gray-100 rounded-sm" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{month}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-gray-600">Total Income: <strong className="text-green-600 text-sm">{formatINR(totalIncome)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse"/>
                <span className="text-gray-600">Total Expense: <strong className="text-rose-600 text-sm">{formatINR(totalExpense)}</strong></span>
              </div>
            </div>
          </div>

          {/* Loans snapshot */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Loans Snapshot</h3>
              <Link href="/emis" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="flex-1 flex items-center">
              {activeLoans.length === 0 ? (
                <div className="w-full text-center py-6 px-2 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="mx-auto w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">🎉</div>
                  <p className="text-sm font-semibold text-gray-700">Debt-free and soaring!</p>
                  <p className="text-xs text-gray-600 mt-0.5">You currently have no active EMIs.</p>
                  <div className="mt-3">
                    <Link href="/emis/new" className="text-xs text-blue-600 hover:underline">Add a loan →</Link>
                  </div>
                </div>
              ) : (
                <ul className="w-full divide-y divide-rose-100">
                  {activeLoans.slice(0,3).map(l => (
                    <li key={l.id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{l.loanName}</p>
                        <p className="text-[11px] text-gray-500">{l.lender} • EMI {formatINR(l.emiAmount)} • Balance {formatINR(l.currentBalance)}</p>
                      </div>
                      <span className="text-[11px] text-gray-600">{l.remainingEmis} EMIs</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Mutual Funds */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">Top Performing Mutual Funds</h3>
            <Link href="/mutual-funds" className="text-xs text-gray-500 hover:text-gray-900">View all</Link>
          </div>
          {mutualFunds.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold mb-1">No Mutual Funds Yet</p>
              <p className="text-gray-500 text-sm">Start investing in mutual funds to see your portfolio here</p>
              <Link href="/mutual-funds/new" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Add Mutual Fund
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutualFunds.slice(0, 6).map(mf => {
                const currentValue = mf.currentNAV ? mf.units * mf.currentNAV : mf.units * mf.avgPrice
                const returns = currentValue - mf.totalInvested
                const returnsPercent = (returns / mf.totalInvested) * 100
                const isPositive = returns >= 0

                return (
                  <div key={mf.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 p-4 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{mf.schemeName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{mf.fundHouse}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? '+' : ''}{returnsPercent.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Invested</span>
                        <span className="font-semibold text-gray-900">{formatINR(mf.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Current</span>
                        <span className="font-semibold text-gray-900">{formatINR(currentValue)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                        <span className="text-gray-600">Returns</span>
                        <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{formatINR(returns)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{mf.units.toFixed(3)} units @ ₹{mf.avgPrice.toFixed(2)}</span>
                      {mf.currentNAV && (
                        <span className="text-gray-600">NAV: ₹{mf.currentNAV.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Recent Transactions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/transactions/new" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Add</Link>
                <Link href="/transactions" className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">View All</Link>
              </div>
            </div>
            <RecentTransactionsList transactions={transactions} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-6 border-t border-gray-200 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Fire Tracker. All rights reserved.</p>
              <p className="text-gray-500 text-xs mt-0.5">Manage your finances with confidence</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/accounts" className="text-gray-600 hover:text-blue-600 text-xs font-medium">Accounts</Link>
              <Link href="/transactions" className="text-gray-600 hover:text-blue-600 text-xs font-medium">Transactions</Link>
              <Link href="/budgets" className="text-gray-600 hover:text-blue-600 text-xs font-medium">Budgets</Link>
              <Link href="/emis" className="text-gray-600 hover:text-blue-600 text-xs font-medium">EMIs</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {showIncomeModal && <TransactionModal type="income" onClose={() => setShowIncomeModal(false)} onSuccess={fetchAllData} accounts={accounts} />}
      {showExpenseModal && <TransactionModal type="expense" onClose={() => setShowExpenseModal(false)} onSuccess={fetchAllData} accounts={accounts} />}
      {showFDModal && <FDModal onClose={() => setShowFDModal(false)} onSuccess={fetchAllData} accounts={accounts} />}
      {showGoldModal && <GoldModal onClose={() => setShowGoldModal(false)} onSuccess={fetchAllData} />}
    </div>
  )
}

// --- Components --------------------------------------------------------------
function CategoryCard({ href, title, from, to, iconPath }: { href: string; title: string; from: string; to: string; iconPath: string }) {
  return (
    <Link href={href} className={`rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 bg-gradient-to-br ${from} ${to}`}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d={iconPath} /></svg>
        </div>
        <p className="text-xs font-semibold">{title}</p>
      </div>
    </Link>
  )
}

function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  const sevenDaysAgo = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d
  }, [])

  const items = useMemo(() => {
    return transactions
      .filter(t => new Date(t.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [transactions, sevenDaysAgo])

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 mb-3 text-sm">No recent transactions</p>
        <Link href="/transactions/new" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Add Transaction →</Link>
      </div>
    )
  }

  return (
    <div className="p-3">
      {/* Mobile: cards */}
      <div className="md:hidden space-y-2">
        {items.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {t.type === 'income' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{t.category}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {t.account && <span className="text-xs text-gray-500">{t.account.name}</span>}
                  {t.note && (<><span className="text-xs text-gray-300">•</span><span className="text-xs text-gray-500">{t.note}</span></>) }
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-base font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}</p>
              <p className="text-xs text-gray-500">{formatDateForDisplay(t.date)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2">Account</th>
              <th className="py-2 px-2">Note</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span>
                </td>
                <td className="py-2 px-2 font-medium text-gray-800">{t.category}</td>
                <td className="py-2 px-2 text-gray-600">{t.account?.name || '-'}</td>
                <td className="py-2 px-2 text-gray-600 truncate max-w-[240px]">{t.note || '-'}</td>
                <td className={`py-2 px-2 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}</td>
                <td className="py-2 px-2 text-gray-600">{formatDateForDisplay(t.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Modal Components --------------------------------------------------------
function TransactionModal({ type, onClose, onSuccess, accounts }: { type: 'income' | 'expense'; onClose: () => void; onSuccess: () => void; accounts: Account[] }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const categories = type === 'income' 
    ? ['Salary', 'Business', 'Investment', 'Gift', 'Other']
    : ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !date || !accountId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category,
          note: note || null,
          date,
          accountId
        })
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        alert('Failed to add transaction')
      }
    } catch (err) {
      alert('Error: ' + err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add {type === 'income' ? 'Income' : 'Expense'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Optional note"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${
                type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FDModal({ onClose, onSuccess, accounts }: { onClose: () => void; onSuccess: () => void; accounts: Account[] }) {
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [accountId, setAccountId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !rate || !startDate || !endDate || !accountId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/fds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          rate: parseFloat(rate),
          startDate,
          endDate,
          accountId
        })
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        alert('Failed to add FD')
      }
    } catch (err) {
      alert('Error: ' + err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Fixed Deposit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="7.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add FD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GoldModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [grams, setGrams] = useState('')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grams || !value || !date) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grams: parseFloat(grams),
          value: parseFloat(value),
          date
        })
      })

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        alert('Failed to add gold')
      }
    } catch (err) {
      alert('Error: ' + err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Gold</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams) *</label>
            <input
              type="number"
              step="0.001"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10.000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value (₹) *</label>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Gold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
