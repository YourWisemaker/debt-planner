import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { StrategyType } from '../types';

interface Props {
  value: StrategyType;
  onChange: (strategy: StrategyType) => void;
}

const OPTIONS: { key: StrategyType; label: string; hint: string }[] = [
  { key: 'snowball', label: 'Snowball', hint: 'Smallest balance first' },
  { key: 'avalanche', label: 'Avalanche', hint: 'Highest interest first' },
];

export function StrategyToggle({ value, onChange }: Props) {
  const { width } = useWindowDimensions();
  const stacked = width < 360;

  return (
    <View style={[styles.row, stacked && styles.rowStacked]}>
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        const accent = opt.key === 'snowball' ? colors.snowball : colors.avalanche;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[
              styles.option,
              active && {
                borderColor: accent,
                backgroundColor: colors.surfaceAlt,
              },
            ]}
          >
            <Text style={[styles.label, active && { color: accent }]}>{opt.label}</Text>
            <Text style={styles.hint}>{opt.hint}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowStacked: {
    flexDirection: 'column',
  },
  option: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
  },
  hint: {
    color: colors.textMuted,
    fontSize: font.tiny,
    lineHeight: 15,
    marginTop: 2,
  },
});
