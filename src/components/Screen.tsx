import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
}

export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const padTop = insets.top + spacing.md;

  if (!scroll) {
    return (
      <View style={[styles.container, { paddingTop: padTop }]}>{children}</View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: padTop,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.md,
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
