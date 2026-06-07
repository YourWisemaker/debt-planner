import AsyncStorage from '@react-native-async-storage/async-storage';
import { Debt, StrategyType } from '../types';

const DEBTS_KEY = '@debt_planner/debts';
const SETTINGS_KEY = '@debt_planner/settings';

export interface PlannerSettings {
  extraPayment: number;
  strategy: StrategyType;
}

export const defaultSettings: PlannerSettings = {
  extraPayment: 200,
  strategy: 'avalanche',
};

export async function loadDebts(): Promise<Debt[]> {
  try {
    const raw = await AsyncStorage.getItem(DEBTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Debt[]) : [];
  } catch {
    return [];
  }
}

export async function saveDebts(debts: Debt[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  } catch {
    // Persistence is best-effort; in-memory state remains the source of truth.
  }
}

export async function loadSettings(): Promise<PlannerSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: PlannerSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // best-effort
  }
}
