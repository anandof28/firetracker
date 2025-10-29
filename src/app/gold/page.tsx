'use client'

import DataGrid from '@/components/DataGrid'
import DatePicker from '@/components/DatePicker'
import { formatDateForDisplay, formatDateForInput, getToday } from '@/utils/dateHelpers'
import { useEffect, useState } from 'react'
import { AILoadingOrb, NeuralNetworkLoader } from '@/components/LoadingComponents'

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

  // Make deleteGold available globally for AG Grid
  useEffect(() => {
    (window as any).deleteGold = deleteGold;
    return () => {
      delete (window as any).deleteGold;
    };
  }, []);

  const calculateRatePerGram = (value: number, grams: number) => {
    return value / grams
  }

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gold Investments</h1>
          <p className="text-gray-600 mt-2">Track your gold purchases and current value</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Gold Rate & Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Gold Rate & Calculator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Gold Rate (₹ per gram)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter current gold rate"
                  value={currentGoldRate}
                  onChange={(e) => setCurrentGoldRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Update this with today's market rate</p>
              </div>

              {currentGoldRate && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-sm text-gray-600 mb-2">Quick Calculator:</div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-yellow-700">₹{(parseFloat(currentGoldRate) * 1).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">1 gram</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-700">₹{(parseFloat(currentGoldRate) * 10).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">10 grams</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                💡 Tip: Enter your historical gold purchases below. The system will track your purchase value and show current market value based on today's rate.
              </div>
            </div>
          </div>

          {/* Add Gold Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Gold Purchase</h2>
            <form onSubmit={createGold} className="space-y-4">
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
                  <div className="text-lg font-semibold text-blue-700">
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
              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-3 rounded-md hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none"
              >
                {formLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Add Gold Purchase
              </button>
            </form>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gold Portfolio</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Purchases</span>
                <span className="text-2xl font-bold text-yellow-600">{gold.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Weight</span>
                <span className="text-2xl font-bold text-orange-600">
                  {gold.reduce((sum, g) => sum + g.grams, 0).toFixed(3)}g
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Purchase Value</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{gold.reduce((sum, g) => sum + g.value, 0).toFixed(2)}
                </span>
              </div>
              {currentGoldRate && gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Current Market Value</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    ₹{(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)).toFixed(2)}
                  </span>
                </div>
              )}
              {currentGoldRate && gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    {(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) > gold.reduce((sum, g) => sum + g.value, 0) ? 'Profit' : 'Loss'}
                  </span>
                  <span className={`text-2xl font-bold ${(gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) > gold.reduce((sum, g) => sum + g.value, 0) ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs((gold.reduce((sum, g) => sum + g.grams, 0) * parseFloat(currentGoldRate)) - gold.reduce((sum, g) => sum + g.value, 0)).toFixed(2)}
                  </span>
                </div>
              )}
              {gold.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Avg. Rate/g</span>
                  <span className="text-2xl font-bold text-blue-600">
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
            <DataGrid
              rowData={gold}
              columnDefs={[
                {
                  headerName: 'Weight',
                  field: 'grams',
                  width: 120,
                  valueFormatter: (params: any) => `${params.value.toFixed(3)}g`,
                  cellStyle: { fontFamily: 'monospace', color: '#1f2937' }
                },
                {
                  headerName: 'Purchase Value',
                  field: 'value',
                  width: 150,
                  type: 'rightAligned',
                  valueFormatter: (params: any) => `₹${params.value.toFixed(2)}`,
                  cellStyle: { fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }
                },
                {
                  headerName: 'Purchase Rate/g',
                  field: 'value',
                  width: 150,
                  type: 'rightAligned',
                  valueFormatter: (params: any) => {
                    const rate = calculateRatePerGram(params.data.value, params.data.grams);
                    return `₹${rate.toFixed(2)}`;
                  },
                  cellStyle: { fontFamily: 'monospace', textAlign: 'right', color: '#1f2937' }
                },
                ...(currentGoldRate ? [{
                  headerName: 'Current Value',
                  field: 'grams',
                  width: 150,
                  type: 'rightAligned',
                  cellRenderer: (params: any) => {
                    const currentValue = params.value * parseFloat(currentGoldRate);
                    const profit = currentValue - params.data.value;
                    return (
                      <div className="text-right font-mono">
                        <div className="text-gray-800">₹{currentValue.toFixed(2)}</div>
                        <div className={`text-xs ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profit > 0 ? '+' : ''}{profit.toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                }] : []),
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
                        onClick={() => deleteGold(params.value)}
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
