'use client'

import DataGrid from '@/components/DataGrid'
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { AILoadingOrb, NeuralNetworkLoader } from '@/components/LoadingComponents'

interface Account {
  id: string
  name: string
  balance: number
  createdAt: string
}

export default function AccountsPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const [accountForm, setAccountForm] = useState({ name: '', balance: '' })
  const [formLoading, setFormLoading] = useState(false)

  const fetchAccounts = async () => {
    if (!isSignedIn) {
      setError('Please sign in to view accounts')
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched accounts data:', data)
        setAccounts(data)
      } else {
        if (response.status === 401) {
          setError('Please sign in to view accounts')
        } else {
          setError('Failed to fetch accounts')
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (isLoaded) {
      fetchAccounts()
    }
  }, [isLoaded, isSignedIn])

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountForm.name,
          balance: parseFloat(accountForm.balance),
        }),
      })
      if (response.ok) {
        fetchAccounts()
        setAccountForm({ name: '', balance: '' })
      } else {
        setError('Failed to create account')
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setFormLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchAccounts()
      } else {
        setError('Failed to delete account')
      }
    } catch (err) {
      setError('Failed to delete account')
    }
  }

  // Make deleteAccount available globally for AG Grid
  useEffect(() => {
    (window as any).deleteAccount = deleteAccount;
    return () => {
      delete (window as any).deleteAccount;
    };
  }, []);

  if (!mounted || !isLoaded || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mb-8">
          <NeuralNetworkLoader />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Accounts</h2>
          <p className="text-gray-500">Fetching your financial data...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your accounts.</p>
          <a 
            href="/sign-in" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bank Accounts</h1>
          <p className="text-gray-600 mt-2">Manage your bank accounts and balances</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Account Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., SBI Savings, HDFC Current"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter current balance"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({...accountForm, balance: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none"
              >
                {formLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Add Account
              </button>
            </form>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Accounts</span>
                <span className="text-2xl font-bold text-green-600">{accounts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Balance</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Accounts</h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No accounts found. Add your first account above.
            </div>
          ) : (
            <DataGrid
              rowData={accounts}
              getRowId={(params) => params.data.id}
              onGridReady={(params) => {
                  params.api.sizeColumnsToFit();
              }}
              columnDefs={[
                {
                  headerName: 'Account Name',
                  field: 'name',
                  flex: 2,
                  cellStyle: { fontWeight: 'bold', color: '#1f2937' }
                },
                {
                  headerName: 'Balance',
                  field: 'balance',
                  flex: 1,
                  type: 'rightAligned',
                  valueFormatter: (params: any) => `₹${params.value.toFixed(2)}`,
                  cellStyle: { fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }
                },
                {
                  headerName: 'Actions',
                  field: 'id',
                  width: 120,
                  cellRenderer: (params: any) => {
                    return (
                      <button
                        onClick={() => deleteAccount(params.value)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
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
