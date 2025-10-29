import { useState, useCallback } from 'react';

export interface Loan {
  id?: string;
  loanName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  lender: string;
  loanAccountNumber?: string;
  startDate: Date;
  endDate?: Date;
  currentBalance: number;
  totalPaidAmount: number;
  totalInterestPaid: number;
  remainingEmis: number;
  processingFee?: number;
  insurance?: number;
  prepaymentCharges?: number;
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  emiPayments?: EMIPayment[];
  totalEmisPaid?: number;
  nextEmiDue?: Date | null;
  completionPercentage?: number;
}

export interface EMIPayment {
  id?: string;
  loanId: string;
  emiNumber: number;
  dueDate: Date;
  paidDate?: Date;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  amountPaid?: number;
  paymentMode?: string;
  transactionId?: string;
  status: string;
  lateFee?: number;
  prepaymentAmount?: number;
  description?: string;
  loan?: {
    id: string;
    loanName: string;
    lender: string;
    loanType: string;
  };
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async (filters?: { active?: boolean; type?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) {
        params.append('active', filters.active.toString());
      }
      if (filters?.type) {
        params.append('type', filters.type);
      }

      const response = await fetch(`/api/loans?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }
      
      const data = await response.json();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoan = useCallback(async (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan');
      }

      const newLoan = await response.json();
      setLoans(prev => [newLoan, ...prev]);
      return newLoan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLoan = useCallback(async (id: string, loanData: Partial<Loan>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update loan');
      }

      const updatedLoan = await response.json();
      setLoans(prev => prev.map(loan => loan.id === id ? updatedLoan : loan));
      return updatedLoan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLoan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete loan');
      }

      setLoans(prev => prev.filter(loan => loan.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/loans/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch loan');
      }
      
      const loan = await response.json();
      return loan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loans,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    getLoan,
  };
}