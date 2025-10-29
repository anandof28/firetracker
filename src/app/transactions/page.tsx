'use client'

import DataGrid from '@/components/DataGrid'
import CustomDatePicker from '@/components/DatePicker'
import { formatDateForDisplay, formatDateForInput, getToday } from '@/utils/dateHelpers'
import { useEffect, useState } from 'react'
import { AILoadingOrb, NeuralNetworkLoader } from '@/components/LoadingComponents'

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

  // Make deleteTransaction available globally for AG Grid
  useEffect(() => {
    (window as any).deleteTransaction = deleteTransaction;
    return () => {
      delete (window as any).deleteTransaction;
    };
  }, []);

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-2">Track your income and expenses</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Transaction Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Transaction</h2>
            <form onSubmit={createTransaction} className="space-y-4">
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
                  <p className="text-sm text-red-600 mt-1">
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
              <button 
                type="submit" 
                disabled={formLoading}
                className={`w-full p-3 rounded-md transition-all font-medium text-white flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  transactionForm.type === 'income' 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
              >
                {formLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Add {transactionForm.type === 'income' ? 'Income' : 'Expense'}
              </button>
            </form>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Income</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalIncome.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Expenses</span>
                <span className="text-2xl font-bold text-red-600">
                  ₹{totalExpense.toFixed(2)}
                </span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                netAmount >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <span className="text-gray-700 font-medium">Net Amount</span>
                <span className={`text-2xl font-bold ${
                  netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  ₹{netAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Transactions</span>
                <span className="text-2xl font-bold text-gray-600">{transactions.length}</span>
              </div>
            </div>
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
            <DataGrid
              rowData={filteredTransactions}
              columnDefs={[
                {
                  headerName: 'Type',
                  field: 'type',
                  width: 120,
                  cellRenderer: (params: any) => {
                    const type = params.value;
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type}
                      </span>
                    );
                  }
                },
                {
                  headerName: 'Amount',
                  field: 'amount',
                  width: 140,
                  type: 'rightAligned',
                  valueFormatter: (params: any) => `₹${params.value.toFixed(2)}`,
                  cellStyle: { fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }
                },
                {
                  headerName: 'Account',
                  field: 'account',
                  width: 180,
                  cellRenderer: (params: any) => {
                    const account = params.value;
                    return (
                      <div>
                        <div className="font-medium text-gray-800">{account.name}</div>
                        <div className="text-sm text-gray-500">₹{account.balance.toFixed(2)}</div>
                      </div>
                    );
                  }
                },
                {
                  headerName: 'Category',
                  field: 'category',
                  width: 150,
                  cellStyle: { color: '#1f2937' }
                },
                {
                  headerName: 'Note',
                  field: 'note',
                  flex: 1,
                  valueFormatter: (params: any) => params.value || '-',
                  cellStyle: { color: '#6b7280', fontSize: '14px' }
                },
                {
                  headerName: 'Date',
                  field: 'date',
                  width: 130,
                  valueFormatter: (params: any) => formatDateForDisplay(params.value),
                  cellStyle: { color: '#1f2937' }
                },
                {
                  headerName: 'Actions',
                  field: 'id',
                  width: 100,
                  cellRenderer: (params: any) => {
                    return (
                      <button 
                        onClick={() => deleteTransaction(params.value)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Delete
                      </button>
                    );
                  },
                  sortable: false,
                  filter: false
                }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
