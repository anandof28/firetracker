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
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'accounts',
    title: 'Start with Bank Accounts 🏦',
    description: 'Add your bank accounts to track balances and transactions. You can connect multiple accounts from different banks.',
    icon: (
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('FirstTimeUserGuide mounted', { isLoaded, user: !!user, isVisible })
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // Check if user has seen the guide before
    try {
      const hasSeenGuide = localStorage.getItem('fire-tracker-guide-completed')
      
      if (!hasSeenGuide && user) {
        // Show guide after a brief delay for better UX
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 800)
        
        return () => clearTimeout(timer)
      }
    } catch (error) {
      // If localStorage is not available, don't show guide
      console.error('localStorage error:', error)
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

  // Add escape key listener to close guide
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        console.log('Escape pressed, closing guide')
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isVisible])

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
    console.log('Skipping guide')
    setIsCompleted(true)
    try {
      localStorage.setItem('fire-tracker-guide-completed', 'true')
      console.log('Guide marked as completed in localStorage')
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
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
        title="Show Getting Started Guide"
        className="group"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#5271FF',
          color: '#FFFFFF',
          padding: '14px',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(82, 113, 255, 0.35)',
          transition: 'all 200ms ease',
          zIndex: 40,
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3E5EEC'
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 113, 255, 0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#5271FF'
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(82, 113, 255, 0.35)'
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span 
          className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{
            backgroundColor: '#1A1F2C',
            color: '#FFFFFF',
          }}
        >
          Getting Started Guide
        </span>
      </button>
    )
  }

  const currentStepData = guideSteps[currentStep]

  return (
    <div 
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          handleSkip()
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        position: 'relative',
      }}>
        {!isCompleted ? (
          <div className="p-8">
            {/* Close Button */}
            <button
              onClick={handleSkip}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 180ms ease',
                color: '#68738A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E7EB'
                e.currentTarget.style.color = '#1A1F2C'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
                e.currentTarget.style.color = '#68738A'
              }}
              title="Close guide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#68738A' }}>
                  Step {currentStep + 1} of {guideSteps.length}
                </span>
                <button
                  onClick={handleSkip}
                  style={{
                    fontSize: '14px',
                    color: '#68738A',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1A1F2C'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#68738A'
                  }}
                >
                  Skip Guide
                </button>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: '#E5E7EB',
                borderRadius: '9999px',
                height: '8px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #5271FF 0%, #7C93FF 100%)',
                    height: '8px',
                    borderRadius: '9999px',
                    transition: 'all 300ms ease',
                    width: `${((currentStep + 1) / guideSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                {currentStepData.icon}
              </div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: '#1A1F2C', 
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}>
                {currentStepData.title}
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#68738A', 
                lineHeight: 1.7,
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                {currentStepData.description}
              </p>
            </div>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="mb-6 text-center">
                <a
                  href={currentStepData.action.href}
                  onClick={handleSkip} // Close guide when action is taken
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #5271FF 0%, #7C93FF 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '10px',
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(82, 113, 255, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 113, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 113, 255, 0.3)'
                  }}
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  color: '#68738A',
                  fontWeight: 500,
                  opacity: currentStep === 0 ? 0.4 : 1,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 180ms ease',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  if (currentStep !== 0) {
                    e.currentTarget.style.color = '#1A1F2C'
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#68738A'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
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
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      transition: 'all 200ms ease',
                      backgroundColor: index === currentStep
                        ? '#5271FF'
                        : index < currentStep
                        ? '#A5B4FC'
                        : '#D1D5DB',
                      transform: index === currentStep ? 'scale(1.25)' : 'scale(1)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  backgroundColor: '#5271FF',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  borderRadius: '8px',
                  transition: 'all 180ms ease',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(82, 113, 255, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3E5EEC'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 113, 255, 0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#5271FF'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(82, 113, 255, 0.25)'
                }}
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
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #45B97C 0%, #63C991 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(69, 185, 124, 0.3)',
              }}>
                <svg className="w-8 h-8" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: '#1A1F2C', 
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}>
                You're All Set! 🎉
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#68738A', 
                marginBottom: '24px',
              }}>
                Here are some helpful tips to get the most out of Fire Tracker:
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #E4E8FF 0%, #F5E6FF 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: 500, 
                color: '#1A1F2C',
                transition: 'all 300ms ease',
              }}>
                {tips[currentTip]}
              </p>
            </div>

            <div className="flex justify-center space-x-2 mb-6">
              {tips.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    transition: 'all 300ms ease',
                    backgroundColor: index === currentTip ? '#5271FF' : '#D1D5DB',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setIsVisible(false)}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #5271FF 0%, #7C93FF 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                borderRadius: '10px',
                transition: 'all 200ms ease',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(82, 113, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 113, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 113, 255, 0.3)'
              }}
            >
              Start Exploring
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
