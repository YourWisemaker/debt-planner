import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { BalanceChart } from '../components/BalanceChart';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../state/DebtContext';
import { colors, font, radius, spacing } from '../theme';
import { formatCurrency, formatDuration } from '../core/format';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Timeline'>,
  NativeStackScreenProps<RootStackParamList>
>;

const INITIAL_ROWS = 12;

export function TimelineScreen({ navigation }: Props) {
  const { debts, plan, settings } = useDebts();
  const [expanded, setExpanded] = useState(false);

  if (debts.length === 0) {
    return (
      <Screen>
        <Text style={styles.title}>Timeline</Text>
        <Card>
          <EmptyState
            emoji="📈"
            title="No timeline yet"
            message="Once you add debts, you'll see exactly how your balance falls to zero, month by month."
          />
        </Card>
      </Screen>
    );
  }

  const accent = settings.strategy === 'snowball' ? colors.snowball : colors.avalanche;
  const rows = expanded ? plan.schedule : plan.schedule.slice(0, INITIAL_ROWS);

  return (
    <Screen>
      <Text style={styles.title}>Timeline</Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={styles.cardLabel}>Balance over time</Text>
        <BalanceChart
          schedule={plan.schedule}
          originalPrincipal={plan.originalPrincipal}
          color={accent}
          height={200}
        />
        <Text style={styles.subtle}>
          {formatDuration(plan.months)} to zero · {formatCurrency(plan.totalInterestPaid)}{' '}
          interest along the way.
        </Text>
        <AppButton
          label="View milestones"
          variant="secondary"
          onPress={() => navigation.navigate('Milestones')}
        />
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <Text style={styles.cardLabel}>Month-by-month</Text>
        <View style={styles.tableHead}>
          <Text style={[styles.cell, styles.cellMonth, styles.headText]}>Month</Text>
          <Text style={[styles.cell, styles.headText]}>Payment</Text>
          <Text style={[styles.cell, styles.headText]}>Interest</Text>
          <Text style={[styles.cell, styles.headText]}>Balance</Text>
        </View>

        {rows.map((snap) => (
          <View key={snap.month}>
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellMonth, styles.cellStrong]}>
                {snap.label}
              </Text>
              <Text style={styles.cell}>{formatCurrency(snap.totalPayment)}</Text>
              <Text style={[styles.cell, { color: colors.warning }]}>
                {formatCurrency(snap.totalInterest)}
              </Text>
              <Text style={[styles.cell, styles.cellStrong]}>
                {formatCurrency(snap.totalEndingBalance)}
              </Text>
            </View>
            {snap.debtsPaidOffThisMonth.map((name) => (
              <Text key={name} style={styles.paidOff}>
                ✓ Paid off {name}
              </Text>
            ))}
          </View>
        ))}

        {plan.schedule.length > INITIAL_ROWS ? (
          <Pressable onPress={() => setExpanded((e) => !e)} style={styles.expandBtn}>
            <Text style={styles.expandText}>
              {expanded
                ? 'Show less'
                : `Show all ${plan.schedule.length} months`}
            </Text>
          </Pressable>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  cardLabel: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
  },
  subtle: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
  tableHead: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cell: {
    flex: 1,
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'right',
  },
  cellMonth: {
    flex: 1.2,
    textAlign: 'left',
  },
  headText: {
    color: colors.textFaint,
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cellStrong: {
    color: colors.text,
    fontWeight: '700',
  },
  paidOff: {
    color: colors.success,
    fontSize: font.small,
    fontWeight: '600',
    paddingBottom: spacing.xs,
  },
  expandBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  expandText: {
    color: colors.primary,
    fontSize: font.body,
    fontWeight: '700',
  },
});
