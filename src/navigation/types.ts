import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Debts: undefined;
  Plan: undefined;
  Timeline: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  AddEditDebt: { debtId?: string } | undefined;
  Milestones: undefined;
};
