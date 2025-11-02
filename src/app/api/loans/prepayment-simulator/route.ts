import { calculateOutstandingPrincipal, simulatePrepayment } from '@/lib/emi-calculator';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      principalAmount,
      interestRate,
      tenureMonths,
      elapsedMonths = 0,
      prepaymentAmount,
      prepaymentType = 'reduce_tenure'
    } = body;

    // Validate required fields
    if (!principalAmount || !interestRate || !tenureMonths || !prepaymentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: principalAmount, interestRate, tenureMonths, prepaymentAmount' },
        { status: 400 }
      );
    }

    // Calculate current outstanding principal
    const currentPrincipal = calculateOutstandingPrincipal(
      principalAmount,
      interestRate,
      tenureMonths,
      elapsedMonths
    );

    // Validate prepayment amount
    if (prepaymentAmount >= currentPrincipal) {
      return NextResponse.json(
        { error: 'Prepayment amount cannot be greater than or equal to remaining principal' },
        { status: 400 }
      );
    }

    const remainingTenure = tenureMonths - elapsedMonths;

    // Simulate prepayment
    const simulation = simulatePrepayment(
      currentPrincipal,
      interestRate,
      remainingTenure,
      prepaymentAmount,
      prepaymentType
    );

    // Calculate current completion percentage based on elapsed months
    const currentDate = new Date();
    const startDate = new Date(); // This would come from loan data in real implementation
    const completionPercentage = elapsedMonths > 0 ? (elapsedMonths / tenureMonths) * 100 : 0;
    
    // Calculate outstanding balance after prepayment
    const outstandingAfterPrepayment = currentPrincipal - prepaymentAmount;

    // Add additional insights
    const insights = {
      currentOutstanding: currentPrincipal,
      outstandingAfterPrepayment,
      currentCompletionPercentage: Math.round(completionPercentage * 100) / 100,
      prepaymentPercentage: (prepaymentAmount / currentPrincipal) * 100,
      interestSavingsPercentage: (simulation.interestSavings / simulation.originalTotalInterest) * 100,
      monthsReduced: simulation.tenureReduction,
      principalReductionPercentage: (prepaymentAmount / principalAmount) * 100,
      newCompletionAfterPrepayment: Math.round(((elapsedMonths / simulation.newTenure) * 100) * 100) / 100,
      recommendation: generatePrepaymentRecommendation(simulation, prepaymentAmount),
    };

    return NextResponse.json({
      ...simulation,
      insights,
      currentPrincipal,
      remainingTenure,
      elapsedMonths,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
    });
  } catch (error) {
    console.error('Error simulating prepayment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generatePrepaymentRecommendation(
  simulation: any,
  prepaymentAmount: number
): string {
  const { interestSavings, tenureReduction } = simulation;
  
  if (interestSavings > prepaymentAmount * 0.3) {
    return 'Excellent prepayment opportunity! High interest savings expected.';
  } else if (interestSavings > prepaymentAmount * 0.15) {
    return 'Good prepayment option with moderate interest savings.';
  } else if (tenureReduction > 12) {
    return 'Prepayment will significantly reduce loan tenure.';
  } else {
    return 'Consider if prepayment is the best use of funds compared to other investments.';
  }
}