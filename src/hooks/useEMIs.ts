import { useCallback, useState } from 'react';
import { EMIPayment } from './useLoans';

export type { EMIPayment } from './useLoans';

export function useEMIs() {
  const [emis, setEmis] = useState<EMIPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEMIs = useCallback(async (filters?: { 
    loanId?: string; 
    status?: string; 
    upcoming?: boolean; 
    overdue?: boolean;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.loanId) params.append('loanId', filters.loanId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.upcoming) params.append('upcoming', 'true');
      if (filters?.overdue) params.append('overdue', 'true');
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/emis?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch EMI payments');
      }
      
      const data = await response.json();
      setEmis(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (paymentData: {
    emiId: string;
    amountPaid: number;
    paymentMode?: string;
    transactionId?: string;
    lateFee?: number;
    prepaymentAmount?: number;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/emis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record payment');
      }

      const updatedEmi = await response.json();
      setEmis(prev => prev.map(emi => emi.id === paymentData.emiId ? updatedEmi : emi));
      return updatedEmi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEMI = useCallback(async (id: string, emiData: Partial<EMIPayment>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/emis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update EMI');
      }

      const updatedEmi = await response.json();
      setEmis(prev => prev.map(emi => emi.id === id ? updatedEmi : emi));
      return updatedEmi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEMI = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/emis/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch EMI');
      }
      
      const emi = await response.json();
      return emi;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    emis,
    loading,
    error,
    fetchEMIs,
    recordPayment,
    updateEMI,
    getEMI,
  };
}