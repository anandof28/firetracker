import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Constants
const GOLD_RATE_PER_GRAM = 9380;
const DEFAULT_RETURN = 0.10;
const DEFAULT_INFLATION = 0.06;

// Types
type ProjectPortfolioParams = {
  currentPortfolio: number;
  monthlySavings: number;
  annualReturn: number;
  annualInflation: number;
  years: number;
  currentAge: number;
};

type ProjectionPoint = {
  age: number;
  portfolio: number;
};

// Projection utility
function projectPortfolio({
  currentPortfolio,
  monthlySavings,
  annualReturn,
  annualInflation,
  years,
  currentAge,
}: ProjectPortfolioParams): ProjectionPoint[] {
  const projection: ProjectionPoint[] = [];
  let nominal = currentPortfolio;
  let real = currentPortfolio;
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + annualInflation, 1 / 12) - 1;

  for (let i = 0; i <= years * 12; i++) {
    if (i % 12 === 0) {
      projection.push({ age: currentAge + Math.floor(i / 12), portfolio: Math.round(real) });
    }
    nominal = nominal * (1 + monthlyReturn) + monthlySavings;
    real = real * (1 + monthlyReturn - monthlyInflation) + monthlySavings;
  }

  return projection;
}

// POST: Run simulation
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentAge = 32, retirementAge = 50 } = await req.json();
    const years = retirementAge - currentAge;

    // Last 12 months income/expenses
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: since } },
      select: { amount: true, type: true },
    });

    let income = 0, expenses = 0;
    txns.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expenses += t.amount;
    });

    const monthlyIncome = income / 12;
    const monthlyExpenses = expenses / 12;
    const annualExpenses = monthlyExpenses * 12;

    // Account Balances
    const accounts = await prisma.account.findMany({ where: { userId }, select: { balance: true } });
    const accountTotal = accounts.reduce((sum, a) => sum + a.balance, 0);

    // Fixed Deposits
    const fds = await prisma.fD.findMany({ where: { userId }, select: { amount: true } });
    const fdTotal = fds.reduce((sum, f) => sum + f.amount, 0);

    // Mutual Funds
    const mfs = await prisma.mutualFund.findMany({
      where: { userId },
      select: { totalInvested: true, currentNAV: true, units: true },
    });
    const mfTotal = mfs.reduce((sum, mf) => {
      if (mf.currentNAV && mf.units) return sum + mf.currentNAV * mf.units;
      return sum + (mf.totalInvested || 0);
    }, 0);

    // Gold Holdings
    const golds = await prisma.gold.findMany({ where: { userId }, select: { grams: true } });
    const goldTotal = golds.reduce((sum, g) => sum + g.grams * GOLD_RATE_PER_GRAM, 0);

    // Portfolio & FIRE Metrics
    const currentPortfolio = accountTotal + fdTotal + mfTotal + goldTotal;
    const fireNumber = annualExpenses * 25;
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Calculate Years to FI
    let portfolio = currentPortfolio;
    let yearsToFI = 0;
    while (portfolio < fireNumber && yearsToFI < 100) {
      for (let m = 0; m < 12; m++) {
        portfolio = portfolio * (1 + DEFAULT_RETURN / 12) + monthlySavings;
      }
      yearsToFI++;
    }
    if (yearsToFI >= 100) yearsToFI = -1;

    // Projected Portfolio at Retirement
    let projectedPortfolio = currentPortfolio;
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        projectedPortfolio = projectedPortfolio * (1 + DEFAULT_RETURN / 12) + monthlySavings;
      }
    }

    // Growth Chart
    const projection = projectPortfolio({
      currentPortfolio,
      monthlySavings,
      annualReturn: DEFAULT_RETURN,
      annualInflation: DEFAULT_INFLATION,
      years,
      currentAge,
    });

    const fiPercentage = fireNumber > 0 ? Math.min(100, (currentPortfolio / fireNumber) * 100) : 0;
    const canRetireAtTargetAge = projectedPortfolio >= fireNumber;

    return NextResponse.json({
      currentPortfolio: Math.round(currentPortfolio),
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      annualExpenses: Math.round(annualExpenses),
      fireNumber: Math.round(fireNumber),
      yearsToFI,
      canRetireAtTargetAge,
      projectedPortfolioAtRetirement: Math.round(projectedPortfolio),
      fiPercentage: Math.round(fiPercentage),
      projection,
    });
  } catch (e) {
    console.error('FIRE Simulator Error:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// GET: support query param-based simulation
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentAge = Number(url.searchParams.get('currentAge')) || 32;
  const retirementAge = Number(url.searchParams.get('retirementAge')) || 50;

  return POST({
    ...req,
    json: async () => ({ currentAge, retirementAge }),
  } as any);
}
