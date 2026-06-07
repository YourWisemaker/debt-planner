import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DebtsScreen } from '../screens/DebtsScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { AddEditDebtScreen } from '../screens/AddEditDebtScreen';
import { MilestonesScreen } from '../screens/MilestonesScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Dashboard: '🏠',
  Debts: '💳',
  Plan: '🧮',
  Timeline: '📈',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Debts" component={DebtsScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="AddEditDebt"
          component={AddEditDebtScreen}
          options={({ route }) => ({
            title: route.params?.debtId ? 'Edit debt' : 'Add debt',
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="Milestones"
          component={MilestonesScreen}
          options={{ title: 'Milestones' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
