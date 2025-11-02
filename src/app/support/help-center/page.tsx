'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('getting-started')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          title: 'Welcome to Fire Tracker - Quick Setup Guide',
          content: `
            <p>Welcome to Fire Tracker! Here's how to get started with managing your finances:</p>
            
            <h3>1. Create Your First Account</h3>
            <p>Start by adding your bank accounts in the Accounts section. This will help you track your liquid cash and link transactions.</p>
            
            <h3>2. Add Your Investments</h3>
            <p>Use the Investments dropdown to add:</p>
            <ul>
              <li><strong>Fixed Deposits:</strong> Track your FDs with automatic maturity notifications</li>
              <li><strong>Gold Investments:</strong> Monitor your gold portfolio with live rate updates</li>
              <li><strong>Mutual Funds:</strong> Track your mutual fund investments with NAV updates</li>
            </ul>
            
            <h3>3. Log Transactions</h3>
            <p>Keep track of your income and expenses through the Transactions page. Categorize your spending for better insights.</p>
            
            <h3>4. Set Financial Goals</h3>
            <p>Create savings goals in the Goals section and track your progress over time.</p>
            
            <h3>5. Monitor Your Portfolio</h3>
            <p>Use the Dashboard to get an overview of your entire financial portfolio in one place.</p>
          `
        },
        {
          title: 'Understanding Your Dashboard',
          content: `
            <p>Your dashboard provides a comprehensive overview of your financial health:</p>
            
            <h3>Portfolio Summary</h3>
            <p>View your total assets broken down by category:</p>
            <ul>
              <li><strong>Liquid Cash:</strong> Total balance across all bank accounts</li>
              <li><strong>Fixed Deposits:</strong> Current FD investments and maturity values</li>
              <li><strong>Gold Holdings:</strong> Current value of gold investments with live rates</li>
            </ul>
            
            <h3>Investment Overview</h3>
            <p>See percentage allocation of your assets and performance metrics.</p>
            
            <h3>Recent Activity</h3>
            <p>Quick view of your latest transactions and investment activities.</p>
            
            <h3>Notifications</h3>
            <p>Important alerts for FD maturities and other financial events.</p>
          `
        },
        {
          title: 'First-Time User Guide',
          content: `
            <p>New to Fire Tracker? Follow these steps to set up your financial tracking:</p>
            
            <h3>Step 1: Complete Your Profile</h3>
            <p>Make sure your account is set up with the correct information.</p>
            
            <h3>Step 2: Add Bank Accounts</h3>
            <p>Start with your primary savings and checking accounts. You can add more later.</p>
            
            <h3>Step 3: Import Existing Data</h3>
            <p>If you have existing investments, add them to get a complete picture of your portfolio.</p>
            
            <h3>Step 4: Set Up Categories</h3>
            <p>Customize your transaction categories to match your spending patterns.</p>
            
            <h3>Step 5: Create Your First Goal</h3>
            <p>Set a financial goal to start tracking your progress.</p>
            
            <h3>Pro Tips:</h3>
            <ul>
              <li>Update your data regularly for accurate insights</li>
              <li>Use the import feature for bulk data entry</li>
              <li>Set up notifications for important dates</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'accounts',
      name: 'Accounts & Banking',
      icon: '🏦',
      articles: [
        {
          title: 'Managing Bank Accounts',
          content: `
            <p>Learn how to effectively manage your bank accounts in Fire Tracker:</p>
            
            <h3>Adding a New Account</h3>
            <p>To add a bank account:</p>
            <ol>
              <li>Go to the Accounts page</li>
              <li>Click "Add New Account"</li>
              <li>Enter account name and current balance</li>
              <li>Save the account</li>
            </ol>
            
            <h3>Account Types</h3>
            <p>Fire Tracker supports all types of accounts:</p>
            <ul>
              <li>Savings Accounts</li>
              <li>Checking Accounts</li>
              <li>Credit Card Accounts</li>
              <li>Investment Accounts</li>
            </ul>
            
            <h3>Updating Balances</h3>
            <p>Keep your account balances up to date for accurate portfolio tracking.</p>
            
            <h3>Account Security</h3>
            <p>Your account information is encrypted and secure. We never store your actual banking credentials.</p>
          `
        },
        {
          title: 'Account Categories and Organization',
          content: `
            <p>Organize your accounts effectively:</p>
            
            <h3>Naming Convention</h3>
            <p>Use clear, descriptive names for your accounts (e.g., "SBI Savings", "HDFC Credit Card").</p>
            
            <h3>Active vs Inactive Accounts</h3>
            <p>Mark accounts as inactive if you're not using them regularly. This helps focus on your active finances.</p>
            
            <h3>Account Linking</h3>
            <p>Link transactions to specific accounts for better tracking and categorization.</p>
          `
        }
      ]
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: '📈',
      articles: [
        {
          title: 'Fixed Deposit Management',
          content: `
            <p>Track and manage your Fixed Deposits effectively:</p>
            
            <h3>Adding FDs</h3>
            <p>When adding a Fixed Deposit:</p>
            <ul>
              <li>Enter the principal amount and interest rate</li>
              <li>Set the start and maturity dates</li>
              <li>Link to the source bank account</li>
            </ul>
            
            <h3>Maturity Notifications</h3>
            <p>Fire Tracker automatically notifies you:</p>
            <ul>
              <li>45 days before maturity (yellow alert)</li>
              <li>On maturity date (orange/red alert)</li>
            </ul>
            
            <h3>Calculating Returns</h3>
            <p>The system automatically calculates maturity amounts using compound interest formulas.</p>
            
            <h3>Renewal Tracking</h3>
            <p>Keep track of FD renewals and create new entries when you reinvest.</p>
          `
        },
        {
          title: 'Gold Investment Tracking',
          content: `
            <p>Monitor your gold investments with live market rates:</p>
            
            <h3>Adding Gold Purchases</h3>
            <p>Record your gold investments by:</p>
            <ul>
              <li>Entering weight in grams</li>
              <li>Recording purchase value</li>
              <li>Adding purchase date</li>
            </ul>
            
            <h3>Live Rate Updates</h3>
            <p>Fire Tracker fetches live gold rates to show your current portfolio value.</p>
            
            <h3>Gold Types</h3>
            <p>The system supports different gold purities (22K, 24K) and formats (jewelry, coins, bars).</p>
            
            <h3>Performance Tracking</h3>
            <p>View your gold investment performance over time with gain/loss calculations.</p>
          `
        },
        {
          title: 'Mutual Fund Portfolio',
          content: `
            <p>Manage your mutual fund investments:</p>
            
            <h3>Adding Mutual Funds</h3>
            <p>Search and add mutual funds by:</p>
            <ul>
              <li>Scheme name or ISIN code</li>
              <li>Investment amount and date</li>
              <li>SIP or lumpsum details</li>
            </ul>
            
            <h3>NAV Updates</h3>
            <p>Automatic NAV updates help track current portfolio value.</p>
            
            <h3>Performance Metrics</h3>
            <p>Track returns, XIRR, and portfolio allocation.</p>
            
            <h3>SIP Management</h3>
            <p>Manage recurring SIP investments and track their performance.</p>
          `
        }
      ]
    },
    {
      id: 'transactions',
      name: 'Transactions & Analytics',
      icon: '💸',
      articles: [
        {
          title: 'Transaction Management',
          content: `
            <p>Effectively track your income and expenses:</p>
            
            <h3>Adding Transactions</h3>
            <p>Record transactions by entering:</p>
            <ul>
              <li>Amount and type (income/expense)</li>
              <li>Category and subcategory</li>
              <li>Account association</li>
              <li>Notes and description</li>
            </ul>
            
            <h3>Categories</h3>
            <p>Use predefined categories or create custom ones:</p>
            <ul>
              <li>Food & Dining</li>
              <li>Transportation</li>
              <li>Shopping</li>
              <li>Bills & Utilities</li>
              <li>Salary & Income</li>
            </ul>
            
            <h3>Bulk Import</h3>
            <p>Import transactions from bank statements using CSV files.</p>
            
            <h3>Analytics</h3>
            <p>View spending patterns, trends, and category-wise breakdowns.</p>
          `
        },
        {
          title: 'Expense Analytics',
          content: `
            <p>Understand your spending patterns:</p>
            
            <h3>Monthly Reports</h3>
            <p>View detailed monthly expense reports with category breakdowns.</p>
            
            <h3>Trends</h3>
            <p>Identify spending trends over time to make better financial decisions.</p>
            
            <h3>Budgeting</h3>
            <p>Set category-wise budgets and track your adherence.</p>
            
            <h3>Export Options</h3>
            <p>Export your transaction data for external analysis or tax purposes.</p>
          `
        }
      ]
    },
    {
      id: 'goals',
      name: 'Goals & Planning',
      icon: '🎯',
      articles: [
        {
          title: 'Setting Financial Goals',
          content: `
            <p>Create and track your financial objectives:</p>
            
            <h3>Goal Types</h3>
            <p>Set various types of financial goals:</p>
            <ul>
              <li>Emergency Fund</li>
              <li>House Down Payment</li>
              <li>Vacation Fund</li>
              <li>Retirement Savings</li>
              <li>Custom Goals</li>
            </ul>
            
            <h3>Goal Tracking</h3>
            <p>Monitor progress with:</p>
            <ul>
              <li>Target amount and deadline</li>
              <li>Current progress percentage</li>
              <li>Monthly contribution tracking</li>
              <li>Timeline projections</li>
            </ul>
            
            <h3>Funding Goals</h3>
            <p>Add funds to goals regularly to track progress and stay motivated.</p>
            
            <h3>Goal Achievement</h3>
            <p>Celebrate when you reach your goals and set new ones!</p>
          `
        }
      ]
    },
    {
      id: 'reports',
      name: 'Reports & Export',
      icon: '📊',
      articles: [
        {
          title: 'Portfolio Reports',
          content: `
            <p>Generate comprehensive reports for your financial portfolio:</p>
            
            <h3>Available Reports</h3>
            <ul>
              <li>Portfolio Summary Report</li>
              <li>Asset Allocation Report</li>
              <li>Investment Performance Report</li>
              <li>Transaction History Report</li>
              <li>Tax Planning Report</li>
            </ul>
            
            <h3>Export Formats</h3>
            <p>Export reports in multiple formats:</p>
            <ul>
              <li>PDF for printing and sharing</li>
              <li>Excel for further analysis</li>
              <li>CSV for data processing</li>
            </ul>
            
            <h3>Customization</h3>
            <p>Customize reports by date range, categories, and specific accounts.</p>
          `
        }
      ]
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          title: 'Common Issues and Solutions',
          content: `
            <p>Solutions to frequently encountered issues:</p>
            
            <h3>Login Issues</h3>
            <p>If you're having trouble logging in:</p>
            <ul>
              <li>Check your internet connection</li>
              <li>Clear browser cache and cookies</li>
              <li>Try a different browser</li>
              <li>Reset your password if needed</li>
            </ul>
            
            <h3>Data Not Loading</h3>
            <p>If your data isn't showing:</p>
            <ul>
              <li>Refresh the page</li>
              <li>Check if you have data in that section</li>
              <li>Verify your internet connection</li>
              <li>Contact support if the issue persists</li>
            </ul>
            
            <h3>Gold Rate Issues</h3>
            <p>If gold rates aren't updating:</p>
            <ul>
              <li>The system fetches rates from multiple sources</li>
              <li>Rates are updated multiple times daily</li>
              <li>Manual override is available if needed</li>
              <li>Static fallback rates are used if sources are unavailable</li>
            </ul>
            
            <h3>Performance Issues</h3>
            <p>If the app is running slowly:</p>
            <ul>
              <li>Close other browser tabs</li>
              <li>Clear browser cache</li>
              <li>Check your internet speed</li>
              <li>Try using a different browser</li>
            </ul>
          `
        },
        {
          title: 'Browser Compatibility',
          content: `
            <p>Fire Tracker works best with modern browsers:</p>
            
            <h3>Recommended Browsers</h3>
            <ul>
              <li>Chrome (latest version)</li>
              <li>Firefox (latest version)</li>
              <li>Safari (latest version)</li>
              <li>Edge (latest version)</li>
            </ul>
            
            <h3>Mobile Support</h3>
            <p>The application is fully responsive and works on mobile devices and tablets.</p>
            
            <h3>JavaScript Requirement</h3>
            <p>JavaScript must be enabled for the application to function properly.</p>
          `
        }
      ]
    }
  ]

  const filteredArticles = categories
    .find(cat => cat.id === activeCategory)?.articles
    .filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of Fire Tracker
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {category.articles.length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="space-y-6">
              {filteredArticles.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">Try adjusting your search or selecting a different category.</p>
                </div>
              ) : (
                filteredArticles.map((article, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{article.title}</h2>
                    <div 
                      className="prose prose-blue max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h3>
            <p className="text-gray-600">Can't find what you're looking for? We're here to help!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/support/contact" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600">Get in touch with our support team</p>
            </Link>

            <Link href="/support/feedback" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Beta Feedback</h4>
              <p className="text-sm text-gray-600">Share your experience and suggestions</p>
            </Link>

            <Link href="/support/feature-requests" className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Feature Requests</h4>
              <p className="text-sm text-gray-600">Request new features and improvements</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
