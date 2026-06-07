import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DebtProvider } from './src/state/DebtContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DebtProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </DebtProvider>
    </SafeAreaProvider>
  );
}
