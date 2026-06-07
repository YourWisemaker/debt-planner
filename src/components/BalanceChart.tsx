import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, font, spacing } from '../theme';
import { MonthlySnapshot } from '../types';
import { formatCurrency } from '../core/format';

interface Props {
  schedule: MonthlySnapshot[];
  originalPrincipal: number;
  color?: string;
  width?: number;
  height?: number;
}

/**
 * A lightweight area + line chart of total balance over time.
 * Renders the projected glide path to zero without external chart deps.
 */
export function BalanceChart({
  schedule,
  originalPrincipal,
  color = colors.primary,
  width = 320,
  height = 180,
}: Props) {
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Include month 0 (starting balance) for a complete glide path.
  const points = [
    { month: 0, balance: originalPrincipal },
    ...schedule.map((s) => ({ month: s.month, balance: s.totalEndingBalance })),
  ];

  if (points.length < 2 || originalPrincipal <= 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Add debts to see your payoff curve.</Text>
      </View>
    );
  }

  const maxBalance = originalPrincipal;
  const lastMonth = points[points.length - 1].month || 1;

  const x = (month: number) => padding.left + (month / lastMonth) * chartW;
  const y = (balance: number) =>
    padding.top + chartH - (balance / maxBalance) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.month).toFixed(1)} ${y(p.balance).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `${linePath} L ${x(lastMonth).toFixed(1)} ${(padding.top + chartH).toFixed(1)}` +
    ` L ${x(0).toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#balanceFill)" />
        <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" />
        <Circle cx={x(0)} cy={y(originalPrincipal)} r={4} fill={color} />
        <Circle
          cx={x(lastMonth)}
          cy={y(0)}
          r={4}
          fill={colors.success}
        />
      </Svg>
      <View style={styles.axis}>
        <Text style={styles.axisText}>Today · {formatCurrency(originalPrincipal)}</Text>
        <Text style={[styles.axisText, { color: colors.success }]}>Debt-free</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  axisText: {
    color: colors.textMuted,
    fontSize: font.tiny,
  },
});
