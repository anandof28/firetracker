'use client'

import { LoadingStates } from '@/components/LoadingComponents'
import { useEMIs } from '@/hooks/useEMIs'
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
      <div className="mb-8">
        <div style={{
          background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF1F0 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '2px solid #FFE5E5',
          boxShadow: '0 4px 12px rgba(232, 138, 138, 0.15)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #E88A8A 0%, #D97979 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(232, 138, 138, 0.3)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upcoming EMI Payments</h3>
                <p className="text-sm text-gray-600">{emis.length} payment{emis.length > 1 ? 's' : ''} due in the next 7 days</p>
              </div>
            </div>
            <Link
              href="/emis"
              style={{
                padding: '10px 20px',
                backgroundColor: '#E88A8A',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 200ms ease',
                boxShadow: '0 2px 8px rgba(232, 138, 138, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D97979';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E88A8A';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View All EMIs →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emis.slice(0, 3).map((emi: any) => {
              const daysLeft = getDaysUntilDue(emi.dueDate);
              const isUrgent = daysLeft <= 2;
              
              return (
                <div key={emi.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isUrgent ? '2px solid #E88A8A' : '1px solid #E5E7EB',
                  boxShadow: isUrgent ? '0 4px 12px rgba(232, 138, 138, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative'
                }}>
                  {isUrgent && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#E88A8A',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {daysLeft === 0 ? 'TODAY' : 'URGENT'}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{emi.loan?.loanName}</h4>
                    <p className="text-sm text-gray-600">{emi.loan?.lender}</p>
                    <p className="text-xs text-gray-500 mt-1">EMI #{emi.emiNumber}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Due Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(emi.dueDate)}</p>
                      <p className="text-xs font-medium" style={{ color: isUrgent ? '#E88A8A' : '#6B7280' }}>
                        {daysLeft === 0 ? 'Due today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleQuickPay(emi)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: isUrgent ? '#E88A8A' : '#7CC5A0',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isUrgent ? '#D97979' : '#6BB890';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isUrgent ? '#E88A8A' : '#7CC5A0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    💳 Pay Now
                  </button>
                </div>
              );
            })}
          </div>
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
              <p className="text-lg font-semibold text-gray-700">{formatCurrency(selectedEMI.emiAmount)}</p>
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
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#7CC5A0',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: (!paymentForm.accountId || !paymentForm.amountPaid) ? 'not-allowed' : 'pointer',
                  opacity: (!paymentForm.accountId || !paymentForm.amountPaid) ? 0.5 : 1,
                  transition: 'background-color 180ms cubic-bezier(.2,.8,.2,1)'
                }}
                onMouseEnter={(e) => {
                  if (paymentForm.accountId && paymentForm.amountPaid) {
                    e.currentTarget.style.backgroundColor = '#6BB890';
                  }
                }}
                onMouseLeave={(e) => {
                  if (paymentForm.accountId && paymentForm.amountPaid) {
                    e.currentTarget.style.backgroundColor = '#7CC5A0';
                  }
                }}
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
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Hero Section - Net Worth */}
        <div className="mb-6">
          <div style={{
            background: 'linear-gradient(135deg, #4169E1 0%, #5B7FE8 100%)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 24px rgba(65, 105, 225, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px' }}>TOTAL NET WORTH</span>
              </div>
              <div className="flex items-baseline gap-4">
                <h1 style={{ 
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)', 
                  fontWeight: 800, 
                  color: '#FFFFFF',
                  lineHeight: 1,
                  letterSpacing: '-0.02em'
                }}>
                  ₹{(netWorth / 100000).toFixed(2)}L
                </h1>
                <span style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                  ₹{netWorth.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '4px' }}>Assets</p>
                  <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>₹{(totalAssets / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '4px' }}>Liabilities</p>
                  <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>₹{(totalLoanBalance / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '4px' }}>Monthly Flow</p>
                  <p style={{ color: netCashFlow >= 0 ? '#7CC5A0' : '#FF6B6B', fontSize: '18px', fontWeight: 700 }}>
                    {netCashFlow >= 0 ? '+' : ''}₹{(Math.abs(netCashFlow) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '4px' }}>Monthly EMI</p>
                  <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>₹{(totalMonthlyEMI / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #A3C9A8 0%, #8FB894 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>Bank Balance</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>₹{(totalAccountBalance / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{accounts.length} active accounts</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7CC5A0 0%, #6BB890 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>Fixed Deposits</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>₹{(totalFDInvestment / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{fds.length} active FDs</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #EAC27A 0%, #D9B169 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>Gold</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>{totalGoldWeight.toFixed(0)}g</p>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>₹{(totalGoldCurrentValue / 1000).toFixed(0)}K value</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E88A8A 0%, #D97979 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>Loans</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>₹{(totalLoanBalance / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{activeLoans.length} active loans</p>
          </div>
        </div>

        {/* Quick Actions - Prominent Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <span className="text-sm text-gray-500">Manage your finances</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/accounts">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #A3C9A8 0%, #8FB894 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Accounts</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{accounts.length}</p>
                <p className="text-xs text-gray-500">View & manage</p>
              </div>
            </Link>

            <Link href="/fds">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7CC5A0 0%, #6BB890 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">FDs</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{fds.length}</p>
                <p className="text-xs text-gray-500">Fixed deposits</p>
              </div>
            </Link>

            <Link href="/gold">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #EAC27A 0%, #D9B169 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Gold</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{gold.length}</p>
                <p className="text-xs text-gray-500">Investments</p>
              </div>
            </Link>

            <Link href="/transactions">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7BAACF 0%, #6AA0C8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Transactions</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{transactions.length}</p>
                <p className="text-xs text-gray-500">Income & expense</p>
              </div>
            </Link>

            <Link href="/budgets">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #E5B8A6 0%, #D4A795 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Budgets</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{budgets.length}</p>
                <p className="text-xs text-gray-500">Spending limits</p>
              </div>
            </Link>

            <Link href="/emis">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #E88A8A 0%, #D97979 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">EMIs</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{activeLoans.length}</p>
                <p className="text-xs text-gray-500">Loan payments</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming EMIs Section */}
        <UpcomingEMIsSection />

        {/* Recent Transactions - Full Width */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                  <p className="text-sm text-gray-500 mt-1">Last 10 days activity</p>
                </div>
                <Link 
                  href="/transactions" 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {/* Account Filter Bar */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Filter by Account</h3>
                  <div className="flex gap-2">
                    {(() => {
                      const handleSelectAll = () => {
                        setSelectedAccounts(accounts.map(acc => acc.id))
                      }
                      const handleClearSelection = () => {
                        setSelectedAccounts([])
                      }
                      
                      return (
                        <>
                          <button
                            onClick={handleSelectAll}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Select All
                          </button>
                          {selectedAccounts.length > 0 && (
                            <>
                              <span className="text-xs text-gray-300">|</span>
                              <button
                                onClick={handleClearSelection}
                                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="space-y-3">
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

                  return (
                    <>
                      {/* Summary Stats */}
                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <span className="text-xs text-gray-500">Selected</span>
                          <p className="text-lg font-bold text-gray-900">{selectedAccounts.length}/{accounts.length}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Balance</span>
                          <p className="text-lg font-bold text-green-600">₹{(totalSelectedBalance / 100000).toFixed(1)}L</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Spent (7d)</span>
                          <p className="text-lg font-bold text-red-600">₹{(totalSpent / 1000).toFixed(0)}K</p>
                        </div>
                      </div>

                      {/* Account Chips */}
                      <div className="flex flex-wrap gap-2">
                        {accounts.map((account) => {
                          const isSelected = selectedAccounts.includes(account.id)
                          const isActive = activeAccounts.some(acc => acc.id === account.id)
                          
                          return (
                            <button
                              key={account.id}
                              onClick={() => handleAccountToggle(account.id)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 text-white shadow-md' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {account.name}
                              {isActive && (
                                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400"></span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
            
            {/* Transactions List */}
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
                      <Link href="/transactions" className="text-gray-700 hover:text-gray-700 text-sm font-medium mt-2 inline-block">
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
                  <div className="space-y-6">
                    {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                      <div key={date} style={{
                        borderBottom: '1px solid #F0F0F0',
                        paddingBottom: '20px'
                      }} className="last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{date}</h3>
                            <span style={{
                              padding: '3px 10px',
                              backgroundColor: '#F3F4F6',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#6B7280'
                            }}>
                              {dayTransactions.length} transaction{dayTransactions.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          {(() => {
                            const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                            const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                            const dayNet = dayIncome - dayExpense
                            
                            return (
                              <div className="flex items-center gap-3 text-sm">
                                {dayIncome > 0 && (
                                  <span className="font-semibold text-green-600">
                                    +₹{(dayIncome / 1000).toFixed(0)}K
                                  </span>
                                )}
                                {dayExpense > 0 && (
                                  <span className="font-semibold text-red-600">
                                    -₹{(dayExpense / 1000).toFixed(0)}K
                                  </span>
                                )}
                                <span className={`font-bold px-3 py-1 rounded-lg ${dayNet >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                  {dayNet >= 0 ? '+' : ''}₹{(dayNet / 1000).toFixed(0)}K
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="space-y-2">
                          {dayTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-b-0">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  <span className="text-lg">
                                    {transaction.type === 'income' ? '↗' : '↙'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">{transaction.category}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {transaction.account && (
                                      <span className="text-xs text-gray-500">{transaction.account.name}</span>
                                    )}
                                    {transaction.note && (
                                      <>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs text-gray-500 truncate">{transaction.note}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className={`text-lg font-bold ${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount / 1000).toFixed(1)}K
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(transaction.date).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {recentTransactions.length >= 15 && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <Link href="/transactions" className="text-gray-700 hover:text-gray-700 font-medium">
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
