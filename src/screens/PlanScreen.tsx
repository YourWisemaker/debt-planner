import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { StrategyToggle } from '../components/StrategyToggle';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../state/DebtContext';
import { colors, font, radius, spacing } from '../theme';
import { formatCurrency, formatDuration } from '../core/format';

const PRESETS = [0, 50, 100, 200, 350, 500];

export function PlanScreen() {
  const { debts, settings, setStrategy, setExtraPayment, plan, comparison } = useDebts();
  const { width } = useWindowDimensions();
  const compact = width < 380;

  if (debts.length === 0) {
    return (
      <Screen>
        <Text style={styles.title}>Build your plan</Text>
        <Card>
          <EmptyState
            emoji="🧮"
            title="Nothing to plan yet"
            message="Add at least one debt and you can compare strategies and dial in your monthly payment here."
          />
        </Card>
      </Screen>
    );
  }

  const adjust = (delta: number) => {
    setExtraPayment(Math.max(0, Math.round(settings.extraPayment + delta)));
  };

  const recommended = comparison.interestSaved > 0 ? 'avalanche' : settings.strategy;

  return (
    <Screen>
      <Text style={styles.title}>Build your plan</Text>

      <Card style={{ gap: spacing.md }}>
        <Text style={styles.sectionLabel}>Payoff strategy</Text>
        <StrategyToggle value={settings.strategy} onChange={setStrategy} />
        <Text style={styles.help}>
          {settings.strategy === 'snowball'
            ? 'Snowball clears your smallest balances first for fast, motivating wins.'
            : 'Avalanche targets your highest interest rate first to minimize total interest.'}
        </Text>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={styles.sectionLabel}>Extra monthly payment</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => adjust(-25)}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <View style={styles.amountBox}>
            <Text style={styles.amount}>{formatCurrency(settings.extraPayment)}</Text>
            <Text style={styles.amountSub}>on top of minimums</Text>
          </View>
          <Pressable style={styles.stepBtn} onPress={() => adjust(25)}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
        <View style={styles.presets}>
          {PRESETS.map((p) => {
            const active = settings.extraPayment === p;
            return (
              <Pressable
                key={p}
                onPress={() => setExtraPayment(p)}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>
                  ${p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={styles.sectionLabel}>Snowball vs Avalanche</Text>
        <Text style={styles.help}>
          Same {formatCurrency(settings.extraPayment)} extra, compared head to head.
        </Text>

        <View style={[styles.compareRow, compact && styles.compareRowStacked]}>
          <CompareCol
            title="❄️ Snowball"
            color={colors.snowball}
            time={formatDuration(comparison.snowball.months)}
            interest={formatCurrency(comparison.snowball.totalInterestPaid)}
          />
          <CompareCol
            title="🏔️ Avalanche"
            color={colors.avalanche}
            time={formatDuration(comparison.avalanche.months)}
            interest={formatCurrency(comparison.avalanche.totalInterestPaid)}
          />
        </View>

        {comparison.interestSaved > 0 ? (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsText}>
              Avalanche saves you {formatCurrency(comparison.interestSaved)} in interest
              {comparison.monthsSaved > 0
                ? ` and ${comparison.monthsSaved} month${comparison.monthsSaved > 1 ? 's' : ''}`
                : ''}
              .
            </Text>
          </View>
        ) : (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsText}>
              Both strategies cost about the same here — pick whichever keeps you motivated.
            </Text>
          </View>
        )}
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <Text style={styles.sectionLabel}>Your current plan</Text>
        <Row label="Strategy" value={settings.strategy === 'snowball' ? 'Snowball' : 'Avalanche'} />
        <Row label="Debt-free in" value={formatDuration(plan.months)} />
        <Row label="Total interest" value={formatCurrency(plan.totalInterestPaid)} />
        <Row label="Total paid" value={formatCurrency(plan.totalPaid)} />
        {recommended !== settings.strategy ? (
          <Text style={[styles.help, { marginTop: spacing.xs }]}>
            Tip: switching to Avalanche would lower your total interest.
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}

function CompareCol({
  title,
  color,
  time,
  interest,
}: {
  title: string;
  color: string;
  time: string;
  interest: string;
}) {
  return (
    <View style={styles.compareCol}>
      <Text style={[styles.compareTitle, { color }]}>{title}</Text>
      <Text style={styles.compareTime}>{time}</Text>
      <Text style={styles.compareInterestLabel}>interest</Text>
      <Text style={styles.compareInterest}>{interest}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  sectionLabel: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
  },
  help: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  amountBox: {
    flex: 1,
    alignItems: 'center',
  },
  amount: {
    color: colors.primary,
    fontSize: font.h1,
    fontWeight: '900',
    textAlign: 'center',
  },
  amountSub: {
    color: colors.textMuted,
    fontSize: font.tiny,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  preset: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  presetActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '700',
  },
  presetTextActive: {
    color: colors.background,
  },
  compareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareRowStacked: {
    flexDirection: 'column',
  },
  compareCol: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareTitle: {
    fontSize: font.body,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  compareTime: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
    textAlign: 'center',
  },
  compareInterestLabel: {
    color: colors.textFaint,
    fontSize: font.tiny,
    marginTop: spacing.sm,
  },
  compareInterest: {
    color: colors.warning,
    fontSize: font.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  savingsBanner: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savingsText: {
    color: colors.text,
    fontSize: font.small,
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: font.body,
  },
  rowValue: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
});
