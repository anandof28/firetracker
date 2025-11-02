'use client'

import { formatDateForDisplay } from '@/utils/dateHelpers'
import { calculateMaturityAmount } from '@/utils/fdUtils'
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
  account: {
    id: string
    name: string
  }
}

interface Gold {
  id: string
  grams: number
  value: number
  date: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  note: string | null
  date: string
  account?: {
    id: string
    name: string
  }
}

interface PortfolioReport {
  generatedAt: string
  summary: {
    totalAccounts: number
    totalAccountBalance: number
    totalFDs: number
    totalFDInvestment: number
    totalFDMaturityValue: number
    totalGoldPurchases: number
    totalGoldWeight: number
    totalGoldPurchaseValue: number
    totalGoldCurrentValue: number
    totalTransactions: number
    totalIncome: number
    totalExpense: number
    netCashFlow: number
    totalAssets: number
  }
  accounts: Account[]
  fds: FD[]
  gold: Gold[]
  recentTransactions: Transaction[]
  notifications: {
    maturedFDs: any[]
    approachingMaturityFDs: any[]
  }
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [report, setReport] = useState<PortfolioReport | null>(null)
  const [currentGoldRate, setCurrentGoldRate] = useState<number>(9290)
  const [reportFormat, setReportFormat] = useState<'detailed' | 'summary'>('detailed')

  const generateReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?goldRate=${currentGoldRate}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        setError('Failed to generate report')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateReport()
  }, [currentGoldRate])

  const downloadReport = () => {
    if (!report) return

    const reportContent = generateReportContent()
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateReportContent = () => {
    if (!report) return ''

    return `
FIRE TRACKER - PORTFOLIO REPORT
Generated on: ${formatDateForDisplay(report.generatedAt)}
Current Gold Rate: ₹${currentGoldRate}/gram

==================================================
PORTFOLIO SUMMARY
==================================================
Total Accounts: ${report.summary.totalAccounts}
Total Account Balance: ₹${report.summary.totalAccountBalance.toFixed(2)}

Fixed Deposits: ${report.summary.totalFDs}
FD Investment: ₹${report.summary.totalFDInvestment.toFixed(2)}
FD Maturity Value: ₹${report.summary.totalFDMaturityValue.toFixed(2)}

Gold Purchases: ${report.summary.totalGoldPurchases}
Gold Weight: ${report.summary.totalGoldWeight.toFixed(3)}g
Gold Purchase Value: ₹${report.summary.totalGoldPurchaseValue.toFixed(2)}
Gold Current Value: ₹${report.summary.totalGoldCurrentValue.toFixed(2)}
Gold P&L: ₹${(report.summary.totalGoldCurrentValue - report.summary.totalGoldPurchaseValue).toFixed(2)}

Total Income: ₹${report.summary.totalIncome.toFixed(2)}
Total Expense: ₹${report.summary.totalExpense.toFixed(2)}
Net Cash Flow: ₹${report.summary.netCashFlow.toFixed(2)}

TOTAL PORTFOLIO VALUE: ₹${report.summary.totalAssets.toFixed(2)}

==================================================
BANK ACCOUNTS
==================================================
${report.accounts.map(acc => 
  `${acc.name}: ₹${acc.balance.toFixed(2)}`
).join('\n')}

==================================================
FIXED DEPOSITS
==================================================
${report.fds.map(fd => 
  `Account: ${fd.account.name}
Amount: ₹${fd.amount.toFixed(2)}
Rate: ${fd.rate}%
Start: ${formatDateForDisplay(fd.startDate)}
End: ${formatDateForDisplay(fd.endDate)}
Maturity Value: ₹${calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate).toFixed(2)}
---`
).join('\n')}

==================================================
GOLD INVESTMENTS
==================================================
${report.gold.map(g => 
  `Date: ${formatDateForDisplay(g.date)}
Weight: ${g.grams.toFixed(3)}g
Purchase Value: ₹${g.value.toFixed(2)}
Purchase Rate: ₹${(g.value / g.grams).toFixed(2)}/g
Current Value: ₹${(g.grams * currentGoldRate).toFixed(2)}
P&L: ₹${((g.grams * currentGoldRate) - g.value).toFixed(2)}
---`
).join('\n')}

==================================================
RECENT TRANSACTIONS (Last 10)
==================================================
${report.recentTransactions.map(txn => 
  `${formatDateForDisplay(txn.date)} | ${txn.type.toUpperCase()} | ₹${txn.amount.toFixed(2)} | ${txn.category} | ${txn.note || 'No note'}`
).join('\n')}

==================================================
NOTIFICATIONS
==================================================
Matured FDs: ${report.notifications.maturedFDs.length}
${report.notifications.maturedFDs.map(fd => 
  `- ${fd.account.name}: ₹${fd.amount} (${fd.daysPastMaturity} days overdue)`
).join('\n')}

Approaching Maturity: ${report.notifications.approachingMaturityFDs.length}
${report.notifications.approachingMaturityFDs.map(fd => 
  `- ${fd.account.name}: ₹${fd.amount} (${fd.daysUntilMaturity} days remaining)`
).join('\n')}

Report generated by Fire Tracker - Personal Finance Management System
    `
  }

  if (loading) return <div className="p-6">Generating report...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Portfolio Reports</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive reports of your financial portfolio</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Gold Rate (₹/gram)
              </label>
              <input
                type="number"
                step="0.01"
                value={currentGoldRate}
                onChange={(e) => setCurrentGoldRate(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Format
              </label>
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as 'detailed' | 'summary')}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="detailed">Detailed Report</option>
                <option value="summary">Summary Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Refresh Report
              </button>
            </div>
          </div>
        </div>

        {report && (
          <>
            {/* Report Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Portfolio Report</h2>
                  <p className="text-gray-600">Generated on {formatDateForDisplay(report.generatedAt)}</p>
                </div>
                <button
                  onClick={downloadReport}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Download Report
                </button>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-700">₹{report.summary.totalAssets.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Account Balance</p>
                  <p className="text-xl font-bold text-gray-700">₹{report.summary.totalAccountBalance.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">FD Maturity Value</p>
                  <p className="text-xl font-bold text-gray-700">₹{report.summary.totalFDMaturityValue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Gold Current Value</p>
                  <p className="text-xl font-bold text-gray-700">₹{report.summary.totalGoldCurrentValue.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Net Cash Flow</p>
                  <p className={`text-xl font-bold ${report.summary.netCashFlow >= 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                    ₹{report.summary.netCashFlow.toFixed(2)}
                  </p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Gold P&L</p>
                  <p className={`text-xl font-bold ${(report.summary.totalGoldCurrentValue - report.summary.totalGoldPurchaseValue) >= 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                    ₹{(report.summary.totalGoldCurrentValue - report.summary.totalGoldPurchaseValue).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-medium">Total Accounts</p>
                  <p className="text-xl font-bold text-gray-800">{report.summary.totalAccounts}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm font-medium">Gold Weight</p>
                  <p className="text-xl font-bold text-gray-700">{report.summary.totalGoldWeight.toFixed(3)}g</p>
                </div>
              </div>
            </div>

            {reportFormat === 'detailed' && (
              <>
                {/* Asset Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Accounts */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Accounts ({report.summary.totalAccounts})</h3>
                    <div className="space-y-3 h-64 overflow-y-auto">
                      {report.accounts.map((account) => (
                        <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium text-gray-800">{account.name}</span>
                          <span className="text-gray-700 font-bold">₹{account.balance.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FDs */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fixed Deposits ({report.summary.totalFDs})</h3>
                    <div className="space-y-3 h-64 overflow-y-auto">
                      {report.fds.map((fd) => (
                        <div key={fd.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">{fd.account.name}</p>
                              <p className="text-sm text-gray-600">{fd.rate}% | {formatDateForDisplay(fd.endDate)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-700">₹{fd.amount.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">→ ₹{calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gold Investments */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Gold Investments ({report.summary.totalGoldPurchases})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.gold.map((gold) => (
                      <div key={gold.id} className="p-4 bg-yellow-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-900">{formatDateForDisplay(gold.date)}</span>
                          <span className="font-bold text-gray-700">{gold.grams.toFixed(3)}g</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm  text-gray-900">Purchase:</span>
                            <span className="font-medium  text-gray-900">₹{gold.value.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm  text-gray-900">Current:</span>
                            <span className="font-medium  text-gray-900">₹{(gold.grams * currentGoldRate).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-sm font-medium  text-gray-900">P&L:</span>
                            <span className={`font-bold ${((gold.grams * currentGoldRate) - gold.value) >= 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                              ₹{((gold.grams * currentGoldRate) - gold.value).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                  <div className="space-y-2">
                    {report.recentTransactions.map((txn) => (
                      <div key={txn.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium  text-gray-900">{txn.category}</span>
                          <span className="text-sm text-gray-600 ml-2">{formatDateForDisplay(txn.date)}</span>
                          {txn.note && <span className="text-sm text-gray-500 block">{txn.note}</span>}
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${txn.type === 'income' ? 'text-gray-700' : 'text-gray-700'}`}>
                            {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                          </span>
                          {txn.account && <span className="text-sm text-gray-600 block">{txn.account.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                {(report.notifications.maturedFDs.length > 0 || report.notifications.approachingMaturityFDs.length > 0) && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {report.notifications.maturedFDs.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Matured FDs ({report.notifications.maturedFDs.length})</h4>
                          <div className="space-y-2">
                            {report.notifications.maturedFDs.map((fd, index) => (
                              <div key={index} className="p-3 bg-red-50 rounded border border-red-200">
                                <p className="font-medium  text-gray-900">{fd.account.name}</p>
                                <p className="text-sm text-gray-700">₹{fd.amount} - {fd.daysPastMaturity} days overdue</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {report.notifications.approachingMaturityFDs.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Approaching Maturity ({report.notifications.approachingMaturityFDs.length})</h4>
                          <div className="space-y-2">
                            {report.notifications.approachingMaturityFDs.map((fd, index) => (
                              <div key={index} className="p-3 bg-orange-50 rounded border border-orange-200">
                                <p className="font-medium  text-gray-900">{fd.account.name}</p>
                                <p className="text-sm text-gray-700">₹{fd.amount} - {fd.daysUntilMaturity} days remaining</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
