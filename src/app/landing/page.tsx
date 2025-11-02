'use client'

import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [goldRate, setGoldRate] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCount, setAnimatedCount] = useState({ accounts: 0, fds: 0, users: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Fade in animation
    setIsVisible(true)
    
    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    
    // Fetch current gold rate for the hero section
    fetch('/api/gold-rate')
      .then(res => res.json())
      .then(data => setGoldRate(data.goldRate))
      .catch(() => setGoldRate(9290)) // fallback rate
    
    // Animate counters
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepTime = duration / steps
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      setAnimatedCount({
        accounts: Math.floor(50 * progress),
        fds: Math.floor(999 * progress),
        users: Math.floor(5000 * progress)
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedCount({ accounts: 50, fds: 999, users: 5000 })
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.5a2 2 0 011.732-1.964l.268-.077A2 2 0 018 15.5V21m8 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v12" />
        </svg>
      ),
      title: 'Multi-Bank Account Management',
      description: 'Track unlimited bank accounts, balances, and transactions in one secure dashboard.',
      stats: 'Up to 50+ accounts'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Fixed Deposit Tracking',
      description: 'Monitor FD maturity dates, interest rates, and calculate returns automatically.',
      stats: 'Smart notifications'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Gold Investment Portfolio',
      description: 'Track gold purchases with real-time rate updates and profit/loss calculations.',
      stats: `Live rate: ₹${goldRate?.toLocaleString('en-IN') || '9,290'}/gram`
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Expense & Income Analytics',
      description: 'Categorize transactions and get insights into your spending patterns.',
      stats: '15+ categories'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Financial Goal Setting',
      description: 'Set savings goals and track your progress with visual indicators.',
      stats: 'Progress tracking'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Loan & EMI Management',
      description: 'Track multiple loans with automated EMI calculations, payment schedules, and progress monitoring.',
      stats: 'Calendar view & alerts'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Smart Calendar & Reminders',
      description: 'Never miss FD maturity dates, EMI payments, or important financial deadlines.',
      stats: 'Email notifications'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Budget Tracking & Insights',
      description: 'Set monthly budgets, track spending by category, and get AI-powered savings recommendations.',
      stats: 'Smart insights'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Portfolio Reports',
      description: 'Generate comprehensive reports of your complete financial portfolio.',
      stats: 'Export to PDF'
    }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      content: 'Finally, a tool that understands Indian banking! Tracking my 8 bank accounts and FDs has never been easier.',
      avatar: (
        <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      content: 'The gold tracking feature is amazing. I can see my investment performance in real-time with current market rates.',
      avatar: (
        <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
    {
      name: 'Anita Desai',
      role: 'Investment Advisor',
      content: 'I recommend Fire Tracker to all my clients. The multi-bank support and FD tracking are game-changers.',
      avatar: (
        <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Fire Tracker</h1>
                <p className="text-xs text-blue-600 font-semibold -mt-1">PUBLIC BETA</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Start Free →
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Dashboard →
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-slate-50 to-indigo-100/50 animate-gradient-shift"></div>
        
        {/* Animated Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-30 animate-float-delayed"></div>
          <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-float-slow"></div>
          <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-blue-300 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-3/4 left-1/2 w-2 h-2 bg-indigo-300 rounded-full opacity-30 animate-float-delayed"></div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            {/* Financial Chart Lines */}
            <path d="M50 300 L100 250 L150 280 L200 200 L250 180 L300 150 L350 120" stroke="currentColor" strokeWidth="2" className="text-gray-700"/>
            <path d="M50 350 L100 320 L150 340 L200 280 L250 260 L300 230 L350 200" stroke="currentColor" strokeWidth="2" className="text-gray-700"/>
            
            {/* Currency Symbols */}
            <text x="80" y="100" className="fill-current text-gray-700" fontSize="24" fontFamily="serif">₹</text>
            <text x="200" y="80" className="fill-current text-gray-700" fontSize="20" fontFamily="serif">$</text>
            <text x="320" y="90" className="fill-current text-gray-700" fontSize="22" fontFamily="serif">€</text>
            
            {/* Chart Bars */}
            <rect x="60" y="250" width="8" height="50" className="fill-current text-gray-700"/>
            <rect x="80" y="220" width="8" height="80" className="fill-current text-gray-700"/>
            <rect x="100" y="240" width="8" height="60" className="fill-current text-gray-700"/>
            
            {/* Circular Elements */}
            <circle cx="280" cy="180" r="3" className="fill-current text-gray-700"/>
            <circle cx="320" cy="160" r="4" className="fill-current text-gray-700"/>
            <circle cx="160" cy="200" r="3" className="fill-current text-gray-700"/>
          </svg>
        </div>
        
        {/* Floating Financial Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gold Icon */}
          <div className="absolute top-20 right-20 opacity-10">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          
          {/* Bank Icon */}
          <div className="absolute top-40 left-20 opacity-10">
            <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.5a2 2 0 011.732-1.964l.268-.077A2 2 0 018 15.5V21m8 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v12"/>
            </svg>
          </div>
          
          {/* Chart Icon */}
          <div className="absolute bottom-20 right-32 opacity-10">
            <svg className="w-18 h-18 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          
          {/* Coin Icon */}
          <div className="absolute bottom-32 left-16 opacity-10">
            <svg className="w-14 h-14 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="inline-flex items-center px-5 py-2.5 bg-white rounded-full text-slate-800 text-sm font-bold mb-8 shadow-lg border border-blue-100 hover:scale-110 transition-transform duration-300 cursor-pointer animate-bounce-slow">
            <span className="text-blue-600 mr-2 animate-pulse">🎉</span>
            PUBLIC BETA NOW LIVE
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Master Your <br/>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-shift">
              Financial Freedom
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            The most comprehensive personal finance platform for Indians. Track bank accounts, 
            fixed deposits, gold investments, and expenses with real-time insights and beautiful dashboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center justify-center hover:scale-105 animate-pulse-subtle group">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Start Free Beta
                </button>
              </SignUpButton>
              <button className="border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-blue-50 flex items-center justify-center hover:scale-105 group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a4 4 0 118 0v1M9 10H5m10 0h4"/>
                </svg>
                Watch Demo
              </button>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-2xl inline-flex items-center justify-center hover:scale-105 group"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>

          {/* Dashboard Preview Visual */}
          <div className="max-w-6xl mx-auto mt-16 relative">
            {/* Dashboard Mock */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100 relative">
              {/* Net Worth Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6">
                <div className="text-white/80 text-sm font-semibold mb-2">TOTAL NET WORTH</div>
                <div className="text-white text-4xl md:text-5xl font-bold">₹19.35L</div>
                <div className="text-white/70 text-sm mt-2">₹19,35,000</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">4</span>
                  </div>
                  <div className="text-slate-600 text-xs font-medium">Bank Accounts</div>
                  <div className="text-slate-900 text-lg font-bold">₹12.5L</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">13</span>
                  </div>
                  <div className="text-slate-600 text-xs font-medium">Fixed Deposits</div>
                  <div className="text-slate-900 text-lg font-bold">₹4.8L</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">320g</span>
                  </div>
                  <div className="text-slate-600 text-xs font-medium">Gold Holdings</div>
                  <div className="text-slate-900 text-lg font-bold">₹2.05L</div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">2</span>
                  </div>
                  <div className="text-slate-600 text-xs font-medium">Active Loans</div>
                  <div className="text-slate-900 text-lg font-bold">₹8.5L</div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl border border-blue-100">
              <p className="text-slate-600 text-sm font-semibold">✨ Your dashboard will look like this</p>
            </div>
          </div>

          {/* Hero Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
              <div className="text-4xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">{animatedCount.accounts}+</div>
              <div className="text-slate-700 font-semibold">Bank Accounts</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
              <div className="text-4xl font-black text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">{animatedCount.fds}+</div>
              <div className="text-slate-700 font-semibold">Fixed Deposits</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
              <div className="text-4xl font-black text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse">Live</div>
              <div className="text-slate-700 font-semibold">Gold Rates</div>
              <p className="text-xs text-amber-700 mt-1 font-semibold">₹{goldRate?.toLocaleString('en-IN') || '...'}</p>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
              <div className="text-4xl font-black text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">{animatedCount.users}+</div>
              <div className="text-slate-700 font-semibold">Users Joined</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Financial Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Indian investors with support for all major banks, 
              financial instruments, and investment types.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white group cursor-pointer"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` 
                }}
              >
                <div className="text-blue-600 mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-sm text-blue-600 font-semibold flex items-center">
                  <span className="mr-2">✨</span>
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Your Complete Financial Picture
            </h2>
            <p className="text-xl text-gray-600">
              Get instant insights into your net worth, investment performance, and spending patterns.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-700">₹19.35L</div>
                <div className="text-gray-600">Total Portfolio</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-700">+₹14.8L</div>
                <div className="text-gray-600">Gold Profit</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-700">13</div>
                <div className="text-gray-600">Active FDs</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-500 mb-4">Sample portfolio data - Your real data will appear here</div>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                    Import Your Portfolio Data
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Indian Investors
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of users already managing their finances with Fire Tracker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-8 hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both` 
                }}
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{testimonial.avatar}</div>
                <p className="text-gray-700 mb-6 italic group-hover:text-gray-900 transition-colors">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the beta and get lifetime free access to all premium features. 
            No credit card required.
          </p>
          
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-white hover:bg-gray-100 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl mr-4 inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Start Your Free Beta Account
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/import-portfolio"
              className="bg-white hover:bg-gray-100 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Import Your Portfolio Data
            </Link>
          </SignedIn>
          
          <div className="mt-8 text-white/80">
            <div className="flex items-center justify-center space-x-8 text-sm font-medium">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Free Forever (Beta)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                No Credit Card
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Secure & Private
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FT</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Fire Tracker</h3>
                  <p className="text-xs text-gray-700">BETA</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">The ultimate personal finance platform for Indian investors.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Bank Account Tracking</li>
                <li>Fixed Deposit Management</li>
                <li>Gold Investment Portfolio</li>
                <li>Expense Analytics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/support/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/support/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/support/feedback" className="hover:text-white transition-colors">Beta Feedback</Link></li>
                <li><Link href="/support/feature-requests" className="hover:text-white transition-colors">Feature Requests</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Beta Program</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Free Access</li>
                <li>All Features Included</li>
                <li>Priority Support</li>
                <li>Lifetime Benefits</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p className="flex items-center justify-center">
              &copy; 2025 Fire Tracker Beta. Built with 
              <svg className="w-4 h-4 mx-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              for Indian investors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
