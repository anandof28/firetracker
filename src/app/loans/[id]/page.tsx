"use client";

import { PageLoader } from '@/components/LoadingComponents';
import LoanDetails from '@/components/LoanDetails';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  nextEmiDue?: Date;
  remainingEmis?: number;
  lender?: string;
  loanAccountNumber?: string;
  totalPaidAmount?: number;
  totalInterestPaid?: number;
  isActive?: boolean;
  description?: string;
  notificationEmail?: string;
  reminderDays?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchLoanDetails(params.id as string);
    }
  }, [params.id]);

  const fetchLoanDetails = async (loanId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/loans/${loanId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch loan details: ${response.statusText}`);
      }

      const loanData = await response.json();
      
      // Convert date strings to Date objects
      if (loanData.startDate) {
        loanData.startDate = new Date(loanData.startDate);
      }
      if (loanData.emiEndDate) {
        loanData.emiEndDate = new Date(loanData.emiEndDate);
      }
      if (loanData.nextEmiDue) {
        loanData.nextEmiDue = new Date(loanData.nextEmiDue);
      }

      setLoan(loanData);
    } catch (err) {
      console.error('Error fetching loan details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/loans');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <PageLoader message="Loading loan details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Error Loading Loan</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loan Not Found</h1>
          <p className="text-gray-600 mb-4">The requested loan could not be found.</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoanDetails loan={loan} onClose={handleClose} />
    </div>
  );
}