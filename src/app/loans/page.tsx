"use client";

import { useState, useEffect } from 'react';
import { useLoans, Loan } from '@/hooks/useLoans';
import { LoadingStates, ModalLoader } from '@/components/LoadingComponents';

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
  });

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

  const totalLoansValue = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const totalMonthlyEMI = loans.filter(loan => loan.isActive).reduce((sum, loan) => sum + loan.emiAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loan Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage your loans and EMI payments</p>
          </div>
          <button
            onClick={openLoanForm}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-lg">➕</span>
            Add New Loan
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg mb-6 shadow-md">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoansValue)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyEMI)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loans.filter(loan => loan.isActive).length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
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
                      <button
                        onClick={() => editLoan(loan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Loan"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLoan(loan.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Loan"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(loan.currentBalance)}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                      <p className="text-lg font-semibold text-blue-600">{formatCurrency(loan.emiAmount)}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Remaining EMIs</p>
                      <p className="text-lg font-semibold text-orange-600">{loan.remainingEmis}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${loan.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(loan.completionPercentage || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {loan.nextEmiDue && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Next EMI Due:</span> {new Date(loan.nextEmiDue).toLocaleDateString('en-IN')}
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
          <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/40 to-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-scaleIn border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingLoan ? '✏️ Edit Loan' : '➕ Add New Loan'}
                </h3>
                <button
                  onClick={() => {
                    setShowLoanForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                </button>
              </div>
              
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
                  <p className="text-xs text-blue-600 mt-1">Auto-calculated based on principal, rate, and tenure</p>
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
              
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={editingLoan ? handleUpdateLoan : handleCreateLoan}
                  disabled={!loanForm.loanName || !loanForm.lender || !loanForm.principalAmount}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingLoan ? '✅ Update Loan' : '➕ Create Loan'}
                </button>
                
                <button
                  onClick={() => {
                    setShowLoanForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  ❌ Cancel
                </button>
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