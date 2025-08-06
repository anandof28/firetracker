#!/usr/bin/env tsx

/**
 * Portfolio Data Import Script for Fire Tracker
 * Imports bank accounts, FDs, gold investments, and transactions
 * for the currently authenticated user
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Portfolio data to import
const portfolioData = {
  accounts: [
    { name: 'IDFC - ABI - 5114', balance: 11351.00, type: 'SAVINGS' },
    { name: 'IDFC - ANAND - 4591', balance: 1031110.00, type: 'SAVINGS' },
    { name: 'IOB - ABI - 7722', balance: 138260.00, type: 'SAVINGS' },
    { name: 'IOB SELVI - 7333', balance: 810635.00, type: 'SAVINGS' },
    { name: 'Post Office - 8847', balance: 996292.00, type: 'SAVINGS' },
    { name: 'Post Office - 7276', balance: 1111371.00, type: 'SAVINGS' },
    { name: 'CCB - JOINT - 6972', balance: 1368859.00, type: 'SAVINGS' },
    { name: 'CCB - Anand', balance: 11000.00, type: 'SAVINGS' },
    { name: 'IOB JOINT - 5803', balance: 894879.00, type: 'SAVINGS' },
    { name: 'IOB JOINT - 0208', balance: 2391458.00, type: 'SAVINGS' },
    { name: 'Indian Bank - 6271', balance: 797713.00, type: 'SAVINGS' },
    { name: 'SBI - 2422', balance: 919550.00, type: 'SAVINGS' },
    { name: 'Axis - 5170', balance: 665455.00, type: 'SAVINGS' },
    { name: 'Central Bank - 4725', balance: 1129539.00, type: 'SAVINGS' },
    { name: 'Indian Bank 0497', balance: 798863.00, type: 'SAVINGS' },
    { name: 'Anand IOB - 0217', balance: 525414.00, type: 'SAVINGS' },
    { name: 'Anand SCB', balance: 68939.00, type: 'SAVINGS' }
  ],
  
  fixedDeposits: [
    { accountName: 'CCB - JOINT - 6972', amount: 100000.00, rate: 8.0, startDate: '2025-03-16', endDate: '2026-03-16' },
    { accountName: 'CCB - JOINT - 6972', amount: 100000.00, rate: 8.0, startDate: '2025-01-23', endDate: '2026-01-23' },
    { accountName: 'IOB JOINT - 5803', amount: 100000.00, rate: 7.3, startDate: '2024-11-27', endDate: '2025-11-27' },
    { accountName: 'IOB JOINT - 5803', amount: 200000.00, rate: 7.3, startDate: '2024-11-27', endDate: '2025-11-27' },
    { accountName: 'CCB - Anand', amount: 100000.00, rate: 7.0, startDate: '2024-10-08', endDate: '2025-10-08' },
    { accountName: 'Central Bank - 4725', amount: 100000.00, rate: 7.35, startDate: '2024-10-03', endDate: '2025-10-03' },
    { accountName: 'CCB - JOINT - 6972', amount: 100000.00, rate: 7.5, startDate: '2024-10-01', endDate: '2026-04-01' },
    { accountName: 'CCB - JOINT - 6972', amount: 100000.00, rate: 7.5, startDate: '2024-10-01', endDate: '2026-04-01' },
    { accountName: 'CCB - JOINT - 6972', amount: 100000.00, rate: 7.5, startDate: '2024-07-28', endDate: '2025-07-28' },
    { accountName: 'IOB JOINT - 0208', amount: 100000.00, rate: 7.8, startDate: '2023-11-27', endDate: '2026-06-03' },
    { accountName: 'IOB JOINT - 0208', amount: 100000.00, rate: 7.75, startDate: '2023-07-17', endDate: '2025-12-21' },
    { accountName: 'IOB JOINT - 0208', amount: 100000.00, rate: 7.6, startDate: '2023-01-06', endDate: '2026-01-06' },
    { accountName: 'IOB JOINT - 0208', amount: 200000.00, rate: 7.8, startDate: '2022-12-19', endDate: '2026-05-25' }
  ],
  
  goldInvestments: [
    { 
      date: '2025-04-07', 
      weight: 450.000, 
      purchaseValue: 2700000.00, 
      purchaseRate: 6000.00,
      description: 'Gold Investment - 450g at ₹6000/g'
    }
  ],
  
  transactions: [
    { date: '2025-08-03', type: 'EXPENSE', amount: 2456.00, category: 'Grocery', description: 'Zepto' },
    { date: '2025-08-02', type: 'EXPENSE', amount: 520.00, category: 'Lifestyle', description: 'Abi Fitness Class' },
    { date: '2025-08-01', type: 'EXPENSE', amount: 900.00, category: 'Utility', description: 'Gas' },
    { date: '2025-07-31', type: 'EXPENSE', amount: 1687.00, category: 'Maintenance', description: 'AC Service' },
    { date: '2025-07-31', type: 'EXPENSE', amount: 199.00, category: 'Entertainment', description: 'Apple' },
    { date: '2025-07-30', type: 'INCOME', amount: 3630.00, category: 'Interest', description: 'Bank' },
    { date: '2025-07-30', type: 'EXPENSE', amount: 579.00, category: 'Shopping', description: 'Amazon Pay' },
    { date: '2025-07-30', type: 'EXPENSE', amount: 904.00, category: 'Shopping', description: 'Amazon' },
    { date: '2025-07-29', type: 'EXPENSE', amount: 425.00, category: 'Food', description: 'Food' },
    { date: '2025-07-29', type: 'EXPENSE', amount: 192.00, category: 'Food', description: 'Swiggy' }
  ]
}

async function importPortfolioData() {
  try {
    console.log('🚀 Starting portfolio data import...')
    
    // For this script to work in a server context, we'll need to get the userId
    // In a real scenario, you would pass the userId as a command line argument
    // For now, we'll create a placeholder that you can replace with actual userId
    
    const userId = process.env.IMPORT_USER_ID
    if (!userId) {
      console.error('❌ Error: Please set IMPORT_USER_ID environment variable')
      console.log('   Example: IMPORT_USER_ID=user_abc123 npm run import-data')
      process.exit(1)
    }
    
    console.log(`📊 Importing data for user: ${userId}`)
    
    // Step 1: Import Bank Accounts
    console.log('\n💰 Importing bank accounts...')
    const createdAccounts = []
    for (const account of portfolioData.accounts) {
      const created = await prisma.account.create({
        data: {
          userId,
          name: account.name,
          type: account.type as any,
          balance: account.balance,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      createdAccounts.push(created)
      console.log(`   ✅ ${account.name}: ₹${account.balance.toLocaleString('en-IN')}`)
    }
    
    // Step 2: Import Fixed Deposits
    console.log('\n🏦 Importing fixed deposits...')
    for (const fd of portfolioData.fixedDeposits) {
      // Find the corresponding account
      const account = createdAccounts.find(acc => acc.name === fd.accountName)
      if (!account) {
        console.log(`   ⚠️  Account not found for FD: ${fd.accountName}`)
        continue
      }
      
      await prisma.fD.create({
        data: {
          userId,
          accountId: account.id,
          amount: fd.amount,
          interestRate: fd.rate,
          startDate: new Date(fd.startDate),
          maturityDate: new Date(fd.endDate),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`   ✅ ${fd.accountName}: ₹${fd.amount.toLocaleString('en-IN')} @ ${fd.rate}%`)
    }
    
    // Step 3: Import Gold Investments
    console.log('\n🥇 Importing gold investments...')
    for (const gold of portfolioData.goldInvestments) {
      await prisma.gold.create({
        data: {
          userId,
          date: new Date(gold.date),
          weight: gold.weight,
          ratePerGram: gold.purchaseRate,
          totalValue: gold.purchaseValue,
          description: gold.description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`   ✅ ${gold.weight}g @ ₹${gold.purchaseRate}/g = ₹${gold.purchaseValue.toLocaleString('en-IN')}`)
    }
    
    // Step 4: Import Transactions
    console.log('\n💳 Importing transactions...')
    for (const transaction of portfolioData.transactions) {
      await prisma.transaction.create({
        data: {
          userId,
          date: new Date(transaction.date),
          type: transaction.type as any,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`   ✅ ${transaction.date} | ${transaction.type} | ₹${transaction.amount} | ${transaction.category}`)
    }
    
    // Summary
    console.log('\n🎉 Import completed successfully!')
    console.log('📊 Summary:')
    console.log(`   💰 Bank Accounts: ${portfolioData.accounts.length}`)
    console.log(`   🏦 Fixed Deposits: ${portfolioData.fixedDeposits.length}`)
    console.log(`   🥇 Gold Investments: ${portfolioData.goldInvestments.length}`)
    console.log(`   💳 Transactions: ${portfolioData.transactions.length}`)
    
    const totalBalance = portfolioData.accounts.reduce((sum, acc) => sum + acc.balance, 0)
    console.log(`   💵 Total Account Balance: ₹${totalBalance.toLocaleString('en-IN')}`)
    
  } catch (error) {
    console.error('❌ Error importing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importPortfolioData()
