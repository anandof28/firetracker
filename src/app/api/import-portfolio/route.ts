import { getAuthenticatedUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface ImportData {
  accounts?: Array<{
    name: string
    balance: number
    note?: string
  }>
  fixedDeposits?: Array<{
    accountName: string
    amount: number
    rate: number
    startDate: string
    endDate: string
    note?: string
  }>
  goldInvestments?: Array<{
    date: string
    grams: number
    value: number
    note?: string
  }>
  transactions?: Array<{
    date: string
    type: 'income' | 'expense'
    amount: number
    category: string
    note?: string
    accountName: string
  }>
}

// Demo data for quick import
const DEMO_DATA: ImportData = {
  accounts: [
    { name: "HDFC Savings Account", balance: 1031110, note: "Primary savings account" },
    { name: "SBI Joint Account", balance: 2391458, note: "Joint account with spouse" },
    { name: "ICICI Current Account", balance: 1368859, note: "Business current account" },
    { name: "Axis Bank Salary Account", balance: 567890, note: "Corporate salary account" },
    { name: "Kotak Mahindra Savings", balance: 450678, note: "Investment savings" },
    { name: "HDFC Current Account", balance: 789012, note: "Business current account" },
    { name: "SBI Savings - Branch", balance: 234567, note: "Local branch account" },
    { name: "ICICI NRI Account", balance: 1567890, note: "NRI special account" },
    { name: "Yes Bank Savings", balance: 345678, note: "High interest savings" },
    { name: "IndusInd Bank Account", balance: 876543, note: "Premium banking account" },
    { name: "PNB Savings Account", balance: 123456, note: "Government sector banking" },
    { name: "Canara Bank Account", balance: 654321, note: "Traditional banking" },
    { name: "BOI Savings Account", balance: 432109, note: "Public sector bank" },
    { name: "Union Bank Account", balance: 987654, note: "Merged bank account" },
    { name: "IDFC First Bank", balance: 345432, note: "New age banking" },
    { name: "RBL Bank Account", balance: 567123, note: "Digital banking" },
    { name: "DCB Bank Premium", balance: 789456, note: "Premium banking services" }
  ],
  fixedDeposits: [
    { accountName: "HDFC Savings Account", amount: 100000, rate: 7.5, startDate: "2024-01-15", endDate: "2025-01-15", note: "1-year FD" },
    { accountName: "SBI Joint Account", amount: 200000, rate: 8.0, startDate: "2024-02-10", endDate: "2027-02-10", note: "3-year FD" },
    { accountName: "ICICI Current Account", amount: 150000, rate: 7.8, startDate: "2024-03-05", endDate: "2026-03-05", note: "2-year FD" },
    { accountName: "Axis Bank Salary Account", amount: 75000, rate: 7.25, startDate: "2024-04-01", endDate: "2025-04-01", note: "1-year FD" },
    { accountName: "Kotak Mahindra Savings", amount: 300000, rate: 8.25, startDate: "2024-01-20", endDate: "2027-01-20", note: "3-year special FD" },
    { accountName: "HDFC Current Account", amount: 125000, rate: 7.6, startDate: "2024-05-15", endDate: "2025-11-15", note: "18-month FD" },
    { accountName: "SBI Savings - Branch", amount: 90000, rate: 7.9, startDate: "2024-02-28", endDate: "2026-02-28", note: "2-year FD" },
    { accountName: "ICICI NRI Account", amount: 250000, rate: 8.5, startDate: "2024-01-10", endDate: "2026-01-10", note: "NRI special FD" },
    { accountName: "Yes Bank Savings", amount: 80000, rate: 8.1, startDate: "2024-06-01", endDate: "2025-06-01", note: "High rate FD" },
    { accountName: "IndusInd Bank Account", amount: 175000, rate: 7.7, startDate: "2024-03-15", endDate: "2026-09-15", note: "2.5-year FD" },
    { accountName: "PNB Savings Account", amount: 60000, rate: 7.4, startDate: "2024-04-20", endDate: "2025-04-20", note: "1-year government FD" },
    { accountName: "Canara Bank Account", amount: 110000, rate: 7.85, startDate: "2024-02-05", endDate: "2026-02-05", note: "2-year traditional FD" },
    { accountName: "IDFC First Bank", amount: 95000, rate: 8.15, startDate: "2024-05-10", endDate: "2025-11-10", note: "18-month digital FD" }
  ],
  goldInvestments: [
    { date: "2024-02-14", grams: 450, value: 2700000, note: "Gold investment portfolio" }
  ],
  transactions: [
    { date: "2024-07-01", type: "income", amount: 150000, category: "Salary", note: "Monthly salary", accountName: "Axis Bank Salary Account" },
    { date: "2024-07-15", type: "expense", amount: 25000, category: "Rent", note: "Monthly rent payment", accountName: "HDFC Savings Account" },
    { date: "2024-07-20", type: "expense", amount: 8500, category: "Groceries", note: "Monthly groceries", accountName: "SBI Joint Account" },
    { date: "2024-07-25", type: "income", amount: 50000, category: "Bonus", note: "Performance bonus", accountName: "Axis Bank Salary Account" },
    { date: "2024-07-30", type: "expense", amount: 12000, category: "Utilities", note: "Electricity and internet bills", accountName: "ICICI Current Account" },
    { date: "2024-08-01", type: "income", amount: 150000, category: "Salary", note: "Monthly salary", accountName: "Axis Bank Salary Account" },
    { date: "2024-08-05", type: "expense", amount: 35000, category: "Shopping", note: "Clothing and accessories", accountName: "Kotak Mahindra Savings" },
    { date: "2024-08-10", type: "income", amount: 25000, category: "Freelance", note: "Consulting work", accountName: "HDFC Current Account" },
    { date: "2024-08-15", type: "expense", amount: 15000, category: "Dining", note: "Restaurants and food delivery", accountName: "Yes Bank Savings" },
    { date: "2024-08-20", type: "expense", amount: 8000, category: "Transportation", note: "Fuel and cab expenses", accountName: "IndusInd Bank Account" }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser()

    let importData: ImportData
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }

      try {
        const fileContent = await file.text()
        importData = JSON.parse(fileContent)
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 })
      }
    } else {
      // Demo data import or JSON body
      const body = await request.json().catch(() => ({}))
      importData = Object.keys(body).length > 0 ? body : DEMO_DATA
    }

    // Validation
    const validationErrors = validateImportData(importData)
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed',
        validationErrors 
      }, { status: 400 })
    }

    // Import data
    const results = await importPortfolioData(userId, importData)

    return NextResponse.json({ 
      message: 'Portfolio imported successfully',
      results 
    }, { status: 200 })

  } catch (error) {
    console.error('Import error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ 
      error: 'Internal server error during import' 
    }, { status: 500 })
  }
}

function validateImportData(data: ImportData): string[] {
  const errors: string[] = []

  // Validate accounts
  if (data.accounts) {
    data.accounts.forEach((account, index) => {
      if (!account.name?.trim()) {
        errors.push(`Account ${index + 1}: Name is required`)
      }
      if (typeof account.balance !== 'number' || account.balance < 0) {
        errors.push(`Account ${index + 1}: Balance must be a positive number`)
      }
    })
  }

  // Validate fixed deposits
  if (data.fixedDeposits) {
    data.fixedDeposits.forEach((fd, index) => {
      if (!fd.accountName?.trim()) {
        errors.push(`FD ${index + 1}: Account name is required`)
      }
      if (typeof fd.amount !== 'number' || fd.amount <= 0) {
        errors.push(`FD ${index + 1}: Amount must be a positive number`)
      }
      if (typeof fd.rate !== 'number' || fd.rate <= 0 || fd.rate > 20) {
        errors.push(`FD ${index + 1}: Interest rate must be between 0 and 20`)
      }
      if (!isValidDate(fd.startDate)) {
        errors.push(`FD ${index + 1}: Invalid start date format (use YYYY-MM-DD)`)
      }
      if (!isValidDate(fd.endDate)) {
        errors.push(`FD ${index + 1}: Invalid end date format (use YYYY-MM-DD)`)
      }
    })
  }

  // Validate gold investments
  if (data.goldInvestments) {
    data.goldInvestments.forEach((gold, index) => {
      if (!isValidDate(gold.date)) {
        errors.push(`Gold ${index + 1}: Invalid date format (use YYYY-MM-DD)`)
      }
      if (typeof gold.grams !== 'number' || gold.grams <= 0) {
        errors.push(`Gold ${index + 1}: Grams must be a positive number`)
      }
      if (typeof gold.value !== 'number' || gold.value <= 0) {
        errors.push(`Gold ${index + 1}: Value must be a positive number`)
      }
    })
  }

  // Validate transactions
  if (data.transactions) {
    data.transactions.forEach((txn, index) => {
      if (!isValidDate(txn.date)) {
        errors.push(`Transaction ${index + 1}: Invalid date format (use YYYY-MM-DD)`)
      }
      if (!['income', 'expense'].includes(txn.type)) {
        errors.push(`Transaction ${index + 1}: Type must be 'income' or 'expense'`)
      }
      if (typeof txn.amount !== 'number' || txn.amount <= 0) {
        errors.push(`Transaction ${index + 1}: Amount must be a positive number`)
      }
      if (!txn.category?.trim()) {
        errors.push(`Transaction ${index + 1}: Category is required`)
      }
      if (!txn.accountName?.trim()) {
        errors.push(`Transaction ${index + 1}: Account name is required`)
      }
    })
  }

  return errors
}

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

async function importPortfolioData(userId: string, data: ImportData) {
  const results = {
    accounts: 0,
    fixedDeposits: 0,
    goldInvestments: 0,
    transactions: 0,
    errors: [] as string[]
  }

  // Import accounts
  if (data.accounts && data.accounts.length > 0) {
    for (const accountData of data.accounts) {
      try {
        await prisma.account.create({
          data: {
            name: accountData.name,
            balance: accountData.balance,
            userId
          }
        })
        results.accounts++
      } catch (error) {
        results.errors.push(`Failed to import account "${accountData.name}": Account name might already exist`)
      }
    }
  }

  // Get all user accounts for reference
  const userAccounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true }
  })
  const accountMap = new Map(userAccounts.map(acc => [acc.name, acc.id]))

  // Import fixed deposits
  if (data.fixedDeposits && data.fixedDeposits.length > 0) {
    for (const fdData of data.fixedDeposits) {
      try {
        const accountId = accountMap.get(fdData.accountName)
        if (!accountId) {
          results.errors.push(`FD import failed: Account "${fdData.accountName}" not found`)
          continue
        }

        await prisma.fD.create({
          data: {
            amount: fdData.amount,
            rate: fdData.rate,
            startDate: new Date(fdData.startDate),
            endDate: new Date(fdData.endDate),
            accountId,
            userId
          }
        })
        results.fixedDeposits++
      } catch (error) {
        results.errors.push(`Failed to import FD for account "${fdData.accountName}"`)
      }
    }
  }

  // Import gold investments
  if (data.goldInvestments && data.goldInvestments.length > 0) {
    for (const goldData of data.goldInvestments) {
      try {
        await prisma.gold.create({
          data: {
            grams: goldData.grams,
            value: goldData.value,
            date: new Date(goldData.date),
            userId
          }
        })
        results.goldInvestments++
      } catch (error) {
        results.errors.push(`Failed to import gold investment from ${goldData.date}`)
      }
    }
  }

  // Import transactions
  if (data.transactions && data.transactions.length > 0) {
    for (const txnData of data.transactions) {
      try {
        const accountId = accountMap.get(txnData.accountName)
        if (!accountId) {
          results.errors.push(`Transaction import failed: Account "${txnData.accountName}" not found`)
          continue
        }

        await prisma.transaction.create({
          data: {
            type: txnData.type,
            amount: txnData.amount,
            category: txnData.category,
            note: txnData.note || '',
            date: new Date(txnData.date),
            accountId,
            userId
          }
        })
        results.transactions++
      } catch (error) {
        results.errors.push(`Failed to import transaction for account "${txnData.accountName}"`)
      }
    }
  }

  return results
}