'use client'

import { useUser } from '@clerk/nextjs'
import React, { useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface MutualFund {
  id: string
  schemeCode: number
  schemeName: string
  fundHouse: string
  schemeType: string
  schemeCategory: string
  units: number
  avgPrice: number
  totalInvested: number
  purchaseDate: string
  currentNAV: number | null
  lastUpdated: string
  isActive: boolean
  notes: string | null
  investmentType: 'lumpsum' | 'sip'
  tags: string[]
  sipAmount?: number
  sipDate?: number // Day of month (1-31)
  sipStartDate?: string
  sipEndDate?: string
  sipFrequency?: 'monthly' | 'quarterly'
}

interface MutualFundSearch {
  schemeCode: number
  schemeName: string
  isinGrowth: string | null
  isinDivReinvestment: string | null
}

export default function MutualFundsPage() {
  const { user } = useUser()
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [searchResults, setSearchResults] = useState<MutualFundSearch[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isUpdatingNAVs, setIsUpdatingNAVs] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MutualFundSearch | null>(null)
  const [formData, setFormData] = useState({
    units: '',
    avgPrice: '',
    totalInvested: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    investmentType: 'lumpsum' as 'lumpsum' | 'sip',
    tags: [] as string[],
    sipAmount: '',
    sipDate: '1',
    sipStartDate: new Date().toISOString().split('T')[0],
    sipEndDate: '',
    sipFrequency: 'monthly' as 'monthly' | 'quarterly'
  })
  const [isLoadingNAV, setIsLoadingNAV] = useState(false)
  const [navEditable, setNavEditable] = useState(false)

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    type?: 'warning' | 'danger' | 'info'
  } | null>(null)

  const [showInputModal, setShowInputModal] = useState(false)
  const [inputModalConfig, setInputModalConfig] = useState<{
    title: string
    message: string
    inputValue: string
    onConfirm: (value: string) => void
    onCancel?: () => void
    placeholder?: string
  } | null>(null)

  // Filter and Sort States
  const [filters, setFilters] = useState({
    fundHouse: '',
    schemeType: '',
    investmentType: '',
    tags: ''
  })
  const [sortBy, setSortBy] = useState<'schemeName' | 'totalInvested' | 'currentValue' | 'gainLossPercentage' | 'purchaseDate'>('purchaseDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Available tags
  const availableTags = ['Long-term', 'Retirement', 'Tax Saving', 'High Risk', 'Emergency Fund', 'Child Education', 'SIP']

  const fetchMutualFunds = useCallback(async (showLoading = false) => {
    if (showLoading) setIsPageLoading(true)
    try {
      const response = await fetch('/api/mutual-funds')
      if (response.ok) {
        const data = await response.json()
        setMutualFunds(data)
      }
    } catch (error) {
      console.error('Error fetching mutual funds:', error)
      toast.error('Failed to load mutual funds')
    } finally {
      if (showLoading) setIsPageLoading(false)
    }
  }, [])

  const searchMutualFunds = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/mutual-funds/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching mutual funds:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  // Memoized search function to prevent infinite re-renders
  const debouncedSearch = useCallback(
    () => {
      const timeoutId = setTimeout(() => {
        searchMutualFunds()
      }, 300)
      return () => clearTimeout(timeoutId)
    },
    [searchQuery]
  )

  const updateAllNAVs = async () => {
    setIsUpdatingNAVs(true)
    const loadingToast = toast.loading('Updating NAVs...')
    
    try {
      const response = await fetch('/api/mutual-funds/update-navs', {
        method: 'POST'
      })
      if (response.ok) {
        await fetchMutualFunds() // Refresh the list
        toast.success('NAVs updated successfully!', { id: loadingToast })
      } else {
        toast.error('Failed to update NAVs', { id: loadingToast })
      }
    } catch (error) {
      console.error('Error updating NAVs:', error)
      toast.error('Failed to update NAVs', { id: loadingToast })
    } finally {
      setIsUpdatingNAVs(false)
    }
  }

  const fetchNAVForDate = useCallback(async (schemeCode: number, date: string) => {
    if (!date || !schemeCode) return

    setIsLoadingNAV(true)
    try {
      const response = await fetch(`/api/mutual-funds/nav/${schemeCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          // Find NAV for the specific date or closest available date
          const targetDate = new Date(date)
          let closestNAV = null
          let closestDateDiff = Infinity
          let closestDate = null

          for (const navData of data.data) {
            const navDate = new Date(navData.date.split('-').reverse().join('-')) // Convert DD-MM-YYYY to YYYY-MM-DD
            const dateDiff = Math.abs(targetDate.getTime() - navDate.getTime())
            
            if (dateDiff < closestDateDiff && navDate <= targetDate) {
              closestDateDiff = dateDiff
              closestNAV = parseFloat(navData.nav)
              closestDate = navData.date
            }
          }

          if (closestNAV) {
            // Check if the date is too far from target (more than 30 days difference)
            const daysDiff = Math.ceil(closestDateDiff / (1000 * 60 * 60 * 24))
            
            setFormData(prev => ({
              ...prev,
              avgPrice: closestNAV.toFixed(4)
            }))

            // Show warning if using older NAV data
            if (daysDiff > 30) {
              toast(`⚠️ Using NAV from ${closestDate} (${daysDiff} days difference from selected date)`, {
                duration: 4000,
                icon: '⚠️'
              })
            } else if (daysDiff > 0) {
              toast(`ℹ️ Using NAV from ${closestDate}`, {
                duration: 3000,
                icon: 'ℹ️'
              })
            }
          } else {
            // No NAV data available for this date range
            setFormData(prev => ({
              ...prev,
              avgPrice: ''
            }))
            setNavEditable(true)
            toast.error(`NAV data not available for ${date}. Historical data is limited to recent years. Please enter the NAV manually or select a more recent date.`)
          }
        } else {
          // No data returned from API
          setFormData(prev => ({
            ...prev,
            avgPrice: ''
          }))
          setNavEditable(true)
          toast.error('No NAV data available for this fund')
        }
      } else {
        // API call failed
        setFormData(prev => ({
          ...prev,
          avgPrice: ''
        }))
        setNavEditable(true)
        toast.error('Failed to fetch NAV data. Please enter the NAV manually.')
      }
    } catch (error) {
      console.error('Error fetching NAV for date:', error)
      setFormData(prev => ({
        ...prev,
        avgPrice: ''
      }))
      setNavEditable(true)
      toast.error('Error fetching NAV data. Please enter the NAV manually.')
    } finally {
      setIsLoadingNAV(false)
    }
  }, [])

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      purchaseDate: date,
      avgPrice: '' // Reset price when date changes
    }))
    setNavEditable(false) // Reset to auto-fetch mode
    
    if (selectedFund && date) {
      fetchNAVForDate(selectedFund.schemeCode, date)
    }
  }

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFund) return

    try {
      // First get the latest NAV and fund details
      const navResponse = await fetch(`/api/mutual-funds/nav/${selectedFund.schemeCode}`)
      let currentNAV = null
      let fundHouse = ''
      let schemeType = ''
      let schemeCategory = ''

      if (navResponse.ok) {
        const navData = await navResponse.json()
        if (navData.data && navData.data.length > 0) {
          currentNAV = parseFloat(navData.data[0].nav)
        }
        if (navData.meta) {
          fundHouse = navData.meta.fund_house || ''
          schemeType = navData.meta.scheme_type || ''
          schemeCategory = navData.meta.scheme_category || ''
        }
      }

      const response = await fetch('/api/mutual-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schemeCode: selectedFund.schemeCode,
          schemeName: selectedFund.schemeName,
          fundHouse,
          schemeType,
          schemeCategory,
          units: formData.units,
          avgPrice: formData.avgPrice,
          totalInvested: formData.totalInvested,
          purchaseDate: formData.purchaseDate,
          currentNAV,
          notes: formData.notes,
          investmentType: formData.investmentType,
          tags: formData.tags,
          sipAmount: formData.sipAmount,
          sipDate: formData.sipDate,
          sipStartDate: formData.sipStartDate,
          sipEndDate: formData.sipEndDate,
          sipFrequency: formData.sipFrequency
        })
      })

      if (response.ok) {
        toast.success('Investment added successfully!')
        setShowAddForm(false)
        setSelectedFund(null)
        setFormData({
          units: '',
          avgPrice: '',
          totalInvested: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: '',
          investmentType: 'lumpsum',
          tags: [],
          sipAmount: '',
          sipDate: '1',
          sipStartDate: new Date().toISOString().split('T')[0],
          sipEndDate: '',
          sipFrequency: 'monthly'
        })
        setSearchQuery('')
        setSearchResults([])
        setIsLoadingNAV(false)
        setNavEditable(false)
        await fetchMutualFunds()
      } else {
        toast.error('Failed to add investment')
      }
    } catch (error) {
      console.error('Error adding mutual fund:', error)
      toast.error('Failed to add mutual fund')
    }
  }

  const deleteFund = async (fundId: string, fundName: string) => {
    showConfirmDialog({
      title: 'Delete Investment',
      message: `Are you sure you want to delete the investment in "${fundName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting investment...')
        try {
          const response = await fetch(`/api/mutual-funds/${fundId}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            toast.success('Investment deleted successfully', { id: loadingToast })
            await fetchMutualFunds()
          } else {
            toast.error('Failed to delete investment', { id: loadingToast })
          }
        } catch (error) {
          console.error('Error deleting fund:', error)
          toast.error('Failed to delete investment', { id: loadingToast })
        }
      }
    })
  }

  // Auto-calculate total invested when units or avgPrice changes
  useEffect(() => {
    const units = parseFloat(formData.units)
    const avgPrice = parseFloat(formData.avgPrice)
    
    if (!isNaN(units) && !isNaN(avgPrice) && units > 0 && avgPrice > 0) {
      const totalInvested = (units * avgPrice).toFixed(2)
      setFormData(prev => ({
        ...prev,
        totalInvested
      }))
    }
  }, [formData.units, formData.avgPrice])

  // Fetch NAV when fund is selected and date is available
  useEffect(() => {
    if (selectedFund && formData.purchaseDate) {
      fetchNAVForDate(selectedFund.schemeCode, formData.purchaseDate)
    }
  }, [selectedFund, formData.purchaseDate, fetchNAVForDate])

  const calculateCurrentValue = (fund: MutualFund) => {
    if (!fund.currentNAV) return fund.totalInvested
    return fund.units * fund.currentNAV
  }

  const calculateGainLoss = (fund: MutualFund) => {
    const currentValue = calculateCurrentValue(fund)
    return currentValue - fund.totalInvested
  }

  const calculateGainLossPercentage = (fund: MutualFund) => {
    const gainLoss = calculateGainLoss(fund)
    return (gainLoss / fund.totalInvested) * 100
  }

  // Filter and sort mutual funds
  const filteredAndSortedFunds = React.useMemo(() => {
    let filtered = mutualFunds.filter(fund => {
      if (filters.fundHouse && fund.fundHouse !== filters.fundHouse) return false
      if (filters.schemeType && fund.schemeType !== filters.schemeType) return false
      if (filters.investmentType && fund.investmentType !== filters.investmentType) return false
      if (filters.tags && !fund.tags.includes(filters.tags)) return false
      return true
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let valueA: any, valueB: any

      switch (sortBy) {
        case 'schemeName':
          valueA = a.schemeName.toLowerCase()
          valueB = b.schemeName.toLowerCase()
          break
        case 'totalInvested':
          valueA = a.totalInvested
          valueB = b.totalInvested
          break
        case 'currentValue':
          valueA = calculateCurrentValue(a)
          valueB = calculateCurrentValue(b)
          break
        case 'gainLossPercentage':
          valueA = calculateGainLossPercentage(a)
          valueB = calculateGainLossPercentage(b)
          break
        case 'purchaseDate':
          valueA = new Date(a.purchaseDate)
          valueB = new Date(b.purchaseDate)
          break
        default:
          return 0
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [mutualFunds, filters, sortBy, sortOrder])

  useEffect(() => {
    if (user) {
      fetchMutualFunds(true)
    }
  }, [user, fetchMutualFunds])

  useEffect(() => {
    const cleanup = debouncedSearch()
    return cleanup
  }, [debouncedSearch])

  const totalInvested = mutualFunds.reduce((sum, fund) => sum + fund.totalInvested, 0)
  const totalCurrentValue = mutualFunds.reduce((sum, fund) => sum + calculateCurrentValue(fund), 0)
  const totalGainLoss = totalCurrentValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  // Helper function to show confirmation modal
  const showConfirmDialog = (config: typeof confirmModalConfig) => {
    setConfirmModalConfig(config)
    setShowConfirmModal(true)
  }

  // Helper function to show input modal
  const showInputDialog = (config: typeof inputModalConfig) => {
    setInputModalConfig(config)
    setShowInputModal(true)
  }

  // Confirm Modal Component
  const ConfirmModal = () => {
    if (!showConfirmModal || !confirmModalConfig) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                confirmModalConfig.type === 'danger' ? 'bg-red-100' :
                confirmModalConfig.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {confirmModalConfig.type === 'danger' ? (
                  <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : confirmModalConfig.type === 'warning' ? (
                  <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {confirmModalConfig.title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {confirmModalConfig.message}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                confirmModalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                confirmModalConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
              onClick={() => {
                confirmModalConfig.onConfirm()
                setShowConfirmModal(false)
                setConfirmModalConfig(null)
              }}
            >
              {confirmModalConfig.confirmText || 'Confirm'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                if (confirmModalConfig.onCancel) confirmModalConfig.onCancel()
                setShowConfirmModal(false)
                setConfirmModalConfig(null)
              }}
            >
              {confirmModalConfig.cancelText || 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Input Modal Component
  const InputModal = () => {
    if (!showInputModal || !inputModalConfig) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {inputModalConfig.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {inputModalConfig.message}
              </p>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={inputModalConfig.placeholder}
                value={inputModalConfig.inputValue}
                onChange={(e) => setInputModalConfig(prev => prev ? { ...prev, inputValue: e.target.value } : null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    inputModalConfig.onConfirm(inputModalConfig.inputValue)
                    setShowInputModal(false)
                    setInputModalConfig(null)
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                inputModalConfig.onConfirm(inputModalConfig.inputValue)
                setShowInputModal(false)
                setInputModalConfig(null)
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                if (inputModalConfig.onCancel) inputModalConfig.onCancel()
                setShowInputModal(false)
                setInputModalConfig(null)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mutual Funds</h1>
              <p className="text-gray-600 mt-2">Track your mutual fund investments and performance</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={updateAllNAVs}
                disabled={isUpdatingNAVs || mutualFunds.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isUpdatingNAVs ? 'Updating...' : 'Update NAVs'}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Investment
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
            <p className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Current Value</h3>
            <p className="text-2xl font-bold text-gray-900">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Gain/Loss</h3>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-gray-700' : 'text-gray-700'}`}>
              {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Return %</h3>
            <p className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? 'text-gray-700' : 'text-gray-700'}`}>
              {totalGainLossPercentage >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        {mutualFunds.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fund House</label>
                  <select
                    value={filters.fundHouse}
                    onChange={(e) => setFilters({ ...filters, fundHouse: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Fund Houses</option>
                    {Array.from(new Set(mutualFunds.map(fund => fund.fundHouse))).map(house => (
                      <option key={house} value={house}>{house}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Type</label>
                  <select
                    value={filters.schemeType}
                    onChange={(e) => setFilters({ ...filters, schemeType: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {Array.from(new Set(mutualFunds.map(fund => fund.schemeType))).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                  <select
                    value={filters.investmentType}
                    onChange={(e) => setFilters({ ...filters, investmentType: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="lumpsum">Lumpsum</option>
                    <option value="sip">SIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <select
                    value={filters.tags}
                    onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Tags</option>
                    {availableTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'schemeName' | 'totalInvested' | 'currentValue' | 'gainLossPercentage' | 'purchaseDate')}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="schemeName">Fund Name</option>
                    <option value="totalInvested">Investment Amount</option>
                    <option value="currentValue">Current Value</option>
                    <option value="gainLossPercentage">Returns %</option>
                    <option value="purchaseDate">Purchase Date</option>
                  </select>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mutual Funds List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Investments</h2>
          </div>
          
          {mutualFunds.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mutual fund investments yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first mutual fund investment</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Your First Investment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheme Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current NAV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedFunds.map((fund) => {
                    const currentValue = calculateCurrentValue(fund)
                    const gainLoss = calculateGainLoss(fund)
                    const gainLossPercentage = calculateGainLossPercentage(fund)
                    
                    return (
                      <tr key={fund.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {fund.schemeName.length > 50 
                                ? fund.schemeName.substring(0, 50) + '...'
                                : fund.schemeName
                              }
                            </div>
                            <div className="text-sm text-gray-500">{fund.fundHouse}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            fund.investmentType === 'sip' 
                              ? 'bg-blue-100 text-gray-700' 
                              : 'bg-green-100 text-gray-700'
                          }`}>
                            {fund.investmentType === 'sip' ? 'SIP' : 'Lumpsum'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {fund.tags.length > 0 ? (
                              fund.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">No tags</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fund.units.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{fund.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fund.currentNAV ? `₹${fund.currentNAV.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{fund.totalInvested.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{currentValue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={gainLoss >= 0 ? 'text-gray-700' : 'text-gray-700'}>
                            <div>{gainLoss >= 0 ? '+' : ''}₹{gainLoss.toLocaleString('en-IN')}</div>
                            <div className="text-xs">
                              ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteFund(fund.id, fund.schemeName)}
                            className="text-gray-700 hover:text-gray-700 transition-colors"
                            title="Delete investment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Investment Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Add Mutual Fund Investment</h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setSelectedFund(null)
                      setSearchQuery('')
                      setSearchResults([])
                      setFormData({
                        units: '',
                        avgPrice: '',
                        totalInvested: '',
                        purchaseDate: new Date().toISOString().split('T')[0],
                        notes: '',
                        investmentType: 'lumpsum',
                        tags: [],
                        sipAmount: '',
                        sipDate: '1',
                        sipStartDate: new Date().toISOString().split('T')[0],
                        sipEndDate: '',
                        sipFrequency: 'monthly'
                      })
                      setIsLoadingNAV(false)
                      setNavEditable(false)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!selectedFund ? (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Mutual Funds
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by fund name or AMC..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {isLoading && (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((fund) => (
                        <div
                          key={fund.schemeCode}
                          onClick={() => setSelectedFund(fund)}
                          className="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {fund.schemeName}
                          </div>
                          <div className="text-xs text-gray-500">Code: {fund.schemeCode}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddFund}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Fund
                      </label>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-sm text-gray-900">{selectedFund.schemeName}</div>
                        <div className="text-xs text-gray-500">Code: {selectedFund.schemeCode}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Units *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.units}
                          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purchase Date *
                        </label>
                        <input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NAV on Purchase Date (₹)
                          {isLoadingNAV && <span className="text-gray-700 text-xs ml-2">Loading...</span>}
                          {navEditable && <span className="text-gray-700 text-xs ml-2">Manual entry required</span>}
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.avgPrice}
                          onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                          readOnly={!navEditable && !isLoadingNAV}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !navEditable && !isLoadingNAV ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                          }`}
                          placeholder={
                            isLoadingNAV 
                              ? "Fetching NAV..." 
                              : navEditable 
                                ? "Enter NAV manually"
                                : "NAV will auto-populate"
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {navEditable 
                            ? "Historical NAV data unavailable - please enter manually"
                            : "NAV is automatically fetched for the selected purchase date"
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Invested (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.totalInvested}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                          placeholder="Auto-calculated from units × NAV"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically calculated: Units × NAV
                        </p>
                      </div>
                    </div>

                    {/* Investment Type and Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Investment Type *
                        </label>
                        <select
                          value={formData.investmentType}
                          onChange={(e) => setFormData({ ...formData, investmentType: e.target.value as 'lumpsum' | 'sip' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="lumpsum">Lumpsum</option>
                          <option value="sip">SIP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (Select multiple)
                        </label>
                        <select
                          multiple
                          value={formData.tags}
                          onChange={(e) => {
                            const selectedTags = Array.from(e.target.selectedOptions, option => option.value)
                            setFormData({ ...formData, tags: selectedTags })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        >
                          {availableTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl (Cmd on Mac) to select multiple tags
                        </p>
                      </div>
                    </div>

                    {/* SIP Details - Show only for SIP investments */}
                    {formData.investmentType === 'sip' && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">SIP Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SIP Amount (₹) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="500"
                              value={formData.sipAmount}
                              onChange={(e) => setFormData({ ...formData, sipAmount: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Monthly SIP amount"
                              required={formData.investmentType === 'sip'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SIP Date (Day of Month) *
                            </label>
                            <select
                              value={formData.sipDate}
                              onChange={(e) => setFormData({ ...formData, sipDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={formData.investmentType === 'sip'}
                            >
                              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day.toString()}>{day}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SIP Start Date *
                            </label>
                            <input
                              type="date"
                              value={formData.sipStartDate}
                              onChange={(e) => setFormData({ ...formData, sipStartDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={formData.investmentType === 'sip'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SIP End Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={formData.sipEndDate}
                              onChange={(e) => setFormData({ ...formData, sipEndDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min={formData.sipStartDate}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SIP Frequency *
                            </label>
                            <select
                              value={formData.sipFrequency}
                              onChange={(e) => setFormData({ ...formData, sipFrequency: e.target.value as 'monthly' | 'quarterly' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={formData.investmentType === 'sip'}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any additional notes..."
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={!formData.avgPrice || isLoadingNAV}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors"
                      >
                        {isLoadingNAV ? 'Loading NAV...' : 'Add Investment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFund(null)
                          setFormData({
                            units: '',
                            avgPrice: '',
                            totalInvested: '',
                            purchaseDate: new Date().toISOString().split('T')[0],
                            notes: '',
                            investmentType: 'lumpsum',
                            tags: [],
                            sipAmount: '',
                            sipDate: '1',
                            sipStartDate: new Date().toISOString().split('T')[0],
                            sipEndDate: '',
                            sipFrequency: 'monthly'
                          })
                          setIsLoadingNAV(false)
                          setNavEditable(false)
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                      >
                        Back to Search
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Custom Modals */}
      <ConfirmModal />
      <InputModal />
    </div>
  )
}
