import React from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../state/DebtContext';
import { colors, font, radius, spacing } from '../theme';
import { formatCurrency, formatPercent } from '../core/format';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { orderDebts } from '../core/calculator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Debts'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function DebtsScreen({ navigation }: Props) {
  const { debts, settings, removeDebt, totalBalance } = useDebts();
  const { width } = useWindowDimensions();
  const compact = width < 380;

  if (debts.length === 0) {
    return (
      <Screen>
        <Text style={styles.title}>Your debts</Text>
        <Card>
          <EmptyState
            emoji="📋"
            title="No debts yet"
            message="Add each loan or card you're paying off. Include the balance, interest rate, and minimum payment."
            actionLabel="Add a debt"
            onAction={() => navigation.navigate('AddEditDebt')}
          />
        </Card>
      </Screen>
    );
  }

  // Display in the order the active strategy will attack them.
  const ordered = orderDebts(debts, settings.strategy);

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Remove debt', `Remove "${name}" from your plan?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDebt(id) },
    ]);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Your debts</Text>
          <Text style={styles.subtitle}>
            {formatCurrency(totalBalance)} total · payoff order shown
          </Text>
        </View>
      </View>

      {ordered.map((debt, index) => {
        const accent =
          settings.strategy === 'snowball' ? colors.snowball : colors.avalanche;
        return (
          <Card key={debt.id} style={{ gap: spacing.sm }}>
            <View style={[styles.debtHeader, compact && styles.debtHeaderStacked]}>
              <View style={styles.nameRow}>
                <View style={[styles.orderBadge, { borderColor: accent }]}>
                  <Text style={[styles.orderText, { color: accent }]}>{index + 1}</Text>
                </View>
                <Text style={styles.debtName}>{debt.name}</Text>
              </View>
              <Text
                style={[styles.balance, compact && styles.balanceCompact]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {formatCurrency(debt.balance)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Meta label="APR" value={formatPercent(debt.apr)} />
              <Meta label="Min / mo" value={formatCurrency(debt.minimumPayment)} />
            </View>

            <View style={styles.actions}>
              <AppButton
                label="Edit"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('AddEditDebt', { debtId: debt.id })}
              />
              <AppButton
                label="Remove"
                variant="ghost"
                style={{ flex: 1 }}
                onPress={() => confirmDelete(debt.id, debt.name)}
              />
            </View>
          </Card>
        );
      })}

      <AppButton
        label="+ Add another debt"
        onPress={() => navigation.navigate('AddEditDebt')}
      />
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  debtHeaderStacked: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: font.small,
    fontWeight: '800',
  },
  debtName: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
    flexShrink: 1,
  },
  balance: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
    flexShrink: 0,
  },
  balanceCompact: {
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    minWidth: 112,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  metaValue: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
