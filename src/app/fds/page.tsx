'use client'

import DataGrid from '@/components/DataGrid'
import DatePicker from '@/components/DatePicker'
import { formatDateForDisplay, formatDateForInput } from '@/utils/dateHelpers'
import { calculateMaturityAmount } from '@/utils/fdUtils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

interface Account {
  id: string
  name: string
  balance: number
}

export default function FDsPage() {
  const [fds, setFds] = useState<FD[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const [fdForm, setFdForm] = useState({ 
    amount: '', 
    rate: '', 
    startDate: null as Date | null, 
    endDate: null as Date | null,
    accountId: ''
  })

  const fetchFDs = async () => {
    try {
      const response = await fetch('/api/fds')
      if (response.ok) {
        const data = await response.json()
        setFds(data)
      } else {
        setError('Failed to fetch FDs')
      }
    } catch (err) {
      setError('Failed to fetch FDs')
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      } else {
        setError('Failed to fetch accounts')
      }
    } catch (err) {
      setError('Failed to fetch accounts')
    }
  }

  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      await Promise.all([fetchFDs(), fetchAccounts()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Set default account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !fdForm.accountId) {
      setFdForm(prev => ({ ...prev, accountId: accounts[0].id }))
    }
  }, [accounts, fdForm.accountId])

  const createFD = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/fds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(fdForm.amount),
          rate: parseFloat(fdForm.rate),
          startDate: fdForm.startDate ? formatDateForInput(fdForm.startDate) : null,
          endDate: fdForm.endDate ? formatDateForInput(fdForm.endDate) : null,
          accountId: fdForm.accountId,
        }),
      })
      if (response.ok) {
        fetchFDs()
        setFdForm({ 
          amount: '', 
          rate: '', 
          startDate: null, 
          endDate: null,
          accountId: accounts.length > 0 ? accounts[0].id : ''
        })
      } else {
        setError('Failed to create FD')
      }
    } catch (err) {
      setError('Failed to create FD')
    }
  }

  const deleteFD = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FD?')) return
    
    try {
      const response = await fetch(`/api/fds/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchFDs()
      } else {
        setError('Failed to delete FD')
      }
    } catch (err) {
      setError('Failed to delete FD')
    }
  }

  // Make deleteFD available globally for AG Grid
  useEffect(() => {
    (window as any).deleteFD = deleteFD;
    return () => {
      delete (window as any).deleteFD;
    };
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading FDs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Fixed Deposits</h1>
          <p className="text-gray-600 mt-2">Track your fixed deposits and returns</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add FD Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New FD</h2>
            <form onSubmit={createFD} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter FD amount"
                  value={fdForm.amount}
                  onChange={(e) => setFdForm({...fdForm, amount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <select
                  value={fdForm.accountId}
                  onChange={(e) => setFdForm({...fdForm, accountId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - ₹{account.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 7.5"
                  value={fdForm.rate}
                  onChange={(e) => setFdForm({...fdForm, rate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={fdForm.startDate}
                  onChange={(date: Date | null) => setFdForm({...fdForm, startDate: date})}
                  placeholder="FD Start Date"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maturity Date
                </label>
                <DatePicker
                  selected={fdForm.endDate}
                  onChange={(date: Date | null) => setFdForm({...fdForm, endDate: date})}
                  placeholder="FD Maturity Date"
                  required
                  minDate={fdForm.startDate || undefined}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add FD
              </button>
            </form>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">FD Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total FDs</span>
                <span className="text-2xl font-bold text-green-600">{fds.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Invested</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{fds.reduce((sum, fd) => sum + fd.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">Est. Maturity</span>
                <span className="text-2xl font-bold text-yellow-600">
                  ₹{fds.reduce((sum, fd) => sum + calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FDs Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Fixed Deposits</h2>
          </div>
          
          {fds.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No FDs found. Add your first FD above.
            </div>
          ) : (
            <DataGrid
              rowData={fds}
              columnDefs={[
                {
                  headerName: 'Amount',
                  field: 'amount',
                  valueFormatter: (params: any) => `₹${params.value.toFixed(2)}`,
                  cellStyle: { fontFamily: 'monospace', color: '#1f2937' }
                },
                {
                  headerName: 'Rate',
                  field: 'rate',
                  width : 100,
                  valueFormatter: (params: any) => `${params.value}%`,
                  cellStyle: { textAlign: 'center', color: '#1f2937' }
                },
                {
                  headerName: 'Account',
                  field: 'account',
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
                  headerName: 'Start Date',
                  field: 'startDate',
                width : 130,
                  valueFormatter: (params: any) => formatDateForDisplay(params.value),
                  cellStyle: { color: '#1f2937' }
                },
                {
                  headerName: 'Maturity Date',
                  field: 'endDate',
                        width: 130,
                  valueFormatter: (params: any) => formatDateForDisplay(params.value),
                  cellStyle: { color: '#1f2937' }
                },
                {
                  headerName: 'Est. Maturity',
                  field: 'amount',
                  type: 'rightAligned',
                  valueFormatter: (params: any) => {
                    const maturityAmount = calculateMaturityAmount(
                      params.data.amount, 
                      params.data.rate, 
                      params.data.startDate, 
                      params.data.endDate
                    );
                    return `₹${maturityAmount.toFixed(2)}`;
                  },
                  cellStyle: { fontFamily: 'monospace', textAlign: 'right' }
                },
                {
                  headerName: 'Actions',
                  field: 'id',
                  cellRenderer: (params: any) => {
                    return (
                      <button
                        onClick={() => deleteFD(params.value)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
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
