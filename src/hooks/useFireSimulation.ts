import { useState, useCallback } from 'react';

export interface FireSimulatorResponse {
  currentPortfolio: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  annualExpenses: number;
  fireNumber: number;
  yearsToFI: number;
  canRetireAtTargetAge: boolean;
  projectedPortfolioAtRetirement: number;
  fiPercentage: number;
  projection: {
    age: number;
    portfolio: number;
  }[];
}

export interface FireSimParams {
  currentAge?: number;
  retirementAge?: number;
  annualReturn?: number;
  annualInflation?: number;
}

export function useFireSimulation(initialParams: FireSimParams = {}) {
  const [params, setParams] = useState<FireSimParams>({
    currentAge: initialParams.currentAge ?? 32,
    retirementAge: initialParams.retirementAge ?? 50,
    annualReturn: initialParams.annualReturn ?? 0.10,
    annualInflation: initialParams.annualInflation ?? 0.06,
  });
  const [data, setData] = useState<FireSimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulation = useCallback(async (override?: Partial<FireSimParams>) => {
    setLoading(true);
    setError(null);
    try {
      const merged = { ...params, ...override };
      const res = await fetch('/api/fire-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAge: merged.currentAge,
          retirementAge: merged.retirementAge,
          annualReturn: merged.annualReturn,
          annualInflation: merged.annualInflation,
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch simulation');
      const json = await res.json();
      setData(json);
      setParams(merged);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params]);

  return {
    params,
    setParams,
    data,
    loading,
    error,
    fetchSimulation,
  };
}
