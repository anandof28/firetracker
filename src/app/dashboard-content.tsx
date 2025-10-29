'use client'

import { formatDateForDisplay } from '@/utils/dateHelpers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useEMIs } from '@/hooks/useEMIs'
import { LoadingStates } from '@/components/LoadingComponents'

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
  tenureMonths: number // matches Prisma schema
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

interface EMIPayment {
  id: string
  loanId: string
  emiNumber: number
  dueDate: string
  paidDate?: string
  emiAmount: number
  principalAmount: number
  interestAmount: number
  amountPaid?: number
  paymentMode?: string
  transactionId?: string
  status: string // "pending", "paid", "overdue", "partial"
  lateFee?: number
  prepaymentAmount?: number
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

// Upcoming EMIs Component
function UpcomingEMIsSection() {
  const { emis, loading, fetchEMIs, recordPayment } = useEMIs();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    accountId: '',
    paymentMode: 'bank_transfer',
    description: '',
  });

  useEffect(() => {
    // Fetch upcoming EMIs (next 7 days)
    fetchEMIs({ upcoming: true, limit: 5 });
    fetchAccounts();
  }, [fetchEMIs]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const accountsData = await response.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleQuickPay = (emi: any) => {
    setSelectedEMI(emi);
    setPaymentForm({
      amountPaid: emi.emiAmount,
      accountId: '',
      paymentMode: 'bank_transfer',
      description: `EMI Payment - ${emi.loan?.loanName}`,
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedEMI || !paymentForm.accountId) return;
    
    try {
      await recordPayment({
        emiId: selectedEMI.id,
        ...paymentForm,
      });
      setShowPaymentModal(false);
      setSelectedEMI(null);
      // Refresh EMIs
      fetchEMIs({ upcoming: true, limit: 5 });
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return null;
  if (!emis || emis.length === 0) return null;

  return (
    <>
      {/* Upcoming EMIs Alert Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-orange-800">Upcoming EMI Payments</h3>
              <p className="text-orange-700">You have {emis.length} EMI payment{emis.length > 1 ? 's' : ''} due soon</p>
            </div>
          </div>
          <Link
            href="/emis"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            View All EMIs
          </Link>
        </div>
        
        <div className="mt-4 space-y-3">
          {emis.slice(0, 3).map((emi: any) => {
            const daysLeft = getDaysUntilDue(emi.dueDate);
            return (
              <div key={emi.id} className="bg-white rounded-lg p-4 shadow-sm border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{emi.loan?.loanName}</h4>
                    <p className="text-sm text-gray-600">{emi.loan?.lender} • EMI #{emi.emiNumber}</p>
                    <p className="text-sm text-orange-600 font-medium">
                      Due: {formatDate(emi.dueDate)}
                      {daysLeft === 0 ? ' (Today!)' : daysLeft === 1 ? ' (Tomorrow)' : ` (${daysLeft} days)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                    <button
                      onClick={() => handleQuickPay(emi)}
                      className="mt-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Quick Pay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Payment Modal */}
      {showPaymentModal && selectedEMI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick EMI Payment</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">{selectedEMI.loan?.loanName}</p>
              <p className="text-sm text-gray-600">EMI #{selectedEMI.emiNumber}</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(selectedEMI.emiAmount)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Account *</label>
                <select
                  value={paymentForm.accountId}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (₹{account.balance?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitPayment}
                disabled={!paymentForm.accountId || !paymentForm.amountPaid}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay EMI
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedEMI(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardContent() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fds, setFds] = useState<FD[]>([])
  const [gold, setGold] = useState<Gold[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
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
      const [accountsRes, fdsRes, goldRes, transactionsRes, budgetsRes, loansRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/gold'),
        fetch('/api/transactions'),
        fetch('/api/budgets'),
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
      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json()
        setBudgets(budgetsData)
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

  // Loan calculation functions
  const calculateEMI = (principal: number, rate: number, tenureMonths: number) => {
    const monthlyRate = rate / (12 * 100)
    if (monthlyRate === 0) return principal / tenureMonths
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
           (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  }

  const calculateRemainingBalance = (principal: number, rate: number, tenureMonths: number, paidEMIs: number) => {
    if (paidEMIs >= tenureMonths) return 0
    const monthlyRate = rate / (12 * 100)
    if (monthlyRate === 0) return principal - (principal / tenureMonths * paidEMIs)
    
    const emi = calculateEMI(principal, rate, tenureMonths)
    return principal * Math.pow(1 + monthlyRate, paidEMIs) - 
           emi * ((Math.pow(1 + monthlyRate, paidEMIs) - 1) / monthlyRate)
  }

  const calculateLoanProgress = (loan: Loan) => {
    const currentDate = new Date()
    const startDate = new Date(loan.startDate)
    const monthsElapsed = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    
    // Calculate theoretical remaining balance based on time elapsed
    const theoreticalBalance = calculateRemainingBalance(loan.principalAmount, loan.interestRate, loan.tenureMonths, monthsElapsed)
    
    return {
      monthsElapsed,
      theoreticalBalance,
      actualBalance: loan.currentBalance,
      progressPercentage: ((loan.principalAmount - loan.currentBalance) / loan.principalAmount) * 100,
      isOnTrack: loan.currentBalance <= theoreticalBalance * 1.05 // 5% tolerance
    }
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

  // Loan calculations with proper interest calculations
  const activeLoans = loans.filter(loan => loan.isActive)
  
  // Calculate accurate loan statistics
  const loansWithCalculations = activeLoans.map(loan => {
    const progress = calculateLoanProgress(loan)
    const calculatedEMI = calculateEMI(loan.principalAmount, loan.interestRate, loan.tenureMonths)
    
    return {
      ...loan,
      calculatedEMI,
      progress,
      // Use theoretical balance if current balance seems incorrect
      correctedBalance: progress.isOnTrack ? loan.currentBalance : progress.theoreticalBalance
    }
  })

  const totalLoanBalance = loansWithCalculations.reduce((sum, loan) => sum + loan.correctedBalance, 0)
  const totalMonthlyEMI = loansWithCalculations.reduce((sum, loan) => sum + loan.calculatedEMI, 0)
  const totalLoanPrincipal = activeLoans.reduce((sum, loan) => sum + loan.principalAmount, 0)
  const totalInterestToBePaid = loansWithCalculations.reduce((sum, loan) => {
    return sum + (loan.calculatedEMI * loan.tenureMonths - loan.principalAmount)
  }, 0)

  const totalAssets = totalAccountBalance + totalFDInvestment + totalGoldCurrentValue
  const netWorth = totalAssets - totalLoanBalance

  if (loading) {
    return <LoadingStates.Dashboard />
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 lg:p-6">
            <h3 className="text-blue-100 text-xs lg:text-sm font-medium mb-2">Net Worth</h3>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 break-words leading-tight">₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-blue-100 text-xs">Total Value</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-4 lg:p-6">
            <h3 className="text-green-100 text-xs lg:text-sm font-medium mb-2">Net Cash Flow</h3>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 break-words leading-tight">₹{netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-green-100 text-xs">Monthly Flow</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-4 lg:p-6">
            <h3 className="text-purple-100 text-xs lg:text-sm font-medium mb-2">Bank Balance</h3>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 break-words leading-tight">₹{totalAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-purple-100 text-xs">{accounts.length} accounts</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-4 lg:p-6">
            <h3 className="text-yellow-100 text-xs lg:text-sm font-medium mb-2">Gold Holdings</h3>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 leading-tight">{totalGoldWeight.toFixed(1)}g</p>
            <p className="text-yellow-100 text-xs">₹{totalGoldCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} value</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-4 lg:p-6">
            <h3 className="text-red-100 text-xs lg:text-sm font-medium mb-2">Loan Debt</h3>
            <p className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 break-words leading-tight">₹{totalLoanBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="text-red-100 text-xs">{activeLoans.length} active loans</p>
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

        {/* Upcoming EMIs Section */}
        <UpcomingEMIsSection />

        {/* Loan Overview Section */}
        {loans.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Loan Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-red-800 font-medium mb-2">Total Outstanding</h3>
                <p className="text-2xl font-bold text-red-600">
                  ₹{totalLoanBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-red-600">Calculated Balance</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-orange-800 font-medium mb-2">Monthly EMI</h3>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{totalMonthlyEMI.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-orange-600">Calculated EMI</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-purple-800 font-medium mb-2">Total Interest</h3>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{totalInterestToBePaid.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-purple-600">Over loan tenure</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-blue-800 font-medium mb-2">Active Loans</h3>
                <p className="text-2xl font-bold text-blue-600">{activeLoans.length}</p>
                <p className="text-xs text-blue-600">Currently active</p>
              </div>
            </div>
            
            {/* Loan Details */}
            <div className="space-y-4">
              {loansWithCalculations.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{loan.loanName}</h4>
                      <p className="text-sm text-gray-600 capitalize">{loan.loanType} Loan</p>
                      {!loan.progress.isOnTrack && (
                        <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⚠️ Calculation mismatch detected
                        </span>
                      )}
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Principal Amount</p>
                      <p className="font-medium">₹{loan.principalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Calculated Balance</p>
                      <p className="font-medium text-red-600">₹{loan.correctedBalance.toLocaleString('en-IN')}</p>
                      {loan.correctedBalance !== loan.currentBalance && (
                        <p className="text-xs text-gray-500">Stored: ₹{loan.currentBalance.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-medium">{loan.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Calculated EMI</p>
                      <p className="font-medium">₹{loan.calculatedEMI.toLocaleString('en-IN')}</p>
                      {Math.abs(loan.calculatedEMI - loan.emiAmount) > 100 && (
                        <p className="text-xs text-gray-500">Stored: ₹{loan.emiAmount.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Months Elapsed</p>
                      <p className="font-medium">{loan.progress.monthsElapsed} / {loan.tenureMonths}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar showing loan completion */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Repayment Progress</span>
                      <span>{loan.progress.progressPercentage.toFixed(1)}% completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${loan.progress.isOnTrack ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min(loan.progress.progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Additional loan insights */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs text-gray-600">
                      <div>
                        <p>Total Interest: <span className="font-medium">₹{(loan.calculatedEMI * loan.tenureMonths - loan.principalAmount).toLocaleString('en-IN')}</span></p>
                      </div>
                      <div>
                        <p>Remaining EMIs: <span className="font-medium">{Math.max(0, loan.tenureMonths - loan.progress.monthsElapsed)}</span></p>
                      </div>
                      <div>
                        <p>Status: <span className={`font-medium ${loan.progress.isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
                          {loan.progress.isOnTrack ? 'On Track' : 'Needs Review'}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
