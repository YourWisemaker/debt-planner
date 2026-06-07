import {
  buildPayoffPlan,
  compareStrategies,
  orderDebts,
  sumMinimums,
} from '../calculator';
import { Debt } from '../../types';

const debts: Debt[] = [
  { id: '1', name: 'Credit Card A', balance: 5000, apr: 22.99, minimumPayment: 100 },
  { id: '2', name: 'Car Loan', balance: 12000, apr: 6.5, minimumPayment: 250 },
  { id: '3', name: 'Store Card', balance: 800, apr: 26.99, minimumPayment: 35 },
];

describe('orderDebts', () => {
  it('orders by smallest balance first for snowball', () => {
    const ordered = orderDebts(debts, 'snowball');
    expect(ordered.map((d) => d.id)).toEqual(['3', '1', '2']);
  });

  it('orders by highest APR first for avalanche', () => {
    const ordered = orderDebts(debts, 'avalanche');
    expect(ordered.map((d) => d.id)).toEqual(['3', '1', '2']);
  });

  it('does not mutate the input array', () => {
    const before = debts.map((d) => d.id);
    orderDebts(debts, 'snowball');
    expect(debts.map((d) => d.id)).toEqual(before);
  });
});

describe('sumMinimums', () => {
  it('adds up minimum payments', () => {
    expect(sumMinimums(debts)).toBe(385);
  });
});

describe('buildPayoffPlan', () => {
  it('eventually pays off all debt', () => {
    const plan = buildPayoffPlan(debts, 200, 'avalanche');
    const last = plan.schedule[plan.schedule.length - 1];
    expect(last.totalEndingBalance).toBe(0);
    expect(plan.months).toBeGreaterThan(0);
    expect(plan.months).toBeLessThan(1200);
  });

  it('charges less total interest with a bigger extra payment', () => {
    const small = buildPayoffPlan(debts, 50, 'avalanche');
    const large = buildPayoffPlan(debts, 500, 'avalanche');
    expect(large.totalInterestPaid).toBeLessThan(small.totalInterestPaid);
    expect(large.months).toBeLessThanOrEqual(small.months);
  });

  it('total paid equals principal plus interest', () => {
    const plan = buildPayoffPlan(debts, 200, 'snowball');
    expect(plan.totalPaid).toBeCloseTo(plan.originalPrincipal + plan.totalInterestPaid, 1);
  });

  it('produces a debt-free milestone', () => {
    const plan = buildPayoffPlan(debts, 200, 'snowball');
    const done = plan.milestones.find((m) => m.title === 'Debt-free!');
    expect(done).toBeDefined();
    expect(done?.month).toBe(plan.months);
  });

  it('handles an empty debt list', () => {
    const plan = buildPayoffPlan([], 100, 'snowball');
    expect(plan.months).toBe(0);
    expect(plan.totalInterestPaid).toBe(0);
    expect(plan.schedule).toHaveLength(0);
  });

  it('stops safely when payments cannot cover interest', () => {
    const stuck: Debt[] = [
      { id: 'x', name: 'Maxed Card', balance: 10000, apr: 30, minimumPayment: 10 },
    ];
    const plan = buildPayoffPlan(stuck, 0, 'avalanche');
    expect(plan.months).toBeLessThan(1200);
  });
});

describe('compareStrategies', () => {
  it('avalanche never pays more interest than snowball', () => {
    const cmp = compareStrategies(debts, 200);
    expect(cmp.avalanche.totalInterestPaid).toBeLessThanOrEqual(
      cmp.snowball.totalInterestPaid
    );
    expect(cmp.interestSaved).toBeGreaterThanOrEqual(0);
  });
});
