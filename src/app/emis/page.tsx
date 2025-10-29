"use client";

import { useState, useEffect } from 'react';
import { useEMIs, EMIPayment } from '@/hooks/useEMIs';
import { useLoans } from '@/hooks/useLoans';
import { LoadingStates, ModalLoader } from '@/components/LoadingComponents';

export default function EMIDashboard() {
  const { emis, loading, error, fetchEMIs, recordPayment } = useEMIs();
  const { loans, fetchLoans } = useLoans();
  
  const [upcomingEmis, setUpcomingEmis] = useState<EMIPayment[]>([]);
  const [overdueEmis, setOverdueEmis] = useState<EMIPayment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState<EMIPayment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    paymentMode: 'bank_transfer',
    transactionId: '',
    lateFee: 0,
    prepaymentAmount: 0,
    description: '',
    accountId: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetchLoans();
    loadEMIData();
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const accountsData = await response.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const loadEMIData = async () => {
    try {
      const [upcoming, overdue] = await Promise.all([
        fetchEMIs({ upcoming: true, limit: 10 }),
        fetchEMIs({ overdue: true, limit: 10 }),
      ]);
      
      setUpcomingEmis(upcoming || []);
      setOverdueEmis(overdue || []);
    } catch (error) {
      console.error('Error loading EMI data:', error);
    }
  };

  const handlePayEMI = (emi: EMIPayment) => {
    setSelectedEMI(emi);
    setPaymentForm({
      amountPaid: emi.emiAmount,
      paymentMode: 'bank_transfer',
      transactionId: '',
      lateFee: 0,
      prepaymentAmount: 0,
      description: '',
      accountId: '',
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedEMI) return;
    
    setPaymentLoading(true);
    try {
      await recordPayment({
        emiId: selectedEMI.id!,
        ...paymentForm,
      });
      setShowPaymentModal(false);
      setSelectedEMI(null);
      loadEMIData(); // Reload data after payment
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && emis.length === 0) {
    return <LoadingStates.EMIs />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EMI Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your EMI payments</p>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming EMIs</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingEmis.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Overdue EMIs</p>
                <p className="text-2xl font-bold text-red-600">{overdueEmis.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Loans</p>
                <p className="text-2xl font-bold text-green-600">{loans.filter(loan => loan.isActive).length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly EMI Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(loans.filter(loan => loan.isActive).reduce((sum, loan) => sum + loan.emiAmount, 0))}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue EMIs */}
        {overdueEmis.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                <span>⚠️</span>
                Overdue EMIs ({overdueEmis.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {overdueEmis.map((emi) => (
                  <div key={emi.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{emi.loan?.loanName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor('overdue')}`}>
                            Overdue
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{emi.loan?.lender} • EMI #{emi.emiNumber}</p>
                        <p className="text-red-600 font-medium">Due: {formatDate(emi.dueDate)} ({Math.abs(getDaysUntilDue(emi.dueDate))} days overdue)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                        <button
                          onClick={() => handlePayEMI(emi)}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming EMIs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>📅</span>
              Upcoming EMIs ({upcomingEmis.length})
            </h2>
          </div>
          <div className="p-6">
            {upcomingEmis.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎉</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Upcoming EMIs</h3>
                <p className="text-gray-500">You're all caught up with your EMI payments!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEmis.map((emi) => {
                  const daysUntilDue = getDaysUntilDue(emi.dueDate);
                  return (
                    <div key={emi.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{emi.loan?.loanName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(emi.status)}`}>
                              {emi.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{emi.loan?.lender} • EMI #{emi.emiNumber}</p>
                          <p className="text-gray-700">
                            Due: {formatDate(emi.dueDate)}
                            {daysUntilDue <= 7 && (
                              <span className="ml-2 text-orange-600 font-medium">
                                ({daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                          <button
                            onClick={() => handlePayEMI(emi)}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Pay EMI
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedEMI && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/40 to-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl transform animate-scaleIn border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  💳 Record EMI Payment
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedEMI(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                </button>
              </div>
              
              {/* EMI Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedEMI.loan?.loanName}</h4>
                <p className="text-gray-600">EMI #{selectedEMI.emiNumber} • Due: {formatDate(selectedEMI.dueDate)}</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">Amount: {formatCurrency(selectedEMI.emiAmount)}</p>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    value={paymentForm.amountPaid || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder={selectedEMI.emiAmount.toString()}
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Select Payment Account *</label>
                  <select
                    value={paymentForm.accountId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    required
                  >
                    <option value="">Select account to debit...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} (₹{account.balance?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">EMI payment will be recorded as expense transaction from this account</p>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Payment Mode</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="auto_debit">🔄 Auto Debit</option>
                    <option value="cheque">📄 Cheque</option>
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="card">💳 Card</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Optional transaction reference"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Late Fee (₹)</label>
                    <input
                      type="number"
                      value={paymentForm.lateFee || ''}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, lateFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Prepayment Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentForm.prepaymentAmount || ''}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, prepaymentAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Optional payment notes..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={submitPayment}
                  disabled={!paymentForm.amountPaid || !paymentForm.accountId}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  ✅ Record Payment & Create Transaction
                </button>
                
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedEMI(null);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Loading Overlay */}
        {paymentLoading && <ModalLoader message="Recording EMI payment..." />}
      </div>
    </div>
  );
}