// EMI Calculation Utilities with accurate formulas
export interface EMIDetails {
  emiAmount: number;
  totalInterest: number;
  totalPayment: number;
  monthlyBreakdown: EMIBreakdown[];
}

export interface EMIBreakdown {
  month: number;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingPrincipal: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface PrepaymentSimulation {
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSavings: number;
  originalTenure: number;
  newTenure: number;
  tenureReduction: number;
  newEmiAmount?: number;
  updatedSchedule: EMIBreakdown[];
}

/**
 * Calculate EMI using the standard formula: P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (annualRate === 0) {
    return principal / tenureMonths;
  }
  
  const monthlyRate = annualRate / 12 / 100;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  
  return Math.round(numerator / denominator * 100) / 100;
}

/**
 * Generate complete EMI schedule with accurate principal/interest breakdown
 */
export function generateEMISchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate?: Date
): EMIDetails {
  const emiAmount = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  
  let remainingPrincipal = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  const monthlyBreakdown: EMIBreakdown[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestAmount = remainingPrincipal * monthlyRate;
    let principalAmount = emiAmount - interestAmount;
    
    // Handle last EMI adjustment
    if (month === tenureMonths || principalAmount > remainingPrincipal) {
      principalAmount = remainingPrincipal;
    }
    
    remainingPrincipal -= principalAmount;
    cumulativePrincipal += principalAmount;
    cumulativeInterest += interestAmount;

    monthlyBreakdown.push({
      month,
      emiAmount: month === tenureMonths ? principalAmount + interestAmount : emiAmount,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
      cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });

    if (remainingPrincipal <= 0) break;
  }

  return {
    emiAmount,
    totalInterest: cumulativeInterest,
    totalPayment: principal + cumulativeInterest,
    monthlyBreakdown,
  };
}

/**
 * Simulate the impact of a prepayment
 */
export function simulatePrepayment(
  currentPrincipal: number,
  annualRate: number,
  remainingTenure: number,
  prepaymentAmount: number,
  prepaymentType: 'reduce_tenure' | 'reduce_emi' | 'both' = 'reduce_tenure'
): PrepaymentSimulation {
  // Original schedule
  const originalSchedule = generateEMISchedule(currentPrincipal, annualRate, remainingTenure);
  
  // New principal after prepayment
  const newPrincipal = currentPrincipal - prepaymentAmount;
  
  let newSchedule: EMIDetails;
  let newTenure = remainingTenure;
  let newEmiAmount: number | undefined;

  if (prepaymentType === 'reduce_tenure') {
    // Keep same EMI, reduce tenure
    const originalEMI = originalSchedule.emiAmount;
    newTenure = calculateTenureForEMI(newPrincipal, annualRate, originalEMI);
    newSchedule = generateEMISchedule(newPrincipal, annualRate, newTenure);
  } else if (prepaymentType === 'reduce_emi') {
    // Keep same tenure, reduce EMI
    newSchedule = generateEMISchedule(newPrincipal, annualRate, remainingTenure);
    newEmiAmount = newSchedule.emiAmount;
  } else {
    // Hybrid approach: reduce both EMI and tenure proportionally, but never below 1 month
    const reductionFactor = prepaymentAmount / currentPrincipal;
    newTenure = Math.max(1, Math.ceil(remainingTenure * (1 - reductionFactor * 0.5)));
    newSchedule = generateEMISchedule(newPrincipal, annualRate, newTenure);
    newEmiAmount = newSchedule.emiAmount;
  }

  return {
    originalTotalInterest: originalSchedule.totalInterest,
    newTotalInterest: newSchedule.totalInterest,
    interestSavings: originalSchedule.totalInterest - newSchedule.totalInterest,
    originalTenure: remainingTenure,
    newTenure,
    tenureReduction: remainingTenure - newTenure,
    newEmiAmount,
    updatedSchedule: newSchedule.monthlyBreakdown,
  };
}

/**
 * Calculate tenure required for a given EMI amount
 */
export function calculateTenureForEMI(
  principal: number,
  annualRate: number,
  emiAmount: number
): number {
  if (annualRate === 0) {
    return Math.ceil(principal / emiAmount);
  }

  const monthlyRate = annualRate / 12 / 100;
  
  // Check if EMI is sufficient to cover interest
  if (emiAmount <= principal * monthlyRate) {
    throw new Error('EMI amount is insufficient to cover even the interest');
  }
  
  // Using the correct formula: n = log(EMI / (EMI - P*r)) / log(1 + r)
  const numerator = Math.log(emiAmount / (emiAmount - principal * monthlyRate));
  const denominator = Math.log(1 + monthlyRate);
  
  return Math.ceil(numerator / denominator);
}

/**
 * Calculate the outstanding principal at any point in the loan
 */
export function calculateOutstandingPrincipal(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  elapsedMonths: number
): number {
  if (elapsedMonths >= tenureMonths) return 0;

  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  
  const numerator = principal * Math.pow(1 + monthlyRate, elapsedMonths);
  const denominator = (emi * (Math.pow(1 + monthlyRate, elapsedMonths) - 1)) / monthlyRate;
  
  return Math.round((numerator - denominator) * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/**
 * Calculate loan affordability based on income
 */
export function calculateLoanAffordability(
  monthlyIncome: number,
  existingEMIs: number = 0,
  debtToIncomeRatio: number = 0.4
): {
  maxEMI: number;
  maxLoanAmount: number;
  recommendation: string;
} {
  const maxEMI = (monthlyIncome * debtToIncomeRatio) - existingEMIs;
  
  // Assuming average interest rate of 10% and 20-year tenure for calculation
  const maxLoanAmount = calculatePrincipalForEMI(maxEMI, 10, 240);
  
  let recommendation = '';
  if (maxEMI <= 0) {
    recommendation = 'Current EMI commitments exceed recommended debt-to-income ratio';
  } else if (maxEMI < 5000) {
    recommendation = 'Consider increasing income or reducing existing EMIs before taking new loan';
  } else {
    recommendation = 'Loan is affordable within recommended limits';
  }

  return {
    maxEMI: Math.max(0, maxEMI),
    maxLoanAmount: Math.max(0, maxLoanAmount),
    recommendation,
  };
}

/**
 * Calculate loan completion percentage based purely on time elapsed from start date
 */
export function calculateTimeBasedCompletion(
  startDate: Date,
  tenureMonths: number,
  currentDate: Date = new Date()
): {
  completionPercentage: number;
  monthsElapsed: number;
  isComplete: boolean;
} {
  if (tenureMonths <= 0) {
    return { completionPercentage: 0, monthsElapsed: 0, isComplete: false };
  }

  // Calculate months elapsed since loan start (precise calculation)
  const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthsDiff = currentDate.getMonth() - startDate.getMonth();
  const daysDiff = currentDate.getDate() - startDate.getDate();
  
  // Calculate total months elapsed with decimal precision
  let monthsElapsed = yearsDiff * 12 + monthsDiff;
  if (daysDiff < 0) {
    monthsElapsed -= 1;
  } else if (daysDiff > 0) {
    // Add fractional month based on days
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    monthsElapsed += daysDiff / daysInCurrentMonth;
  }
  
  // Ensure monthsElapsed is not negative (future start date)
  monthsElapsed = Math.max(0, monthsElapsed);
  
  // Calculate time-based completion percentage
  const completionPercentage = Math.min((monthsElapsed / tenureMonths) * 100, 100);
  const isComplete = monthsElapsed >= tenureMonths;
  
  return {
    completionPercentage: Math.round(completionPercentage * 100) / 100,
    monthsElapsed: Math.round(monthsElapsed * 100) / 100,
    isComplete
  };
}

/**
 * Calculate EMI end date based on start date and tenure
 */
export function calculateEMIEndDate(startDate: Date, tenureMonths: number): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + tenureMonths);
  return endDate;
}

/**
 * Calculate next EMI due date based on start date and months elapsed
 */
export function calculateNextEMIDue(
  startDate: Date,
  monthsElapsed: number,
  totalTenureMonths: number
): Date | null {
  const monthsPaid = Math.floor(monthsElapsed);
  
  // If loan is complete, no next EMI
  if (monthsPaid >= totalTenureMonths) {
    return null;
  }
  
  // Calculate next EMI due date (start date + months paid + 1)
  const nextEmiDate = new Date(startDate);
  nextEmiDate.setMonth(nextEmiDate.getMonth() + monthsPaid + 1);
  
  return nextEmiDate;
}

/**
 * Calculate total outstanding amount (remaining principal + remaining interest)
 */
export function calculateTotalOutstanding(
  currentPrincipal: number,
  annualRate: number,
  remainingMonths: number
): number {
  if (remainingMonths <= 0) return 0;
  
  const schedule = generateEMISchedule(currentPrincipal, annualRate, remainingMonths);
  return schedule.totalPayment; // This includes both remaining principal and interest
}

/**
 * Calculate individual pending amounts breakdown
 */
export function calculatePendingAmounts(
  originalPrincipal: number,
  annualRate: number,
  totalTenureMonths: number,
  monthsElapsed: number
): {
  pendingPrincipal: number;
  pendingInterest: number;
  totalPending: number;
} {
  const remainingMonths = Math.max(0, totalTenureMonths - Math.floor(monthsElapsed));
  
  if (remainingMonths <= 0) {
    return {
      pendingPrincipal: 0,
      pendingInterest: 0,
      totalPending: 0
    };
  }
  
  // Calculate remaining principal after EMIs paid
  const fullSchedule = generateEMISchedule(originalPrincipal, annualRate, totalTenureMonths);
  const monthsPaid = Math.floor(monthsElapsed);
  
  let remainingPrincipal = originalPrincipal;
  
  // Subtract principal portion of each paid EMI
  for (let i = 0; i < Math.min(monthsPaid, fullSchedule.monthlyBreakdown.length); i++) {
    remainingPrincipal = fullSchedule.monthlyBreakdown[i].remainingPrincipal;
  }
  
  // Generate schedule for remaining months with actual remaining principal
  const remainingSchedule = generateEMISchedule(remainingPrincipal, annualRate, remainingMonths);
  
  return {
    pendingPrincipal: remainingPrincipal, // Actual remaining principal after payments
    pendingInterest: remainingSchedule.totalInterest, // Interest on remaining amount
    totalPending: remainingSchedule.totalPayment // Total amount still to be paid
  };
}

/**
 * Calculate principal for a given EMI amount
 */
function calculatePrincipalForEMI(
  emiAmount: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (annualRate === 0) {
    return emiAmount * tenureMonths;
  }

  const monthlyRate = annualRate / 12 / 100;
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const numerator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  
  return Math.round((emiAmount * numerator / denominator) * 100) / 100;
}