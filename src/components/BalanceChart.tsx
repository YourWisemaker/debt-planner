import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, font, spacing } from '../theme';
import { MonthlySnapshot } from '../types';
import { formatCurrency } from '../core/format';

interface Props {
  schedule: MonthlySnapshot[];
  originalPrincipal: number;
  color?: string;
  /** Fixed height; width is measured from the parent so the chart fills it. */
  height?: number;
}

/**
 * A lightweight area + line chart of total balance over time.
 * Measures its own width via onLayout so it always fills its container,
 * keeping it aligned with surrounding cards on any screen size.
 */
export function BalanceChart({
  schedule,
  originalPrincipal,
  color = colors.primary,
  height = 180,
}: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - width) > 1) setWidth(w);
  };

  const padding = { top: 12, right: 4, bottom: 0, left: 4 };
  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = Math.max(0, height - padding.top - padding.bottom);

  // Include month 0 (starting balance) for a complete glide path.
  const points = [
    { month: 0, balance: originalPrincipal },
    ...schedule.map((s) => ({ month: s.month, balance: s.totalEndingBalance })),
  ];

  const hasData = points.length >= 2 && originalPrincipal > 0;

  const maxBalance = originalPrincipal || 1;
  const lastMonth = points[points.length - 1].month || 1;

  const x = (month: number) => padding.left + (month / lastMonth) * chartW;
  const y = (balance: number) => padding.top + chartH - (balance / maxBalance) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.month).toFixed(1)} ${y(p.balance).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `${linePath} L ${x(lastMonth).toFixed(1)} ${(padding.top + chartH).toFixed(1)}` +
    ` L ${x(0).toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {!hasData ? (
        <View style={[styles.empty, { height }]}>
          <Text style={styles.emptyText}>Add debts to see your payoff curve.</Text>
        </View>
      ) : width > 0 ? (
        <>
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
            <Circle cx={x(lastMonth)} cy={y(0)} r={4} fill={colors.success} />
          </Svg>
          <View style={styles.axis}>
            <Text style={styles.axisText}>Today · {formatCurrency(originalPrincipal)}</Text>
            <Text style={[styles.axisText, { color: colors.success }]}>Debt-free</Text>
          </View>
        </>
      ) : (
        // Reserve height during the first layout pass to avoid a jump.
        <View style={{ height }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  empty: {
    width: '100%',
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
