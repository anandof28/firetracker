"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/emi-calculator';
import {
  AlertTriangle,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  History,
  TrendingUp
} from 'lucide-react';

interface EMIPayment {
  id: string;
  emiNumber: number;
  dueDate: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingPrincipal: number;
  status: string;
  paidDate?: string;
  amountPaid?: number;
  isOverdue: boolean;
  daysOverdue: number;
  principalPercentage: number;
  interestPercentage: number;
}

interface PrepaymentSimulation {
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSavings: number;
  originalTenure: number;
  newTenure: number;
  tenureReduction: number;
  newEmiAmount?: number;
  insights: {
    currentOutstanding: number;
    prepaymentPercentage: number;
    interestSavingsPercentage: number;
    monthsReduced: number;
    recommendation: string;
  };
  currentCompletionPercentage?: number;
  outstandingAfterPrepayment?: number;
  principalReductionPercentage?: number;
  newCompletionAfterPrepayment?: number;
}

interface Loan {
  id?: string;
  loanName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  currentBalance: number;
  totalOutstanding?: number;
  pendingPrincipal?: number;
  pendingInterest?: number;
  emiEndDate?: Date;
  startDate?: Date;
  completionPercentage?: number;
  monthsElapsed?: number;
  notificationEmail?: string;
}

interface LoanDetailsProps {
  loan: Loan;
  onClose: () => void;
}

export default function LoanDetails({ loan, onClose }: LoanDetailsProps) {
  // --- Download Handlers ---
  const handleDownloadExcel = () => {
    if (!emiHistory || emiHistory.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(emiHistory.map(emi => ({
      'EMI #': emi.emiNumber,
      'Due Date': new Date(emi.dueDate).toLocaleDateString(),
      'Status': emi.status,
      'EMI Amount': emi.emiAmount,
      'Principal': emi.principalAmount,
      'Interest': emi.interestAmount,
      'Overdue': emi.status === 'pending' && emi.isOverdue ? `${emi.daysOverdue} days` : '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EMI History');
    XLSX.writeFile(wb, 'emi-history.xlsx');
  };

  const handleDownloadPDF = () => {
    if (!emiHistory || emiHistory.length === 0) return;
    const doc = new jsPDF();
    doc.text('EMI Payment History', 14, 16);
    const rows = emiHistory.map(emi => [
      emi.emiNumber,
      new Date(emi.dueDate).toLocaleDateString(),
      emi.status,
      emi.emiAmount,
      emi.principalAmount,
      emi.interestAmount,
      emi.status === 'pending' && emi.isOverdue ? `${emi.daysOverdue} days` : ''
    ]);
    (doc as any).autoTable({
      head: [['EMI #', 'Due Date', 'Status', 'EMI Amount', 'Principal', 'Interest', 'Overdue']],
      body: rows,
      startY: 22
    });
    doc.save('emi-history.pdf');
  };
  
  const [emiHistory, setEmiHistory] = useState<EMIPayment[]>([]);
  const [historySummary, setHistorySummary] = useState<any>({});
  const [prepaymentSimulation, setPrepaymentSimulation] = useState<PrepaymentSimulation | null>(null);
  const [prepaymentForm, setPrepaymentForm] = useState({
    amount: '',
    type: 'reduce_tenure',
  });
  const [simulationForm, setSimulationForm] = useState({
    amount: '',
    type: 'reduce_tenure',
  });
  const [loading, setLoading] = useState(false);
  const [loanProgress, setLoanProgress] = useState({ completionPercentage: 0, monthsElapsed: 0 });
  const [outstandingBreakdown, setOutstandingBreakdown] = useState({
    totalLoanAmount: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    paidAmount: 0,
    paidPrincipal: 0,
    paidInterest: 0,
    outstandingAmount: 0,
    pendingPrincipal: 0,
    pendingInterest: 0
  });

  // Calculate outstanding breakdown whenever historySummary changes
  useEffect(() => {
    const totalPrincipal = loan.principalAmount;
    const totalInterest = (loan.emiAmount * loan.tenureMonths) - loan.principalAmount;
    const totalLoanAmount = totalPrincipal + totalInterest;
    
    // Calculate EMIs that should have been paid based on start date
    let calculatedPaidEmis = 0;
    if (loan.startDate) {
      const startDate = new Date(loan.startDate);
      const currentDate = new Date();
      const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
      const monthsDiff = currentDate.getMonth() - startDate.getMonth();
      const monthsElapsed = Math.max(0, yearsDiff * 12 + monthsDiff);
      calculatedPaidEmis = Math.min(monthsElapsed, loan.tenureMonths);
    }
    
    // Use actual paid data if available, otherwise calculate based on elapsed time
    const paidEmisCount = historySummary?.paidEmis || calculatedPaidEmis;
    
    // Calculate paid amounts based on EMI schedule
    const paidAmount = historySummary?.totalPaidAmount || (paidEmisCount * loan.emiAmount);
    const outstandingAmount = totalLoanAmount - paidAmount;
    
    // Calculate principal and interest breakdown for paid EMIs
    let paidPrincipal = historySummary?.totalPaidPrincipal || 0;
    let paidInterest = historySummary?.totalPaidInterest || 0;
    
    // If we don't have actual data, estimate based on amortization
    if (!historySummary?.totalPaidPrincipal && paidEmisCount > 0) {
      const monthlyRate = loan.interestRate / 12 / 100;
      let remainingPrincipal = totalPrincipal;
      
      for (let i = 0; i < paidEmisCount; i++) {
        const interestForMonth = remainingPrincipal * monthlyRate;
        const principalForMonth = loan.emiAmount - interestForMonth;
        paidInterest += interestForMonth;
        paidPrincipal += principalForMonth;
        remainingPrincipal -= principalForMonth;
      }
    }
    
    const pendingPrincipal = totalPrincipal - paidPrincipal;
    const pendingInterest = totalInterest - paidInterest;
    
    console.log('Outstanding Calculation:', {
      totalPrincipal,
      totalInterest,
      totalLoanAmount,
      calculatedPaidEmis,
      paidAmount,
      paidPrincipal,
      paidInterest,
      historySummary
    });
    
    setOutstandingBreakdown({
      totalLoanAmount,
      totalPrincipal,
      totalInterest,
      paidAmount,
      paidPrincipal,
      paidInterest,
      outstandingAmount,
      pendingPrincipal,
      pendingInterest
    });
  }, [loan, historySummary]);

  // Calculate loan progress based on available data
  useEffect(() => {
    const calculateProgress = () => {
      let monthsElapsed = 0;
      let completionPercentage = 0;

      // Use loan data if available (from main API)
      if (loan.completionPercentage !== undefined) {
        completionPercentage = loan.completionPercentage;
        monthsElapsed = loan.monthsElapsed || 0;
      }
      // Use EMI history if available
      else if (historySummary && historySummary.paidEmis) {
        monthsElapsed = historySummary.paidEmis;
        completionPercentage = (monthsElapsed / loan.tenureMonths) * 100;
      }
      // Use start date if available for time-based calculation
      else if (loan.startDate) {
        const currentDate = new Date();
        const startDate = new Date(loan.startDate);
        const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
        const monthsDiff = currentDate.getMonth() - startDate.getMonth();
        monthsElapsed = Math.max(0, yearsDiff * 12 + monthsDiff);
        completionPercentage = Math.min((monthsElapsed / loan.tenureMonths) * 100, 100);
      }
      // Fallback: use principal paid calculation
      else {
        const principalPaid = loan.principalAmount - loan.currentBalance;
        completionPercentage = (principalPaid / loan.principalAmount) * 100;
        monthsElapsed = Math.round((completionPercentage / 100) * loan.tenureMonths);
      }
      
      setLoanProgress({
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        monthsElapsed: Math.round(monthsElapsed)
      });
    };

    calculateProgress();
  }, [loan, historySummary]);

  useEffect(() => {
    // Fetch EMI history on mount to get paid amounts
    if (loan.id) {
      fetchEMIHistory();
    }
  }, [loan.id]);

  const fetchEMIHistory = async () => {
    if (!loan.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/loans/${loan.id}/emi-history`);
      const data = await response.json();
      console.log('EMI History Data:', data);
      console.log('Summary:', data.summary);
      setEmiHistory(data.emiPayments);
      setHistorySummary(data.summary);
    } catch (error) {
      console.error('Error fetching EMI history:', error);
    }
    setLoading(false);
  };

  const generateEMISchedule = async () => {
    if (!loan.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/loans/${loan.id}/generate-emis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Refresh the EMI history after generation
        await fetchEMIHistory();
      } else {
        console.error('Failed to generate EMI schedule');
      }
    } catch (error) {
      console.error('Error generating EMI schedule:', error);
    }
    setLoading(false);
  };

  const runPrepaymentSimulation = async () => {
    if (!simulationForm.amount) return;

    setLoading(true);
    try {
      const response = await fetch('/api/loans/prepayment-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principalAmount: loan.principalAmount,
          interestRate: loan.interestRate,
          tenureMonths: loan.tenureMonths,
          elapsedMonths: historySummary.paidEmis || 0,
          prepaymentAmount: parseFloat(simulationForm.amount),
          prepaymentType: simulationForm.type,
        }),
      });
      const data = await response.json();
      setPrepaymentSimulation(data);
    } catch (error) {
      console.error('Error simulating prepayment:', error);
    }
    setLoading(false);
  };

  const recordPrepayment = async () => {
    const amount = prepaymentForm.amount || simulationForm.amount;
    const type = prepaymentForm.type || simulationForm.type;
    
    if (!amount || !loan.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/loans/${loan.id}/prepayments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          prepaymentType: type === 'reduce_tenure' ? 'tenure_reduction' : 'emi_reduction',
          prepaymentDate: new Date().toISOString(),
          description: `Prepayment of ₹${parseFloat(amount).toLocaleString('en-IN')} to ${type === 'reduce_tenure' ? 'reduce tenure' : 'reduce EMI'}`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Prepayment recorded successfully!\n\n💰 Interest Savings: ₹${data.simulation.interestSavings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n📅 Tenure Reduction: ${data.simulation.tenureReduction} months\n📊 New Tenure: ${data.simulation.newTenure} months\n\nYour EMI schedule has been updated based on today's date.`);
        setPrepaymentForm({ amount: '', type: 'reduce_tenure' });
        setPrepaymentSimulation(null);
        setSimulationForm({ amount: '', type: 'reduce_tenure' });
        // Refresh EMI history to show updated schedule
        await fetchEMIHistory();
        // Reload the page to refresh loan details
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Failed to record prepayment'}`);
      }
    } catch (error) {
      console.error('Error recording prepayment:', error);
      alert('❌ Failed to record prepayment. Please try again.');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'destructive';
    if (status === 'paid') return 'default';
    return 'secondary';
  };

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (isOverdue) return <AlertTriangle className="h-4 w-4" />;
    if (status === 'paid') return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Summary Header */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-blue-200/50">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-90"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <CreditCard className="h-9 w-9 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {loan.loanName}
              </h1>
              <p className="text-base text-gray-700 capitalize flex items-center mt-2">
                <span className="inline-block w-2.5 h-2.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-full mr-2 animate-pulse"></span>
                {loan.loanType} Loan
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="bg-linear-to-r from-green-50 to-emerald-50 text-gray-700 border-green-300 shadow-sm">
                  {loan.tenureMonths} months
                </Badge>
                <Badge variant="outline" className="bg-linear-to-r from-blue-50 to-cyan-50 text-gray-700 border-blue-300 shadow-sm">
                  {formatCurrency(loan.principalAmount)} Principal
                </Badge>
                <Badge variant="outline" className="bg-linear-to-r from-orange-50 to-amber-50 text-gray-700 border-orange-300 shadow-sm">
                  {loan.interestRate}% p.a.
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 min-w-[280px]">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Balance</span>
            {loading && !historySummary.totalPaidAmount ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <>
                <span className="text-3xl font-extrabold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatCurrency(outstandingBreakdown.outstandingAmount)}
                </span>
                <div className="w-full space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Principal:</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(outstandingBreakdown.pendingPrincipal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(outstandingBreakdown.pendingInterest)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(outstandingBreakdown.paidAmount)}</span>
                  </div>
                </div>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="mt-2 w-full hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 transition-all duration-300 shadow-sm"
            >
              Back to Loans
            </Button>
          </div>
        </div>
      </div>

      {/* Loan Progress & Payment Summary in One Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Progress */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
              Loan Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-600">Outstanding Balance</span>
                  <span className="text-gray-700 font-bold">{formatCurrency(loan.currentBalance)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className="bg-linear-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-md"
                    style={{ 
                      width: `${loanProgress.completionPercentage}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>EMIs Paid: {loanProgress.monthsElapsed} of {loan.tenureMonths}</span>
                  <span className="text-gray-700 font-bold">{Math.round(loanProgress.completionPercentage)}%</span>
                </div>
              </div>

              {historySummary && historySummary.completionPercentage && (
                <div className="grid grid-cols-2 gap-3 text-center pt-4 border-t">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-700">{historySummary.paidEmis || 0}</p>
                    <p className="text-xs text-gray-600 font-medium">EMIs Paid</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-700">{historySummary.pendingEmis || 0}</p>
                    <p className="text-xs text-gray-600 font-medium">EMIs Remaining</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {historySummary && historySummary.totalPaidAmount && (
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-green-500">
            <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <History className="h-5 w-5 text-gray-700" />
                </div>
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(historySummary.totalPaidAmount)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Principal Paid</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(historySummary.totalPaidPrincipal)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Interest Paid</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(historySummary.totalPaidInterest)}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount( inc. Interest)</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(outstandingBreakdown.totalLoanAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* EMI History Section */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : emiHistory && emiHistory.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Calendar className="h-8 w-8 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate EMI Schedule</h3>
                <p className="text-gray-600 mb-2">
                  Click below to generate the complete EMI payment schedule.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Past EMIs will be marked as paid, future EMIs as pending.
                </p>
                <Button 
                  onClick={generateEMISchedule}
                  disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Generating...' : 'Generate EMI Schedule'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        ) : (
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-indigo-500">
                <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <Calendar className="h-5 w-5 text-gray-700" />
                      </div>
                      EMI Payment History
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleDownloadExcel} 
                        className="hover:bg-green-50 hover:border-green-400 hover:text-gray-700 transition-all"
                      >
                        📊 Excel
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleDownloadPDF}
                        className="hover:bg-red-50 hover:border-red-400 hover:text-gray-700 transition-all"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto max-h-[500px] rounded-lg border border-gray-200 shadow-inner">
                    <table className="min-w-full text-sm">
                      <thead className="bg-linear-to-r from-indigo-100 to-purple-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">#</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Due Date</th>
                          <th className="px-4 py-3 text-right font-bold text-gray-700">EMI Amount</th>
                          <th className="px-4 py-3 text-right font-bold text-gray-700">Principal</th>
                          <th className="px-4 py-3 text-right font-bold text-gray-700">Interest</th>
                          <th className="px-4 py-3 text-right font-bold text-gray-700">Outstanding</th>
                          <th className="px-4 py-3 text-center font-bold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiHistory && emiHistory.length > 0 ? (
                          emiHistory.map((emi, index) => (
                            <tr 
                              key={emi.id} 
                              className={`border-b last:border-b-0 hover:bg-indigo-50/50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                              }`}
                            >
                              <td className="px-4 py-3 font-bold text-gray-700">{emi.emiNumber}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-700">{new Date(emi.dueDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(emi.emiAmount)}</td>
                              <td className="px-4 py-3 text-right text-gray-700 font-medium">{formatCurrency(emi.principalAmount)}</td>
                              <td className="px-4 py-3 text-right text-gray-700 font-medium">{formatCurrency(emi.interestAmount)}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="font-semibold text-gray-700 mb-1">
                                  {formatCurrency(emi.remainingPrincipal + emi.interestAmount)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 shadow-inner">
                                  <div
                                    className="bg-linear-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.max(0, Math.min(100, ((emi.remainingPrincipal + emi.interestAmount) / loan.principalAmount) * 100))}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant={getStatusColor(emi.status, false)} className="capitalize">
                                  {emi.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No EMI history available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
          )}

        {/* Prepayment Simulator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-gray-700" />
                  <span>Prepayment Simulator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sim-amount">Prepayment Amount</Label>
                  <Input
                    id="sim-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={simulationForm.amount}
                    onChange={(e) => setSimulationForm(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sim-type">Prepayment Strategy</Label>
                  <select
                    id="sim-type"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={simulationForm.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSimulationForm(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="reduce_tenure">Reduce Loan Tenure</option>
                    <option value="reduce_emi">Reduce EMI Amount</option>
                  </select>
                </div>

                <Button 
                  onClick={runPrepaymentSimulation}
                  disabled={!simulationForm.amount || loading}
                  className="w-full"
                >
                  {loading ? 'Calculating...' : 'Simulate Prepayment'}
                </Button>
              </CardContent>
            </Card>

            {prepaymentSimulation && (
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-700">
                        {formatCurrency(prepaymentSimulation.interestSavings)}
                      </p>
                      <p className="text-sm text-muted-foreground">Interest Savings</p>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-700">
                        {prepaymentSimulation.tenureReduction}
                      </p>
                      <p className="text-sm text-muted-foreground">Months Reduced</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Outstanding:</span>
                      <span>{formatCurrency(prepaymentSimulation.insights.currentOutstanding)}</span>
                    </div>
                    
                    {prepaymentSimulation.currentCompletionPercentage !== undefined && (
                      <div className="flex justify-between">
                        <span>Current Completion:</span>
                        <span>{prepaymentSimulation.currentCompletionPercentage.toFixed(1)}%</span>
                      </div>
                    )}
                    
                    {prepaymentSimulation.outstandingAfterPrepayment !== undefined && (
                      <div className="flex justify-between">
                        <span>Outstanding After Prepayment:</span>
                        <span>{formatCurrency(prepaymentSimulation.outstandingAfterPrepayment)}</span>
                      </div>
                    )}
                    
                    {prepaymentSimulation.principalReductionPercentage !== undefined && (
                      <div className="flex justify-between">
                        <span>Principal Reduction:</span>
                        <span>{prepaymentSimulation.principalReductionPercentage.toFixed(1)}%</span>
                      </div>
                    )}
                    
                    {prepaymentSimulation.newCompletionAfterPrepayment !== undefined && (
                      <div className="flex justify-between">
                        <span>New Completion After Prepayment:</span>
                        <span>{prepaymentSimulation.newCompletionAfterPrepayment.toFixed(1)}%</span>
                      </div>
                    )}
                    
                    {prepaymentSimulation.newEmiAmount && (
                      <div className="flex justify-between">
                        <span>New EMI Amount:</span>
                        <span>{formatCurrency(prepaymentSimulation.newEmiAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>New Tenure:</span>
                      <span>{prepaymentSimulation.newTenure} months</span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Recommendation:</strong> {prepaymentSimulation.insights.recommendation}
                    </p>
                  </div>

                  <div className="pt-4 border-t bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-700">💡 Apply This Prepayment</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Click below to record this prepayment and automatically update your EMI schedule based on today's date.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Amount:</span>
                          <span className="font-bold text-gray-700">{formatCurrency(parseFloat(simulationForm.amount))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Strategy:</span>
                          <span className="font-bold text-gray-700">{simulationForm.type === 'reduce_tenure' ? 'Reduce Tenure' : 'Reduce EMI'}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={async () => {
                          setPrepaymentForm({
                            amount: simulationForm.amount,
                            type: simulationForm.type
                          });
                          await recordPrepayment();
                        }}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Recording...' : 'Record Prepayment & Update Schedule'}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        ⚠️ This will delete pending EMIs and regenerate the schedule
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
    </div>
  );
}