import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Debt, PayoffPlan, StrategyComparison, StrategyType } from '../types';
import { buildPayoffPlan, compareStrategies } from '../core/calculator';
import {
  defaultSettings,
  loadDebts,
  loadSettings,
  PlannerSettings,
  saveDebts,
  saveSettings,
} from '../storage/storage';

interface DebtContextValue {
  debts: Debt[];
  settings: PlannerSettings;
  loading: boolean;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (debt: Debt) => void;
  removeDebt: (id: string) => void;
  setExtraPayment: (amount: number) => void;
  setStrategy: (strategy: StrategyType) => void;
  plan: PayoffPlan;
  comparison: StrategyComparison;
  totalBalance: number;
  totalMinimums: number;
}

const DebtContext = createContext<DebtContextValue | undefined>(undefined);

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DebtProvider({ children }: { children: React.ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [settings, setSettings] = useState<PlannerSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedDebts, storedSettings] = await Promise.all([
        loadDebts(),
        loadSettings(),
      ]);
      if (!active) return;
      setDebts(storedDebts);
      setSettings(storedSettings);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever data changes (after the initial load completes).
  useEffect(() => {
    if (!loading) saveDebts(debts);
  }, [debts, loading]);

  useEffect(() => {
    if (!loading) saveSettings(settings);
  }, [settings, loading]);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt'>) => {
    setDebts((prev) => [
      ...prev,
      { ...debt, id: makeId(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const updateDebt = useCallback((debt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const setExtraPayment = useCallback((extraPayment: number) => {
    setSettings((prev) => ({ ...prev, extraPayment }));
  }, []);

  const setStrategy = useCallback((strategy: StrategyType) => {
    setSettings((prev) => ({ ...prev, strategy }));
  }, []);

  const plan = useMemo(
    () => buildPayoffPlan(debts, settings.extraPayment, settings.strategy),
    [debts, settings.extraPayment, settings.strategy]
  );

  const comparison = useMemo(
    () => compareStrategies(debts, settings.extraPayment),
    [debts, settings.extraPayment]
  );

  const totalBalance = useMemo(
    () => debts.reduce((acc, d) => acc + d.balance, 0),
    [debts]
  );

  const totalMinimums = useMemo(
    () => debts.reduce((acc, d) => acc + d.minimumPayment, 0),
    [debts]
  );

  const value: DebtContextValue = {
    debts,
    settings,
    loading,
    addDebt,
    updateDebt,
    removeDebt,
    setExtraPayment,
    setStrategy,
    plan,
    comparison,
    totalBalance,
    totalMinimums,
  };

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

export function useDebts(): DebtContextValue {
  const ctx = useContext(DebtContext);
  if (!ctx) throw new Error('useDebts must be used within a DebtProvider');
  return ctx;
}
