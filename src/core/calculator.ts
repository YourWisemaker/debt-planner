import {
  Debt,
  Milestone,
  MonthlyDebtState,
  MonthlySnapshot,
  PayoffPlan,
  StrategyComparison,
  StrategyType,
} from '../types';

/** Hard cap so an under-funded plan can't loop forever (100 years). */
const MAX_MONTHS = 1200;

const round = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Orders debts according to the chosen strategy.
 * - snowball: smallest balance first (quick psychological wins)
 * - avalanche: highest APR first (mathematically cheapest)
 * Ties fall back to the opposite key so ordering is deterministic.
 */
export function orderDebts(debts: Debt[], strategy: StrategyType): Debt[] {
  const copy = [...debts];
  copy.sort((a, b) => {
    if (strategy === 'snowball') {
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr;
    }
    if (a.apr !== b.apr) return b.apr - a.apr;
    return a.balance - b.balance;
  });
  return copy;
}

/** Sum of all minimum payments. Used to derive the constant monthly budget. */
export function sumMinimums(debts: Debt[]): number {
  return round(debts.reduce((acc, d) => acc + d.minimumPayment, 0));
}

function formatMonthLabel(startDate: Date, monthOffset: number): string {
  const d = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

interface WorkingDebt {
  debt: Debt;
  balance: number;
}

/**
 * Simulates paying down debts month by month.
 *
 * The total monthly budget stays constant at (sum of minimums + extraPayment).
 * As individual debts are cleared, their freed-up minimums roll into attacking
 * the highest-priority remaining debt — this is the "snowball" rollover that
 * both strategies share; only the targeting order differs.
 */
export function buildPayoffPlan(
  debts: Debt[],
  extraPayment: number,
  strategy: StrategyType,
  startDate: Date = new Date()
): PayoffPlan {
  const activeDebts = debts.filter((d) => d.balance > 0);
  const originalPrincipal = round(activeDebts.reduce((acc, d) => acc + d.balance, 0));
  const monthlyBudget = round(sumMinimums(activeDebts) + Math.max(0, extraPayment));

  const ordered = orderDebts(activeDebts, strategy);
  const working: WorkingDebt[] = ordered.map((debt) => ({ debt, balance: debt.balance }));

  const schedule: MonthlySnapshot[] = [];
  let totalInterestPaid = 0;
  let month = 0;

  while (working.some((w) => w.balance > 0) && month < MAX_MONTHS) {
    month += 1;

    const states: MonthlyDebtState[] = [];
    const paidOffThisMonth: string[] = [];

    // 1. Accrue one month of interest on every outstanding debt.
    const startingBalances = new Map<string, number>();
    const interestByDebt = new Map<string, number>();
    for (const w of working) {
      startingBalances.set(w.debt.id, w.balance);
      if (w.balance <= 0) {
        interestByDebt.set(w.debt.id, 0);
        continue;
      }
      const interest = round(w.balance * (w.debt.apr / 100 / 12));
      interestByDebt.set(w.debt.id, interest);
      w.balance = round(w.balance + interest);
      totalInterestPaid = round(totalInterestPaid + interest);
    }

    // 2. Allocate the monthly budget.
    let available = monthlyBudget;
    const paymentByDebt = new Map<string, number>();
    working.forEach((w) => paymentByDebt.set(w.debt.id, 0));

    // 2a. Cover minimum payments first (capped at the payoff amount).
    for (const w of working) {
      if (w.balance <= 0) continue;
      const minDue = Math.min(w.debt.minimumPayment, w.balance);
      const pay = Math.min(minDue, available);
      w.balance = round(w.balance - pay);
      available = round(available - pay);
      paymentByDebt.set(w.debt.id, round((paymentByDebt.get(w.debt.id) || 0) + pay));
    }

    // 2b. Throw everything left at the highest-priority debt, cascading
    //     to the next one whenever the target is cleared.
    for (const w of working) {
      if (available <= 0) break;
      if (w.balance <= 0) continue;
      const pay = Math.min(w.balance, available);
      w.balance = round(w.balance - pay);
      available = round(available - pay);
      paymentByDebt.set(w.debt.id, round((paymentByDebt.get(w.debt.id) || 0) + pay));
    }

    // 3. Record per-debt state for this month.
    let totalStarting = 0;
    let totalInterest = 0;
    let totalPayment = 0;
    let totalEnding = 0;

    for (const w of working) {
      const starting = startingBalances.get(w.debt.id) || 0;
      const interest = interestByDebt.get(w.debt.id) || 0;
      const payment = paymentByDebt.get(w.debt.id) || 0;
      const wasOutstanding = starting > 0;
      const nowPaidOff = wasOutstanding && w.balance <= 0;
      if (nowPaidOff) paidOffThisMonth.push(w.debt.name);

      states.push({
        debtId: w.debt.id,
        name: w.debt.name,
        startingBalance: round(starting),
        interestCharged: interest,
        paymentApplied: payment,
        endingBalance: round(w.balance),
        paidOff: w.balance <= 0,
      });

      totalStarting += starting;
      totalInterest += interest;
      totalPayment += payment;
      totalEnding += w.balance;
    }

    schedule.push({
      month,
      label: formatMonthLabel(startDate, month - 1),
      totalStartingBalance: round(totalStarting),
      totalInterest: round(totalInterest),
      totalPayment: round(totalPayment),
      totalEndingBalance: round(totalEnding),
      debts: states,
      debtsPaidOffThisMonth: paidOffThisMonth,
    });

    // Safety: an under-funded plan where interest >= payment makes no progress.
    if (totalPayment <= totalInterest && totalEnding > 0) {
      break;
    }
  }

  const totalPaid = round(originalPrincipal + totalInterestPaid);
  const debtFreeDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + month,
    1
  ).toISOString();

  return {
    strategy,
    months: month,
    totalInterestPaid,
    totalPaid,
    originalPrincipal,
    debtFreeDate,
    schedule,
    milestones: buildMilestones(schedule, originalPrincipal),
  };
}

/**
 * Derives motivational milestones from a finished schedule:
 * every debt payoff plus 25/50/75/100% progress markers.
 */
export function buildMilestones(
  schedule: MonthlySnapshot[],
  originalPrincipal: number
): Milestone[] {
  if (originalPrincipal <= 0 || schedule.length === 0) return [];

  const milestones: Milestone[] = [];
  const progressTargets = [0.25, 0.5, 0.75, 1];
  const reached = new Set<number>();

  for (const snap of schedule) {
    // Individual debt payoffs.
    for (const name of snap.debtsPaidOffThisMonth) {
      milestones.push({
        month: snap.month,
        label: snap.label,
        title: `Paid off ${name}`,
        description: `${name} is gone for good. One less payment to worry about.`,
        progress: round((originalPrincipal - snap.totalEndingBalance) / originalPrincipal),
      });
    }

    // Percentage-of-debt-eliminated milestones.
    const progress = (originalPrincipal - snap.totalEndingBalance) / originalPrincipal;
    for (const target of progressTargets) {
      if (progress >= target && !reached.has(target)) {
        reached.add(target);
        const pct = Math.round(target * 100);
        milestones.push({
          month: snap.month,
          label: snap.label,
          title: target === 1 ? 'Debt-free!' : `${pct}% of debt eliminated`,
          description:
            target === 1
              ? 'You crossed the finish line. Every dollar is yours again.'
              : `You've wiped out ${pct}% of where you started. Keep the momentum.`,
          progress: round(Math.min(progress, 1)),
        });
      }
    }
  }

  milestones.sort((a, b) => a.month - b.month || a.progress - b.progress);
  return milestones;
}

/** Runs both strategies and quantifies the difference between them. */
export function compareStrategies(
  debts: Debt[],
  extraPayment: number,
  startDate: Date = new Date()
): StrategyComparison {
  const snowball = buildPayoffPlan(debts, extraPayment, 'snowball', startDate);
  const avalanche = buildPayoffPlan(debts, extraPayment, 'avalanche', startDate);

  return {
    snowball,
    avalanche,
    interestSaved: round(Math.max(0, snowball.totalInterestPaid - avalanche.totalInterestPaid)),
    monthsSaved: Math.max(0, snowball.months - avalanche.months),
  };
}
