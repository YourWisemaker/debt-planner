import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../state/DebtContext';
import { colors, font, radius, spacing } from '../theme';

export function MilestonesScreen() {
  const { plan, settings, debts } = useDebts();
  const accent = settings.strategy === 'snowball' ? colors.snowball : colors.avalanche;

  if (debts.length === 0 || plan.milestones.length === 0) {
    return (
      <Screen>
        <Card>
          <EmptyState
            emoji="🏁"
            title="Milestones ahead"
            message="Add debts to unlock your personal payoff milestones — every win is worth celebrating."
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Milestones</Text>
        <Text style={styles.subtitle}>
          {plan.milestones.length} checkpoints between today and debt-free.
        </Text>
      </View>

      <View style={styles.timeline}>
        {plan.milestones.map((m, i) => {
          const isLast = m.title === 'Debt-free!';
          const dotColor = isLast ? colors.success : accent;
          return (
            <View key={`${m.month}-${i}`} style={styles.item}>
              <View style={styles.gutter}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {i < plan.milestones.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <Card style={styles.itemCard}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{m.title}</Text>
                  <Text style={styles.itemMonth}>{m.label}</Text>
                </View>
                <Text style={styles.itemDesc}>{m.description}</Text>
                <ProgressBar progress={m.progress} color={dotColor} height={8} />
                <Text style={styles.itemPct}>
                  {Math.round(m.progress * 100)}% of total debt cleared · month {m.month}
                </Text>
              </Card>
            </View>
          );
        })}
      </View>
    </Screen>
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
    fontSize: font.body,
    marginTop: 2,
  },
  timeline: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gutter: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: spacing.md,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  itemCard: {
    flex: 1,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  itemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  itemTitle: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '800',
    flexShrink: 1,
  },
  itemMonth: {
    color: colors.textMuted,
    fontSize: font.small,
    flexShrink: 0,
  },
  itemDesc: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  itemPct: {
    color: colors.textFaint,
    fontSize: font.tiny,
    marginTop: 2,
  },
});
