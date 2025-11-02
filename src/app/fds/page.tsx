'use client'

import { DataTable } from '@/components/DataTable'
import DatePicker from '@/components/DatePicker'
import { NeuralNetworkLoader } from '@/components/LoadingComponents'
import PageHeader from '@/components/PageHeader'
import { tokens } from '@/design/tokens'
import { formatDateForDisplay, formatDateForInput } from '@/utils/dateHelpers'
import { calculateMaturityAmount } from '@/utils/fdUtils'
import { ColumnDef } from '@tanstack/react-table'
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
  const [formLoading, setFormLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    setFormLoading(true)
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
        setIsModalOpen(false)
      } else {
        setError('Failed to create FD')
      }
    } catch (err) {
      setError('Failed to create FD')
    } finally {
      setFormLoading(false)
    }
  }

  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [selectedFD, setSelectedFD] = useState<FD | null>(null)
  const [selectedAccountForClose, setSelectedAccountForClose] = useState('')

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

  const openCloseModal = (fd: FD) => {
    setSelectedFD(fd)
    setSelectedAccountForClose(accounts[0]?.id || '')
    setCloseModalOpen(true)
  }

  const fdColumns: ColumnDef<FD>[] = [
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
      accessorKey: 'rate',
      header: 'Rate',
      cell: (info) => (
        <span style={{ textAlign: 'center', color: '#1f2937' }}>
          {info.getValue() as number}%
        </span>
      ),
    },
    {
      accessorKey: 'account',
      header: 'Account',
      cell: (info) => {
        const account = info.getValue() as FD['account']
        return (
          <div>
            <div className="font-medium text-gray-800">{account.name}</div>
            <div className="text-sm text-gray-500">₹{account.balance.toFixed(2)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: (info) => (
        <span style={{ color: '#1f2937' }}>
          {formatDateForDisplay(info.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'Maturity Date',
      cell: (info) => (
        <span style={{ color: '#1f2937' }}>
          {formatDateForDisplay(info.getValue() as string)}
        </span>
      ),
    },
    {
      id: 'maturity',
      header: 'Est. Maturity',
      cell: (info) => {
        const fd = info.row.original
        const maturityAmount = calculateMaturityAmount(
          fd.amount,
          fd.rate,
          fd.startDate,
          fd.endDate
        )
        return (
          <span style={{ fontFamily: 'monospace', textAlign: 'right' }}>
            ₹{maturityAmount.toFixed(2)}
          </span>
        )
      },
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: (info) => {
        const fd = info.row.original
        return (
          <div className="flex gap-2">
            <button
              onClick={() => openCloseModal(fd)}
              style={{
                backgroundColor: tokens.colors.light.success,
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 180ms cubic-bezier(.2,.8,.2,1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3CA86C')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = tokens.colors.light.success)
              }
            >
              Close FD
            </button>
            <button
              onClick={() => deleteFD(info.getValue() as string)}
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
          </div>
        )
      },
    },
  ]

  const closeFD = async () => {
    if (!selectedFD || !selectedAccountForClose) return
    
    setFormLoading(true)
    try {
      const maturityAmount = calculateMaturityAmount(
        selectedFD.amount,
        selectedFD.rate,
        selectedFD.startDate,
        selectedFD.endDate
      )

      const response = await fetch(`/api/fds/${selectedFD.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountForClose,
          maturityAmount
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const interestEarned = maturityAmount - selectedFD.amount
        alert(`✅ FD Closed Successfully!\n\n💰 Maturity Amount: ₹${maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n📈 Interest Earned: ₹${interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n\n✅ Amount credited to account\n✅ Transaction recorded in your transactions list\n\nCheck the Transactions page to see the details!`)
        setCloseModalOpen(false)
        setSelectedFD(null)
        fetchFDs()
        fetchAccounts()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to close FD')
      }
    } catch (err) {
      setError('Failed to close FD')
    } finally {
      setFormLoading(false)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="mb-8">
          <NeuralNetworkLoader />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Fixed Deposits</h2>
          <p className="text-gray-500">Calculating your investment returns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Fixed Deposits"
          description="Track your fixed deposits and returns"
          buttonText="Add FD"
          onButtonClick={() => setIsModalOpen(true)}
          buttonColor="primary"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards - Compact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'rgba(124, 197, 160, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #7CC5A0'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Total FDs</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#7CC5A0' }}>{fds.length}</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(123, 170, 207, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #7BAACF'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Total Invested</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#7BAACF' }}>
              ₹{fds.reduce((sum, fd) => sum + fd.amount, 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(234, 194, 122, 0.08)',
            borderRadius: '10px',
            padding: '16px',
            borderLeft: '3px solid #EAC27A'
          }}>
            <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, marginBottom: '6px' }}>Est. Maturity Value</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: '#EAC27A' }}>
              ₹{fds.reduce((sum, fd) => sum + calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate), 0).toLocaleString('en-IN')}
            </p>
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
            <DataTable
              data={fds}
              columns={fdColumns}
              enableSorting={true}
              enablePagination={true}
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Close FD Modal */}
      {closeModalOpen && selectedFD && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Close Fixed Deposit</h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">FD Details</p>
              <p className="font-medium text-gray-800">Principal: ₹{selectedFD.amount.toLocaleString('en-IN')}</p>
              <p className="font-medium text-gray-800">Rate: {selectedFD.rate}%</p>
              <p className="font-medium text-gray-800">Start: {formatDateForDisplay(selectedFD.startDate)}</p>
              <p className="font-medium text-gray-800">Maturity: {formatDateForDisplay(selectedFD.endDate)}</p>
              <p className="font-bold text-gray-700 mt-2 text-lg">
                Maturity Amount: ₹{calculateMaturityAmount(
                  selectedFD.amount,
                  selectedFD.rate,
                  selectedFD.startDate,
                  selectedFD.endDate
                ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Interest Earned: ₹{(calculateMaturityAmount(
                  selectedFD.amount,
                  selectedFD.rate,
                  selectedFD.startDate,
                  selectedFD.endDate
                ) - selectedFD.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Account to Credit Amount
              </label>
              <select
                value={selectedAccountForClose}
                onChange={(e) => setSelectedAccountForClose(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (₹{account.balance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The maturity amount will be added to this account
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCloseModalOpen(false)
                  setSelectedFD(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                onClick={closeFD}
                disabled={formLoading || !selectedAccountForClose}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {formLoading ? 'Closing...' : 'Close FD'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add FD Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Add New Fixed Deposit</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <form onSubmit={createFD} className="p-6 space-y-4">
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
                  {accounts.length === 0 && (
                    <p className="text-sm text-gray-700 mt-1">
                      No accounts available. Please create an account first.
                    </p>
                  )}
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
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="flex-1 p-3 rounded-md transition-all font-medium text-white flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {formLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    Add FD
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
