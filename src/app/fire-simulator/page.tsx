"use client";

import { useFireSimulation } from '@/hooks/useFireSimulation';
import { useEffect } from 'react';
import {
        CartesianGrid,
        Line,
        LineChart,
        ResponsiveContainer,
        Tooltip,
        XAxis, YAxis
} from 'recharts';

export default function FireSimulatorPage() {
  const {
    params,
    setParams,
    data,
    loading,
    error,
    fetchSimulation,
  } = useFireSimulation();

  useEffect(() => {
    fetchSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">🔥 FIRE Simulator</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label className="block font-medium mb-1">
              🎂 Current Age: <span className="font-mono">{params.currentAge}</span>
            </label>
            <input
              type="range"
              min={18}
              max={70}
              value={params.currentAge}
              onChange={e => setParams(p => ({ ...p, currentAge: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Retirement Age */}
          <div>
            <label className="block font-medium mb-1">
              🧓 Retirement Age: <span className="font-mono">{params.retirementAge}</span>
            </label>
            <input
              type="range"
              min={params.currentAge ?? 18}
              max={80}
              value={params.retirementAge}
              onChange={e => setParams(p => ({ ...p, retirementAge: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Annual Return */}
          <div>
            <label className="block font-medium mb-1">
              📈 Annual Return: <span className="font-mono">{Math.round((params.annualReturn ?? 0.1) * 1000) / 10}%</span>
            </label>
            <input
              type="range"
              min={0.04}
              max={0.15}
              step={0.005}
              value={params.annualReturn}
              onChange={e => setParams(p => ({ ...p, annualReturn: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Inflation */}
          <div>
            <label className="block font-medium mb-1">
              🧾 Inflation Rate: <span className="font-mono">{Math.round((params.annualInflation ?? 0.06) * 1000) / 10}%</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={0.10}
              step={0.001}
              value={params.annualInflation}
              onChange={e => setParams(p => ({ ...p, annualInflation: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>

        <button
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => fetchSimulation()}
          disabled={loading}
        >
          {loading ? 'Simulating...' : '🚀 Run Simulation'}
        </button>

        {error && <div className="text-red-600">{error}</div>}

        {data && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm md:text-base">
              <div>💼 Current Portfolio: <span className="font-mono">₹{data.currentPortfolio.toLocaleString()}</span></div>
              <div>📥 Monthly Income: <span className="font-mono">₹{data.monthlyIncome.toLocaleString()}</span></div>
              <div>📤 Monthly Expenses: <span className="font-mono">₹{data.monthlyExpenses.toLocaleString()}</span></div>
              <div>🔥 FIRE Number: <span className="font-mono">₹{data.fireNumber.toLocaleString()}</span></div>
              <div>⏳ Years to FI: <span className="font-mono">{data.yearsToFI >= 0 ? data.yearsToFI : '∞'}</span></div>
              <div>🎯 Projected at Retirement: <span className="font-mono">₹{data.projectedPortfolioAtRetirement.toLocaleString()}</span></div>
              <div>✅ Can Retire at Target Age: <span className={data.canRetireAtTargetAge ? 'text-green-600' : 'text-red-600'}>{data.canRetireAtTargetAge ? 'Yes' : 'No'}</span></div>
              <div>📊 FI Progress: <span className="font-mono">{data.fiPercentage}%</span></div>
            </div>

            {/* 📈 Chart */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Portfolio Projection</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.projection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 🧾 Table */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Projection Table</h2>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border">Age</th>
                      <th className="px-3 py-2 border">Portfolio (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projection.map((p) => (
                      <tr key={p.age}>
                        <td className="px-3 py-1 border text-center">{p.age}</td>
                        <td className="px-3 py-1 border text-right">₹{p.portfolio.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
