'use client'

import { DataTable } from '@/components/DataTable'
import DatePicker from '@/components/DatePicker'
import { NeuralNetworkLoader } from '@/components/LoadingComponents'
import PageHeader from '@/components/PageHeader'
import { tokens } from '@/design/tokens'
import { formatDateForDisplay, formatDateForInput, getToday } from '@/utils/dateHelpers'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

interface Gold {
  id: string
  grams: number
  value: number
  date: string
}

export default function GoldPage() {
  const [gold, setGold] = useState<Gold[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentGoldRate, setCurrentGoldRate] = useState('')
  const [goldForm, setGoldForm] = useState({ 
    grams: '', 
    value: '', 
    date: null as Date | null 
  })

  const fetchGold = async () => {
    try {
      const response = await fetch('/api/gold')
      if (response.ok) {
        const data = await response.json()
        setGold(data)
      } else {
        setError('Failed to fetch gold records')
      }
    } catch (err) {
      setError('Failed to fetch gold records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGold()
    // Set a default current gold rate (you can update this manually or fetch from an API)
    setCurrentGoldRate('9290') // Default rate per gram in INR
  }, [])

  const createGold = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const response = await fetch('/api/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grams: parseFloat(goldForm.grams),
          value: parseFloat(goldForm.value),
          date: goldForm.date ? formatDateForInput(goldForm.date) : formatDateForInput(getToday()),
        }),
      })
      if (response.ok) {
        fetchGold()
        setGoldForm({ grams: '', value: '', date: null })
        setIsModalOpen(false)
      } else {
        setError('Failed to create gold record')
      }
    } catch (err) {
      setError('Failed to create gold record')
    } finally {
      setFormLoading(false)
    }
  }

  const deleteGold = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gold record?')) return
    
    try {
      const response = await fetch(`/api/gold/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchGold()
      } else {
        setError('Failed to delete gold record')
      }
    } catch (err) {
      setError('Failed to delete gold record')
    }
  }

  const calculateRatePerGram = (value: number, grams: number) => {
    return value / grams
  }

  const goldColumns: ColumnDef<Gold>[] = [
    {
      accessorKey: 'grams',
      header: 'Weight',
      cell: (info) => (
        <span style={{ fontFamily: 'monospace', color: '#1f2937' }}>
          {(info.getValue() as number).toFixed(3)}g
        </span>
      ),
    },
    {
      accessorKey: 'value',
      header: 'Purchase Value',
      cell: (info) => (
        <span style={{ fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }}>
          ₹{(info.getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'rate',
      header: 'Purchase Rate/g',
      cell: (info) => {
        const gold = info.row.original
        const rate = calculateRatePerGram(gold.value, gold.grams)
        return (
          <span style={{ fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }}>
            ₹{rate.toFixed(2)}
          </span>
        )
      },
    },
    ...(currentGoldRate
      ? [
          {
            id: 'currentValue' as const,
            header: 'Current Value',
            cell: (info: any) => {
              const gold = info.row.original as Gold
              const currentValue = gold.grams * parseFloat(currentGoldRate)
              const profit = currentValue - gold.value
              return (
                <div className="text-right font-mono">
                  <div className="text-gray-800">₹{currentValue.toFixed(2)}</div>
                  <div
                    className={`text-xs ${profit > 0 ? 'text-gray-700' : 'text-gray-700'}`}
                  >
                    {profit > 0 ? '+' : ''}
                    {profit.toFixed(2)}
                  </div>
                </div>
              )
            },
          },
        ]
      : []),
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
          onClick={() => deleteGold(info.getValue() as string)}
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="mb-8">
          <NeuralNetworkLoader />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Gold Investments</h2>
          <p className="text-gray-500">Calculating precious metal portfolios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Gold Investments"
          description="Track your gold purchases and current value"
          buttonText="Add Gold"
          onButtonClick={() => setIsModalOpen(true)}
          buttonColor="secondary"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Current Gold Rate - Compact */}
        <div className="bg-gradient-linear-to-r from-amber-50 to-amber-100 rounded-lg p-3 mb-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-amber-700 mb-1">
                Current Gold Rate (₹/gram)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter rate"
                value={currentGoldRate}
                onChange={(e) => setCurrentGoldRate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-amber-300 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            {currentGoldRate && (
              <div className="flex gap-2 text-xs">
                <div className="bg-white rounded px-2 py-1 border border-amber-200">
                  <div className="font-bold text-amber-700">₹{parseFloat(currentGoldRate).toFixed(0)}</div>
                  <div className="text-gray-500">1g</div>
                </div>
                <div className="bg-white rounded px-2 py-1 border border-amber-200">
                  <div className="font-bold text-amber-700">₹{(parseFloat(currentGoldRate) * 10).toFixed(0)}</div>
                  <div className="text-gray-500">10g</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards - Compact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'rgba(234, 194, 122, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            borderLeft: '3px solid #EAC27A'
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Purchases</p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#EAC27A' }}>{gold.length}</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(229, 184, 166, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            borderLeft: '3px solid #E5B8A6'
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Total Weight</p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#E5B8A6' }}>{gold.reduce((sum, g) => sum + g.grams, 0).toFixed(2)}g</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(124, 197, 160, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            borderLeft: '3px solid #7CC5A0'
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Purchase Value</p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#7CC5A0' }}>₹{gold.reduce((sum, g) => sum + g.value, 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
          </div>
          {currentGoldRate && gold.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(123, 170, 207, 0.08)',
              borderRadius: '10px',
              padding: '12px',
              borderLeft: '3px solid #7BAACF'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Current Value</p>
              <p style={{ fontSize: '20px', fontWeight: 600, color: '#7BAACF' }}>
                ₹{(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)).toLocaleString('en-IN', {maximumFractionDigits: 0})}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Summary Card */}
          <div className="hidden">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Purchases</span>
                <span className="text-2xl font-bold text-gray-700">{gold.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Weight</span>
                <span className="text-2xl font-bold text-gray-700">
                  {gold.reduce((sum, g) => sum + g.grams, 0).toFixed(3)}g
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Purchase Value</span>
                <span className="text-2xl font-bold text-gray-700">
                  ₹{gold.reduce((sum, g) => sum + g.value, 0).toFixed(2)}
                </span>
              </div>
              {currentGoldRate && gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Current Market Value</span>
                  <span className="text-2xl font-bold text-gray-700">
                    ₹{(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)).toFixed(2)}
                  </span>
                </div>
              )}
              {currentGoldRate && gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    {(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) > gold.reduce((sum, g) => sum + g.value, 0) ? 'Profit' : 'Loss'}
                  </span>
                  <span className={`text-2xl font-bold ${(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) > gold.reduce((sum, g) => sum + g.value, 0) ? 'text-gray-700' : 'text-gray-700'}`}>
                    ₹{Math.abs((gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) - gold.reduce((sum, g) => sum + g.value, 0)).toFixed(2)}
                  </span>
                </div>
              )}
              {gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Avg. Rate/g</span>
                  <span className="text-2xl font-bold text-gray-700">
                    ₹{(gold.reduce((sum, g) => sum + g.value, 0) / gold.reduce((sum, g) => sum + g.grams, 0)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gold Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Gold Purchase History</h2>
          </div>
          
          {gold.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No gold purchases found. Add your first purchase above.
            </div>
          ) : (
            <DataTable
              data={gold}
              columns={goldColumns}
              enableSorting={true}
              enablePagination={true}
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Add Gold Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-linear-to-r from-yellow-600 to-yellow-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Add Gold Purchase</h2>
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
              <form onSubmit={createGold} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (Grams)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Enter weight in grams"
                    value={goldForm.grams}
                    onChange={(e) => {
                      const newGrams = e.target.value
                      setGoldForm({...goldForm, grams: newGrams})
                      
                      // Auto-calculate value if current rate is available and we have grams
                      if (currentGoldRate && newGrams) {
                        const calculatedValue = (parseFloat(newGrams) * parseFloat(currentGoldRate)).toFixed(2)
                        setGoldForm(prev => ({...prev, grams: newGrams, value: calculatedValue}))
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Value (₹)
                    {currentGoldRate && goldForm.grams && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Auto-calculated: ₹{(parseFloat(goldForm.grams) * parseFloat(currentGoldRate)).toFixed(2)})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter total purchase value"
                    value={goldForm.value}
                    onChange={(e) => setGoldForm({...goldForm, value: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {currentGoldRate && goldForm.grams 
                      ? "Value auto-calculated based on current rate (you can modify if needed)" 
                      : "Enter the actual purchase value"
                    }
                  </p>
                </div>
                {goldForm.grams && goldForm.value && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Rate per gram:</div>
                    <div className="text-lg font-semibold text-gray-700">
                      ₹{calculateRatePerGram(parseFloat(goldForm.value), parseFloat(goldForm.grams)).toFixed(2)}/g
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date
                  </label>
                  <DatePicker
                    selected={goldForm.date}
                    onChange={(date: Date | null) => setGoldForm({...goldForm, date: date})}
                    placeholder="Purchase Date (today if empty)"
                    maxDate={getToday()}
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
                    className="flex-1 p-3 rounded-md transition-all font-medium text-white flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                  >
                    {formLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    Add Gold Purchase
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
