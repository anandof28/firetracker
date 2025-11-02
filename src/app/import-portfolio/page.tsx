'use client'

import { useUser } from '@clerk/nextjs'
import { useRef, useState } from 'react'

export default function ImportPortfolioPage() {
  const { user, isLoaded } = useUser()
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMode, setImportMode] = useState<'demo' | 'upload'>('demo')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please select a JSON file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setError(null)
      setValidationErrors([])
    }
  }

  const downloadSampleTemplate = () => {
    const link = document.createElement('a')
    link.href = '/sample-import-template.json'
    link.download = 'fire-tracker-import-template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async () => {
    if (!user) {
      setError('Please sign in to import portfolio data')
      return
    }

    setImporting(true)
    setError(null)
    setValidationErrors([])
    setResults(null)

    try {
      let response
      
      if (importMode === 'upload' && selectedFile) {
        // File upload import
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        response = await fetch('/api/import-portfolio', {
          method: 'POST',
          body: formData
        })
      } else {
        // Demo data import
        response = await fetch('/api/import-portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }

      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError(data.error || 'Failed to import portfolio data')
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors)
        }
      }
    } catch (err) {
      setError('Network error occurred while importing data')
      console.error('Import error:', err)
    } finally {
      setImporting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to import your portfolio data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Import Portfolio Data
          </h1>
          <p className="text-gray-600">
            Import your complete financial portfolio including accounts, fixed deposits, gold investments, and transactions.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Signed in as: <span className="font-medium">{user.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Sample Portfolio Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">17</div>
              <div className="text-sm text-gray-700">Bank Accounts</div>
              <div className="text-xs text-gray-700">₹1.37 Crores</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">13</div>
              <div className="text-sm text-gray-700">Fixed Deposits</div>
              <div className="text-xs text-gray-700">₹15 Lakhs</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">1</div>
              <div className="text-sm text-gray-700">Gold Investment</div>
              <div className="text-xs text-gray-700">450g @ ₹6000/g</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">10</div>
              <div className="text-sm text-gray-700">Recent Transactions</div>
              <div className="text-xs text-gray-700">Income & Expenses</div>
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📂 Import Options</h2>
          
          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setImportMode('demo')
                  setSelectedFile(null)
                  setError(null)
                  setValidationErrors([])
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  importMode === 'demo'
                    ? 'bg-blue-50 border-blue-300 text-gray-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                🎯 Demo Data Import
              </button>
              <button
                onClick={() => {
                  setImportMode('upload')
                  setError(null)
                  setValidationErrors([])
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  importMode === 'upload'
                    ? 'bg-blue-50 border-blue-300 text-gray-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                📤 Upload Your Data
              </button>
            </div>
          </div>

          {importMode === 'demo' ? (
            /* Demo Import Section */
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Demo Portfolio Data</h3>
              <p className="text-gray-700 text-sm mb-4">
                Import sample data to explore Fire Tracker features. This includes 17 accounts, 13 FDs, gold investments, and transaction history.
              </p>
              <button
                onClick={handleImport}
                disabled={importing}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                  importing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {importing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing Demo Data...
                  </span>
                ) : (
                  '🚀 Import Demo Portfolio'
                )}
              </button>
            </div>
          ) : (
            /* File Upload Section */
            <div className="space-y-4">
              {/* Template Download */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">📋 Step 1: Download Template</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Download our sample template with format guide and validation rules to structure your data correctly.
                </p>
                <button
                  onClick={downloadSampleTemplate}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Template
                </button>
              </div>

              {/* File Upload */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">📤 Step 2: Upload Your Data</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Select your JSON file following the template format. Maximum file size: 5MB.
                </p>
                
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-gray-700 hover:file:bg-purple-100"
                  />
                  
                  {selectedFile && (
                    <div className="flex items-center text-sm text-gray-700 bg-purple-100 rounded-lg p-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={importing || !selectedFile}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                  importing || !selectedFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                }`}
              >
                {importing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Your Data...
                  </span>
                ) : (
                  '🚀 Import Your Portfolio'
                )}
              </button>
              
              {!selectedFile && (
                <p className="text-sm text-gray-500 text-center">
                  Please select a JSON file to continue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-700">Import Error</h3>
                <div className="mt-2 text-sm text-gray-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-700">Data Validation Errors</h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p className="mb-2">Please fix the following issues in your data file:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs">
                    💡 <strong>Tip:</strong> Download the template again and compare your data structure with the sample format.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700">Import Successful! 🎉</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-xl font-bold text-gray-700">{results.accounts}</div>
                <div className="text-sm text-gray-600">Accounts Imported</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xl font-bold text-gray-700">{results.fixedDeposits}</div>
                <div className="text-sm text-gray-600">Fixed Deposits</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xl font-bold text-gray-700">{results.goldInvestments}</div>
                <div className="text-sm text-gray-600">Gold Investments</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xl font-bold text-gray-700">{results.transactions}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">⚠️ Warnings:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {results.errors.map((error: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                View Your Portfolio Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Data Preview/Instructions */}
        {importMode === 'demo' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Demo Data Preview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">Sample Accounts:</h3>
                <div className="text-sm text-gray-600 mt-1">
                  • HDFC Savings Account: ₹10,31,110<br/>
                  • SBI Joint Account: ₹23,91,458<br/>
                  • ICICI Current Account: ₹13,68,859<br/>
                  • + 14 more sample accounts
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Fixed Deposits:</h3>
                <div className="text-sm text-gray-600 mt-1">
                  • 13 FDs ranging from 7% to 8% interest<br/>
                  • Total investment: ₹15,00,000<br/>
                  • Maturity periods: 1-3 years
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Gold Investment:</h3>
                <div className="text-sm text-gray-600 mt-1">
                  • 450g purchased at ₹6,000/gram<br/>
                  • Current value: ₹41,80,500 (₹9,290/gram)<br/>
                  • Profit: ₹14,80,500
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 File Format Guide</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Required JSON Structure:</h3>
                <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "accounts": [
    {
      "name": "Account Name",
      "balance": 10000.00
    }
  ],
  "fixedDeposits": [
    {
      "accountName": "Account Name",
      "amount": 100000.00,
      "rate": 7.5,
      "startDate": "2024-01-01",
      "endDate": "2025-01-01"
    }
  ],
  "goldInvestments": [
    {
      "date": "2024-01-01",
      "grams": 10.5,
      "value": 50000.00
    }
  ],
  "transactions": [
    {
      "date": "2024-01-01",
      "type": "income",
      "amount": 5000.00,
      "category": "Salary",
      "note": "Monthly salary",
      "accountName": "Account Name"
    }
  ]
}`}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 text-sm">✅ Data Validation</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1">
                    <li>• All amounts must be positive numbers</li>
                    <li>• Dates in YYYY-MM-DD format</li>
                    <li>• Account names must match across sections</li>
                    <li>• Transaction types: 'income' or 'expense'</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 text-sm">💡 Pro Tips</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1">
                    <li>• Create accounts first, then reference them</li>
                    <li>• Use descriptive account names</li>
                    <li>• Add notes to transactions for clarity</li>
                    <li>• Validate your JSON before uploading</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
