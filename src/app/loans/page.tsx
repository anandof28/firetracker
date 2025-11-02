"use client";

import { LoadingStates, ModalLoader } from '@/components/LoadingComponents';
import PageHeader from '@/components/PageHeader';
import { Loan, useLoans } from '@/hooks/useLoans';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LoansPage() {
  const {
    loans,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
  } = useLoans();

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [filter, setFilter] = useState<{ active?: boolean; type?: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [loanForm, setLoanForm] = useState<Loan>({
    loanName: '',
    loanType: 'personal',
    principalAmount: 0,
    interestRate: 0,
    tenureMonths: 0,
    emiAmount: 0,
    lender: '',
    loanAccountNumber: '',
    startDate: new Date(),
    currentBalance: 0,
    totalPaidAmount: 0,
    totalInterestPaid: 0,
    remainingEmis: 0,
    isActive: true,
    description: '',
    notificationEmail: '',
    reminderDays: 3,
  });

  // Fetch complete loan data for viewing details


  useEffect(() => {
    fetchLoans(filter);
  }, [fetchLoans, filter]);

  const handleCreateLoan = async () => {
    setFormLoading(true);
    try {
      await createLoan(loanForm);
      resetForm();
      setShowLoanForm(false);
    } catch (error) {
      console.error('Error creating loan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateLoan = async () => {
    if (!editingLoan?.id) return;
    setFormLoading(true);
    try {
      await updateLoan(editingLoan.id, loanForm);
      resetForm();
      setEditingLoan(null);
      setShowLoanForm(false);
    } catch (error) {
      console.error('Error updating loan:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (confirm('Are you sure you want to delete this loan? This will also delete all associated EMI records.')) {
      setFormLoading(true);
      try {
        await deleteLoan(loanId);
      } catch (error) {
        console.error('Error deleting loan:', error);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const resetForm = () => {
    setLoanForm({
      loanName: '',
      loanType: 'personal',
      principalAmount: 0,
      interestRate: 0,
      tenureMonths: 0,
      emiAmount: 0,
      lender: '',
      loanAccountNumber: '',
      startDate: new Date(),
      currentBalance: 0,
      totalPaidAmount: 0,
      totalInterestPaid: 0,
      remainingEmis: 0,
      isActive: true,
      notificationEmail: '',
      reminderDays: 3,
      description: '',
    });
  };

  const openLoanForm = () => {
    resetForm();
    setShowLoanForm(true);
  };

  const editLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setLoanForm({
      ...loan,
      startDate: new Date(loan.startDate),
    });
    setShowLoanForm(true);
  };

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return isNaN(emi) ? 0 : Math.round(emi);
  };

  const handlePrincipalOrRateOrTenureChange = () => {
    if (loanForm.principalAmount && loanForm.interestRate && loanForm.tenureMonths) {
      const calculatedEMI = calculateEMI(loanForm.principalAmount, loanForm.interestRate, loanForm.tenureMonths);
      setLoanForm(prev => ({ ...prev, emiAmount: calculatedEMI }));
    }
  };

  const getLoanTypeColor = (type: string) => {
    const colors = {
      home: 'bg-gradient-to-r from-green-500 to-green-600',
      car: 'bg-gradient-to-r from-blue-500 to-blue-600',
      personal: 'bg-gradient-to-r from-purple-500 to-purple-600',
      education: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      business: 'bg-gradient-to-r from-red-500 to-red-600',
      other: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getLoanTypeIcon = (type: string) => {
    const icons = {
      home: '🏠',
      car: '🚗',
      personal: '👤',
      education: '🎓',
      business: '💼',
      other: '📋',
    };
    return icons[type as keyof typeof icons] || icons.other;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalLoansValue = loans.reduce((sum, loan) => sum + (loan.totalOutstanding || loan.currentBalance), 0);
  const totalMonthlyEMI = loans.filter(loan => loan.isActive).reduce((sum, loan) => sum + loan.emiAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Loan Management"
          description="Track and manage your loans and EMI payments"
          buttonText="Add New Loan"
          onButtonClick={openLoanForm}
          buttonColor="primary"
        />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-gray-700 p-4 rounded-r-lg mb-6 shadow-md">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">⚠️</span>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
                {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #F3F4F6'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Outstanding</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#E88A8A' }}>{formatCurrency(totalLoansValue)}</p>
              </div>
              <div style={{
                backgroundColor: 'rgba(232, 138, 138, 0.15)',
                padding: '12px',
                borderRadius: '50%'
              }}>
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #F3F4F6'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly EMI</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#7BAACF' }}>{formatCurrency(totalMonthlyEMI)}</p>
              </div>
              <div style={{
                backgroundColor: 'rgba(123, 170, 207, 0.15)',
                padding: '12px',
                borderRadius: '50%'
              }}>
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #F3F4F6'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Loans</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#7CC5A0' }}>{loans.filter(loan => loan.isActive).length}</p>
              </div>
              <div style={{
                backgroundColor: 'rgba(124, 197, 160, 0.15)',
                padding: '12px',
                borderRadius: '50%'
              }}>
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Loan Types</option>
              <option value="home">🏠 Home Loan</option>
              <option value="car">🚗 Car Loan</option>
              <option value="personal">👤 Personal Loan</option>
              <option value="education">🎓 Education Loan</option>
              <option value="business">💼 Business Loan</option>
              <option value="other">📋 Other</option>
            </select>

            <select
              value={filter.active !== undefined ? filter.active.toString() : ''}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                active: e.target.value === '' ? undefined : e.target.value === 'true' 
              }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Loans</option>
              <option value="true">Active Loans</option>
              <option value="false">Closed Loans</option>
            </select>
          </div>
        </div>

        {/* Loans List */}
        {loading ? (
          <LoadingStates.Loans />
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <span className="text-6xl mb-4 block">💳</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Loans Found</h3>
              <p className="text-gray-500 mb-6">Start by adding your first loan to track EMI payments and balances.</p>
              <button
                onClick={openLoanForm}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
              >
                Add Your First Loan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full text-white ${getLoanTypeColor(loan.loanType)}`}>
                        <span className="text-xl">{getLoanTypeIcon(loan.loanType)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{loan.loanName}</h3>
                        <p className="text-gray-600">{loan.lender} • {loan.loanType}</p>
                        <p className="text-sm text-gray-500">
                          Started: {new Date(loan.startDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!loan.isActive && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          Closed
                        </span>
                      )}
                      <Link
                        href={`/loans/${loan.id}`}
                        className="p-2 text-gray-700 hover:bg-green-50 rounded-full transition-colors inline-flex items-center"
                        title="View Details & EMI History"
                      >
                        👁️
                      </Link>
                      <button
                        onClick={() => editLoan(loan)}
                        className="p-2 text-gray-700 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Loan"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLoan(loan.id!)}
                        className="p-2 text-gray-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Loan"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
                      <p className="text-lg font-semibold text-gray-700">{formatCurrency(loan.totalOutstanding || loan.currentBalance)}</p>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Principal:</span>
                          <span className="font-medium text-gray-700">
                            {formatCurrency(loan.pendingPrincipal || loan.currentBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest:</span>
                          <span className="font-medium text-gray-700">
                            {formatCurrency(loan.pendingInterest || 0)}
                          </span>
                        </div>
                      
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                      <p className="text-lg font-semibold text-gray-700">{formatCurrency(loan.emiAmount)}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Remaining EMIs</p>
                      <p className="text-lg font-semibold text-gray-700">{loan.remainingEmis}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Time-Based Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${loan.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.round(loan.completionPercentage || 0)}%
                        </span>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        ⏱️ {loan.monthsElapsed || 0} months elapsed of {loan.tenureMonths} months
                        <div className="text-xs text-gray-700 mt-1">
                          📊 Based on loan start date ({new Date(loan.startDate).toLocaleDateString('en-IN')})
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          📋 {loan.remainingEmis} EMIs remaining (time-based)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Amounts Breakdown */}
                  {(loan.pendingPrincipal || loan.pendingInterest) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">📊 Pending Amounts Breakdown</h4>
                      
                      {/* Principal Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Principal Progress</span>
                          <span>{Math.round(((loan.principalAmount - (loan.pendingPrincipal || 0)) / loan.principalAmount) * 100)}% paid</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.round(((loan.principalAmount - (loan.pendingPrincipal || 0)) / loan.principalAmount) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Paid: {formatCurrency(loan.principalAmount - (loan.pendingPrincipal || 0))}</span>
                          <span>Remaining: {formatCurrency(loan.pendingPrincipal || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-700">
                            {formatCurrency(loan.pendingPrincipal || loan.currentBalance)}
                          </p>
                          <p className="text-xs text-gray-600">Pending Principal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-700">
                            {formatCurrency(loan.pendingInterest || 0)}
                          </p>
                          <p className="text-xs text-gray-600">Pending Interest</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Total Pending: <span className="font-semibold text-gray-700">
                              {formatCurrency((loan.pendingPrincipal || loan.currentBalance) + (loan.pendingInterest || 0))}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {loan.nextEmiDue && (
                      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Next EMI Due:</span> {new Date(loan.nextEmiDue).toLocaleDateString('en-IN')}
                          <span className="block mt-1 text-xs">
                            💰 ₹{loan.emiAmount?.toLocaleString('en-IN')} per month
                          </span>
                        </p>
                      </div>
                    )}
                    
                    {loan.emiEndDate && (
                      <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">EMI End Date:</span> {new Date(loan.emiEndDate).toLocaleDateString('en-IN')}
                          <span className="block mt-1 text-xs">
                            🎯 Loan completion date
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {loan.notificationEmail && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">📧 EMI Reminders:</span> {loan.notificationEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loan Form Modal */}
        {showLoanForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowLoanForm(false);
              setEditingLoan(null);
              resetForm();
            }}
          >
            <div 
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingLoan ? 'Edit Loan' : 'Add New Loan'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowLoanForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Loan Name *</label>
                  <input
                    type="text"
                    value={loanForm.loanName}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, loanName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Home Loan HDFC"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Loan Type</label>
                  <select
                    value={loanForm.loanType}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, loanType: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="home">🏠 Home Loan</option>
                    <option value="car">🚗 Car Loan</option>
                    <option value="personal">👤 Personal Loan</option>
                    <option value="education">🎓 Education Loan</option>
                    <option value="business">💼 Business Loan</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Lender *</label>
                  <input
                    type="text"
                    value={loanForm.lender}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, lender: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., HDFC Bank"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Loan Account Number</label>
                  <input
                    type="text"
                    value={loanForm.loanAccountNumber}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, loanAccountNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Principal Amount (₹) *</label>
                  <input
                    type="number"
                    value={loanForm.principalAmount || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setLoanForm(prev => ({ ...prev, principalAmount: value, currentBalance: value }));
                      setTimeout(handlePrincipalOrRateOrTenureChange, 100);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 5000000"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Interest Rate (% per annum) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanForm.interestRate || ''}
                    onChange={(e) => {
                      setLoanForm(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }));
                      setTimeout(handlePrincipalOrRateOrTenureChange, 100);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 8.5"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Tenure (Months) *</label>
                  <input
                    type="number"
                    value={loanForm.tenureMonths || ''}
                    onChange={(e) => {
                      const months = parseInt(e.target.value) || 0;
                      setLoanForm(prev => ({ ...prev, tenureMonths: months, remainingEmis: months }));
                      setTimeout(handlePrincipalOrRateOrTenureChange, 100);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 240 (20 years)"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">EMI Amount (₹)</label>
                  <input
                    type="number"
                    value={loanForm.emiAmount || ''}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, emiAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50"
                    placeholder="Auto-calculated"
                    readOnly
                  />
                  <p className="text-xs text-gray-700 mt-1">Auto-calculated based on principal, rate, and tenure</p>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={loanForm.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Processing Fee (₹)</label>
                  <input
                    type="number"
                    value={loanForm.processingFee || ''}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, processingFee: parseFloat(e.target.value) || undefined }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Insurance Amount (₹)</label>
                  <input
                    type="number"
                    value={loanForm.insurance || ''}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, insurance: parseFloat(e.target.value) || undefined }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Prepayment Charges (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanForm.prepaymentCharges || ''}
                    onChange={(e) => setLoanForm(prev => ({ ...prev, prepaymentCharges: parseFloat(e.target.value) || undefined }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 2.0"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-3">Description</label>
                <textarea
                  value={loanForm.description}
                  onChange={(e) => setLoanForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Add any additional notes about this loan..."
                />
              </div>

              <div className="mt-6">
                <label className="block font-semibold text-gray-700 mb-3">
                  📧 EMI Notification Email
                </label>
                <input
                  type="email"
                  value={loanForm.notificationEmail || ''}
                  onChange={(e) => setLoanForm(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter email address for EMI reminders (optional)"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Receive EMI reminders 3 days before the due date
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={editingLoan ? handleUpdateLoan : handleCreateLoan}
                  disabled={!loanForm.loanName || !loanForm.lender || !loanForm.principalAmount}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium transform hover:scale-105 disabled:transform-none"
                >
                  {editingLoan ? 'Update Loan' : 'Create Loan'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowLoanForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay for Form Actions */}
        {formLoading && <ModalLoader message="Processing loan data..." />}
      </div>

    </div>
  );
}