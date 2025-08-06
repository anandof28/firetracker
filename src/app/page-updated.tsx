'use client'

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
  createdAt: string
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
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fds, setFds] = useState<FD[]>([])
  const [gold, setGold] = useState<Gold[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [accountForm, setAccountForm] = useState({ name: '', balance: '' })
  const [fdForm, setFdForm] = useState({ amount: '', rate: '', startDate: '', endDate: '' })
  const [goldForm, setGoldForm] = useState({ grams: '', value: '', date: '' })
  const [transactionForm, setTransactionForm] = useState({ 
    type: 'income', 
    amount: '', 
    category: '', 
    note: '', 
    date: '' 
  })

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [accountsRes, fdsRes, goldRes, transactionsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/gold'),
        fetch('/api/transactions')
      ])

      if (accountsRes.ok) setAccounts(await accountsRes.json())
      if (fdsRes.ok) setFds(await fdsRes.json())
      if (goldRes.ok) setGold(await goldRes.json())
      if (transactionsRes.ok) setTransactions(await transactionsRes.json())
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      })
      if (response.ok) {
        setAccountForm({ name: '', balance: '' })
        fetchAllData()
      }
    } catch (err) {
      setError('Failed to create account')
    }
  }

  const createFD = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/fds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fdForm),
      })
      if (response.ok) {
        setFdForm({ amount: '', rate: '', startDate: '', endDate: '' })
        fetchAllData()
      }
    } catch (err) {
      setError('Failed to create FD')
    }
  }

  const createGold = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goldForm),
      })
      if (response.ok) {
        setGoldForm({ grams: '', value: '', date: '' })
        fetchAllData()
      }
    } catch (err) {
      setError('Failed to create gold record')
    }
  }

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionForm),
      })
      if (response.ok) {
        setTransactionForm({ type: 'income', amount: '', category: '', note: '', date: '' })
        fetchAllData()
      }
    } catch (err) {
      setError('Failed to create transaction')
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalFDValue = fds.reduce((sum, fd) => sum + fd.amount, 0)
  const totalGoldValue = gold.reduce((sum, g) => sum + g.value, 0)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Fire Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your financial independence journey
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">FD Value</h3>
            <p className="text-2xl font-bold text-blue-600">₹{totalFDValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Gold Value</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{totalGoldValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-500">₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-500">₹{totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Account Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Account</h2>
            <form onSubmit={createAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Account Name"
                value={accountForm.name}
                onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Balance"
                value={accountForm.balance}
                onChange={(e) => setAccountForm({...accountForm, balance: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                Add Account
              </button>
            </form>
          </div>

          {/* FD Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Fixed Deposit</h2>
            <form onSubmit={createFD} className="space-y-4">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={fdForm.amount}
                onChange={(e) => setFdForm({...fdForm, amount: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Interest Rate %"
                value={fdForm.rate}
                onChange={(e) => setFdForm({...fdForm, rate: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="date"
                placeholder="Start Date"
                value={fdForm.startDate}
                onChange={(e) => setFdForm({...fdForm, startDate: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="date"
                placeholder="End Date"
                value={fdForm.endDate}
                onChange={(e) => setFdForm({...fdForm, endDate: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                Add FD
              </button>
            </form>
          </div>

          {/* Gold Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Gold</h2>
            <form onSubmit={createGold} className="space-y-4">
              <input
                type="number"
                step="0.01"
                placeholder="Grams"
                value={goldForm.grams}
                onChange={(e) => setGoldForm({...goldForm, grams: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Value ₹"
                value={goldForm.value}
                onChange={(e) => setGoldForm({...goldForm, value: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="date"
                value={goldForm.date}
                onChange={(e) => setGoldForm({...goldForm, date: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
              <button type="submit" className="w-full bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700">
                Add Gold
              </button>
            </form>
          </div>

          {/* Transaction Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Transaction</h2>
            <form onSubmit={createTransaction} className="space-y-4">
              <select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={transactionForm.note}
                onChange={(e) => setTransactionForm({...transactionForm, note: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
              <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">
                Add Transaction
              </button>
            </form>
          </div>
        </div>

        {/* Data Tables */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b">
                        <td className="p-2">{account.name}</td>
                        <td className="p-2 text-right">₹{account.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FDs Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Fixed Deposits</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Rate</th>
                      <th className="text-left p-2">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fds.map((fd) => (
                      <tr key={fd.id} className="border-b">
                        <td className="p-2">₹{fd.amount.toFixed(2)}</td>
                        <td className="p-2">{fd.rate}%</td>
                        <td className="p-2">{new Date(fd.endDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gold Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gold Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Grams</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gold.map((g) => (
                      <tr key={g.id} className="border-b">
                        <td className="p-2">{g.grams}g</td>
                        <td className="p-2">₹{g.value.toFixed(2)}</td>
                        <td className="p-2">{new Date(g.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="p-2">₹{transaction.amount.toFixed(2)}</td>
                        <td className="p-2">{transaction.category}</td>
                        <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Database Info */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Fire Tracker Database Ready
          </h3>
          <div className="text-sm text-green-700 space-y-2">
            <p>Your financial tracking system is ready! You can now:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Track multiple accounts and their balances</li>
              <li>Manage fixed deposits with maturity tracking</li>
              <li>Record gold investments by weight and value</li>
              <li>Log income and expense transactions</li>
              <li>View your total portfolio value at a glance</li>
            </ul>
            <p className="mt-2">Database file: <code className="bg-green-100 px-1 rounded">./dev.db</code></p>
            <p>Use <code className="bg-green-100 px-1 rounded">npx prisma studio</code> to view data in a GUI</p>
          </div>
        </div>
      </div>
    </div>
  )
}
