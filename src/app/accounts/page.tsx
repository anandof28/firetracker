'use client'

import { DataTable } from '@/components/DataTable'
import { NeuralNetworkLoader } from '@/components/LoadingComponents'
import PageHeader from '@/components/PageHeader'
import { tokens } from '@/design/tokens'
import { useAuth, useUser } from '@clerk/nextjs'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const accountColumns: ColumnDef<Account>[] = [
    {
      accessorKey: 'name',
      header: 'Account Name',
      cell: (info) => (
        <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: (info) => (
        <span style={{ fontFamily: 'monospace', color: '#1f2937' }}>
          ₹{(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: (info) => (
        <button
          onClick={() => deleteAccount(info.getValue() as string)}
          style={{
            backgroundColor: tokens.colors.light.danger,
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 180ms cubic-bezier(.2,.8,.2,1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E57373'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.light.danger}
        >
          Delete
        </button>
      ),
    },
  ]

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
        setIsModalOpen(false)
      } else {
        setError('Failed to create account')
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setFormLoading(false)
    }
  }

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
        <PageHeader
          title="Bank Accounts"
          description="Manage your bank accounts and balances"
          buttonText="Add Account"
          onButtonClick={() => setIsModalOpen(true)}
          buttonColor="primary"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">

          {/* Summary Cards */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '20px 24px'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(163, 201, 168, 0.08)',
                borderRadius: '10px',
                borderLeft: '3px solid #A3C9A8'
              }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Total Accounts</div>
                <div style={{ fontSize: '26px', fontWeight: 600, color: '#A3C9A8' }}>{accounts.length}</div>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(123, 170, 207, 0.08)',
                borderRadius: '10px',
                borderLeft: '3px solid #7BAACF'
              }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Total Balance</div>
                <div style={{ fontSize: '26px', fontWeight: 600, color: '#7BAACF' }}>
                  ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div style={{
          marginTop: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid #E5E7EB'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1F2937' }}>Your Accounts</h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No accounts found. Add your first account above.
            </div>
          ) : (
            <DataTable
              data={accounts}
              columns={accountColumns}
              enableSorting={true}
              enablePagination={true}
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Add Account Modal */}
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
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '85vh',
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>Add New Account</h2>
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
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SBI Savings, HDFC Current"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      color: '#1F2937',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 180ms cubic-bezier(.2,.8,.2,1)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7BAACF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 170, 207, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
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
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      color: '#1F2937',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 180ms cubic-bezier(.2,.8,.2,1)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7BAACF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 170, 207, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
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
                    backgroundColor: '#7BAACF',
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
                    if (!formLoading) e.currentTarget.style.backgroundColor = '#6AA0C8';
                  }}
                  onMouseLeave={(e) => {
                    if (!formLoading) e.currentTarget.style.backgroundColor = '#7BAACF';
                  }}
                >
                  {formLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
