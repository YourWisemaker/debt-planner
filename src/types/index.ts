export type StrategyType = 'snowball' | 'avalanche';

export interface Debt {
  id: string;
  name: string;
  /** Current outstanding balance in dollars. */
  balance: number;
  /** Annual Percentage Rate as a percentage, e.g. 19.99 for 19.99%. */
  apr: number;
  /** Minimum monthly payment required by the lender. */
  minimumPayment: number;
  /** Optional ISO date string of when the debt was added. */
  createdAt?: string;
}

/** A single debt's state during one month of the payoff simulation. */
export interface MonthlyDebtState {
  debtId: string;
  name: string;
  startingBalance: number;
  interestCharged: number;
  paymentApplied: number;
  endingBalance: number;
  paidOff: boolean;
}

/** Aggregated results for a single month across all debts. */
export interface MonthlySnapshot {
  /** Month index, starting at 1. */
  month: number;
  /** Calendar date label for this month, e.g. "Jan 2026". */
  label: string;
  totalStartingBalance: number;
  totalInterest: number;
  totalPayment: number;
  totalEndingBalance: number;
  debts: MonthlyDebtState[];
  /** Names of debts that were fully paid off during this month. */
  debtsPaidOffThisMonth: string[];
}

export interface Milestone {
  month: number;
  label: string;
  title: string;
  description: string;
  /** Fraction of total starting debt eliminated, 0..1. */
  progress: number;
}

export interface PayoffPlan {
  strategy: StrategyType;
  /** Number of months until fully debt-free. */
  months: number;
  totalInterestPaid: number;
  totalPaid: number;
  originalPrincipal: number;
  /** ISO date of projected debt-free month. */
  debtFreeDate: string;
  schedule: MonthlySnapshot[];
  milestones: Milestone[];
}

export interface StrategyComparison {
  snowball: PayoffPlan;
  avalanche: PayoffPlan;
  /** Interest saved by choosing avalanche over snowball (>= 0). */
  interestSaved: number;
  /** Months saved by the faster strategy (usually 0, they often match). */
  monthsSaved: number;
}
