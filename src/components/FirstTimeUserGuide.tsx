'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface GuideStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    text: string
    href: string
  }
}

const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Fire Tracker! 🎉',
    description: 'Your personal finance management platform is ready. Let\'s take a quick tour to get you started.',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'accounts',
    title: 'Start with Bank Accounts 🏦',
    description: 'Add your bank accounts to track balances and transactions. You can connect multiple accounts from different banks.',
    icon: (
      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    action: {
      text: 'Add First Account',
      href: '/accounts'
    }
  },
  {
    id: 'transactions',
    title: 'Track Transactions 💳',
    description: 'Record your income and expenses with categories. This helps you understand your spending patterns and manage budgets.',
    icon: (
      <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    action: {
      text: 'Add Transactions',
      href: '/transactions'
    }
  },
  {
    id: 'investments',
    title: 'Manage Investments 📈',
    description: 'Add your fixed deposits, gold investments, and mutual funds. Track maturity dates, interest rates, and performance.',
    icon: (
      <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    action: {
      text: 'Explore Investments',
      href: '/fds'
    }
  },
  {
    id: 'budgets',
    title: 'Set Budget Goals 🎯',
    description: 'Create budgets for different categories and get alerts when you\'re approaching limits. Stay on top of your financial goals.',
    icon: (
      <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    action: {
      text: 'Create Budget',
      href: '/budgets'
    }
  },
  {
    id: 'import',
    title: 'Quick Start with Sample Data 🚀',
    description: 'Want to explore features immediately? Import sample portfolio data to see how everything works together.',
    icon: (
      <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    action: {
      text: 'Import Sample Data',
      href: '/import-portfolio'
    }
  }
]

const tips = [
  '💡 Tip: Use categories consistently for better expense tracking',
  '📊 Tip: Check your dashboard regularly for spending insights',
  '🔔 Tip: Enable budget alerts to stay within limits',
  '📈 Tip: Review your FD maturity dates monthly',
  '🥇 Tip: Gold rates update daily for accurate portfolio value',
  '🎯 Tip: Set realistic financial goals for better success'
]

export default function FirstTimeUserGuide() {
  const { user, isLoaded } = useUser()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    if (!isLoaded) return

    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('fire-tracker-guide-completed')
    
    if (!hasSeenGuide && user) {
      // Show guide after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (showTips) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length)
      }, 3000) // Change tip every 3 seconds

      return () => clearInterval(interval)
    }
  }, [showTips])

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsCompleted(true)
    localStorage.setItem('fire-tracker-guide-completed', 'true')
    
    // Show tips for a few seconds before hiding
    setShowTips(true)
    setTimeout(() => {
      setIsVisible(false)
      setShowTips(false)
    }, 10000) // Show tips for 10 seconds
  }

  const handleSkip = () => {
    setIsCompleted(true)
    localStorage.setItem('fire-tracker-guide-completed', 'true')
    setIsVisible(false)
  }

  const resetGuide = () => {
    localStorage.removeItem('fire-tracker-guide-completed')
    setCurrentStep(0)
    setIsCompleted(false)
    setIsVisible(true)
    setShowTips(false)
  }

  if (!isVisible) {
    return (
      // Show a small help button for users to reopen the guide
      <button
        onClick={resetGuide}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40 group"
        title="Show Getting Started Guide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Getting Started Guide
        </span>
      </button>
    )
  }

  const currentStepData = guideSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {!isCompleted ? (
          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {guideSteps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip Guide
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                {currentStepData.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="mb-6 text-center">
                <a
                  href={currentStepData.action.href}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  onClick={handleSkip} // Close guide when action is taken
                >
                  {currentStepData.action.text}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v10" />
                  </svg>
                </a>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex space-x-2">
                {guideSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-blue-600 scale-125'
                        : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {currentStep === guideSteps.length - 1 ? 'Get Started' : 'Next'}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : showTips ? (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're All Set! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Here are some helpful tips to get the most out of Fire Tracker:
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <p className="text-lg font-medium text-gray-800 transition-all duration-300">
                {tips[currentTip]}
              </p>
            </div>

            <div className="flex justify-center space-x-2 mb-6">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTip ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Start Exploring
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
