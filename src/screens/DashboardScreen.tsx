import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { ProgressBar } from '../components/ProgressBar';
import { BalanceChart } from '../components/BalanceChart';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../state/DebtContext';
import { colors, font, spacing } from '../theme';
import { formatCurrency, formatDuration, formatMonthYear } from '../core/format';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function DashboardScreen({ navigation }: Props) {
  const { debts, plan, settings, totalBalance, totalMinimums } = useDebts();

  if (debts.length === 0) {
    return (
      <Screen>
        <Header />
        <Card>
          <EmptyState
            emoji="🎯"
            title="Let's map your way out"
            message="Add your debts and we'll build a month-by-month plan to get you debt-free as fast as possible."
            actionLabel="Add your first debt"
            onAction={() => navigation.navigate('AddEditDebt')}
          />
        </Card>
      </Screen>
    );
  }

  const accent = settings.strategy === 'snowball' ? colors.snowball : colors.avalanche;
  const nextMilestone = plan.milestones.find((m) => m.title !== 'Debt-free!');

  return (
    <Screen>
      <Header />

      <Card style={{ gap: spacing.md }}>
        <View>
          <Text style={styles.cardLabel}>Total debt remaining</Text>
          <Text style={styles.bigNumber}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.subtle}>
            Across {debts.length} debt{debts.length > 1 ? 's' : ''} ·{' '}
            {formatCurrency(totalMinimums)}/mo minimums
          </Text>
        </View>
        <BalanceChart
          schedule={plan.schedule}
          originalPrincipal={plan.originalPrincipal}
          color={accent}
        />
      </Card>

      <View style={styles.tiles}>
        <StatTile
          label="Debt-free in"
          value={formatDuration(plan.months)}
          accent={colors.success}
          caption={formatMonthYear(plan.debtFreeDate)}
        />
        <StatTile
          label="Total interest"
          value={formatCurrency(plan.totalInterestPaid)}
          accent={colors.warning}
          caption="at current plan"
        />
      </View>

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardLabel}>Active strategy</Text>
          <Text style={[styles.strategyName, { color: accent }]}>
            {settings.strategy === 'snowball' ? '❄️ Snowball' : '🏔️ Avalanche'}
          </Text>
        </View>
        <Text style={styles.subtle}>
          Paying {formatCurrency(settings.extraPayment)} extra each month on top of minimums.
        </Text>
        <AppButton
          label="Adjust plan"
          variant="secondary"
          onPress={() => navigation.navigate('Tabs', { screen: 'Plan' })}
        />
      </Card>

      {nextMilestone ? (
        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.cardLabel}>Next milestone</Text>
          <Text style={styles.milestoneTitle}>{nextMilestone.title}</Text>
          <Text style={styles.subtle}>
            Projected for {nextMilestone.label} · {nextMilestone.month} month
            {nextMilestone.month > 1 ? 's' : ''} away
          </Text>
          <ProgressBar progress={nextMilestone.progress} color={accent} />
          <AppButton
            label="See all milestones"
            variant="ghost"
            onPress={() => navigation.navigate('Milestones')}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

function Header() {
  return (
    <View>
      <Text style={styles.greeting}>Your payoff plan</Text>
      <Text style={styles.greetingSub}>Stay focused. Every payment counts.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  greetingSub: {
    color: colors.textMuted,
    fontSize: font.body,
    marginTop: 2,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  bigNumber: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    marginVertical: 2,
  },
  subtle: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyName: {
    fontSize: font.body,
    fontWeight: '800',
  },
  milestoneTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
  },
});
