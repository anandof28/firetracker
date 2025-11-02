'use client'

import { DataTable } from '@/components/DataTable'
import CustomDatePicker from '@/components/DatePicker'
import { NeuralNetworkLoader } from '@/components/LoadingComponents'
import PageHeader from '@/components/PageHeader'
import { tokens } from '@/design/tokens'
import { formatDateForDisplay, formatDateForInput, getToday } from '@/utils/dateHelpers'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

interface Account {
  id: string
  name: string
  balance: number
  createdAt: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  note: string | null
  date: string
  accountId: string
  account: Account
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, income, expense
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionForm, setTransactionForm] = useState({ 
    type: 'income', 
    amount: '', 
    category: '', 
    note: '', 
    date: null as Date | null,
    accountId: ''
  })

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        setError('Failed to fetch transactions')
      }
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
        // Set the first account as default if available
        if (data.length > 0 && !transactionForm.accountId) {
          setTransactionForm(prev => ({ ...prev, accountId: data[0].id }))
        }
      } else {
        setError('Failed to fetch accounts')
      }
    } catch (err) {
      setError('Failed to fetch accounts')
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [])

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transactionForm.type,
          amount: parseFloat(transactionForm.amount),
          category: transactionForm.category,
          note: transactionForm.note || null,
          date: transactionForm.date ? formatDateForInput(transactionForm.date) : formatDateForInput(getToday()),
          accountId: transactionForm.accountId,
        }),
      })
      if (response.ok) {
        fetchTransactions()
        fetchAccounts() // Refresh accounts to get updated balances
        setTransactionForm({ 
          type: 'income', 
          amount: '', 
          category: '', 
          note: '', 
          date: null,
          accountId: accounts.length > 0 ? accounts[0].id : ''
        })
        setIsModalOpen(false) // Close modal after successful creation
      } else {
        setError('Failed to create transaction')
      }
    } catch (err) {
      setError('Failed to create transaction')
    } finally {
      setFormLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchTransactions()
        fetchAccounts() // Refresh accounts to get updated balances
      } else {
        setError('Failed to delete transaction')
      }
    } catch (err) {
      setError('Failed to delete transaction')
    }
  }

  const transactionColumns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info) => {
        const type = info.getValue() as string
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              type === 'income'
                ? 'bg-green-100 text-gray-700'
                : 'bg-red-100 text-gray-700'
            }`}
          >
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (info) => (
        <span style={{ fontFamily: 'monospace', color: '#1f2937' }}>
          ₹{(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'account',
      header: 'Account',
      cell: (info) => {
        const account = info.getValue() as Account
        return (
          <div>
            <div className="font-medium text-gray-800">{account.name}</div>
            <div className="text-sm text-gray-500">₹{account.balance.toFixed(2)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => (
        <span style={{ color: '#1f2937' }}>{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: (info) => (
        <span style={{ color: '#6b7280', fontSize: '14px' }}>
          {(info.getValue() as string) || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => (
        <span style={{ color: '#1f2937' }}>
          {formatDateForDisplay(info.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: (info) => (
        <button
          onClick={() => deleteTransaction(info.getValue() as string)}
          style={{
            backgroundColor: tokens.colors.light.danger,
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 180ms cubic-bezier(.2,.8,.2,1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E57373')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = tokens.colors.light.danger)
          }
        >
          Delete
        </button>
      ),
    },
  ]

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  )

  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const netAmount = totalIncome - totalExpense

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <div className="mb-8">
          <NeuralNetworkLoader />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Transactions</h2>
          <p className="text-gray-500">Fetching your financial records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Transactions"
          description="Track your income and expenses"
          buttonText="Add Transaction"
          onButtonClick={() => setIsModalOpen(true)}
          buttonColor="primary"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards - Compact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'rgba(124, 197, 160, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #7CC5A0'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Total Income</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#7CC5A0' }}>₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(232, 138, 138, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #E88A8A'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Total Expenses</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#E88A8A' }}>₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
          <div style={{
            backgroundColor: netAmount >= 0 ? 'rgba(123, 170, 207, 0.08)' : 'rgba(229, 184, 166, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: `3px solid ${netAmount >= 0 ? '#7BAACF' : '#E5B8A6'}`
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Net Amount</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: netAmount >= 0 ? '#7BAACF' : '#E5B8A6' }}>
              ₹{netAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(163, 201, 168, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #A3C9A8'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Transactions</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#A3C9A8' }}>{transactions.length}</p>
          </div>
        </div>

        {/* Filter and Transactions Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('income')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'income' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilter('expense')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filter === 'expense' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expenses
              </button>
            </div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No transactions found. Add your first transaction above.
            </div>
          ) : (
            <DataTable
              data={filteredTransactions}
              columns={transactionColumns}
              enableSorting={true}
              enablePagination={true}
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.10)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: 'linear-gradient(135deg, #7BAACF 0%, #6AA0C8 100%)',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: '14px',
              borderTopRightRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '8px',
                  borderRadius: '10px'
                }}>
                  <svg width="20" height="20" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>Add New Transaction</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  color: '#FFFFFF',
                  backgroundColor: 'transparent',
                  padding: '6px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 180ms cubic-bezier(.2,.8,.2,1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={createTransaction} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <select
                  value={transactionForm.accountId}
                  onChange={(e) => setTransactionForm({...transactionForm, accountId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (₹{account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    No accounts available. Please create an account first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Salary, Food, Transport, Investment"
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional details"
                  value={transactionForm.note}
                  onChange={(e) => setTransactionForm({...transactionForm, note: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Date
                </label>
                <CustomDatePicker
                  selected={transactionForm.date}
                  onChange={(date) => setTransactionForm({...transactionForm, date: date})}
                  placeholder="Transaction Date (today if empty)"
                  maxDate={getToday()}
                />
              </div>
              </div>

              {/* Fixed Action Bar */}
              <div style={{
                borderTop: '1.5px solid #E5E7EB',
                padding: '16px 24px',
                backgroundColor: '#F9FAFB',
                borderBottomLeftRadius: '14px',
                borderBottomRightRadius: '14px',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px 24px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    color: '#4B5563',
                    fontSize: '15px',
                    fontWeight: 500,
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(.2,.8,.2,1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  style={{
                    flex: 1,
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: transactionForm.type === 'income' ? '#7CC5A0' : '#E88A8A',
                    border: 'none',
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    opacity: formLoading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 180ms cubic-bezier(.2,.8,.2,1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.backgroundColor = transactionForm.type === 'income' ? '#6BB890' : '#E57373';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formLoading) {
                      e.currentTarget.style.backgroundColor = transactionForm.type === 'income' ? '#7CC5A0' : '#E88A8A';
                    }
                  }}
                >
                  {formLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Add {transactionForm.type === 'income' ? 'Income' : 'Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
