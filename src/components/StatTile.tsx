import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  accent?: string;
  caption?: string;
}

export function StatTile({ label, value, accent = colors.text, caption }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    minWidth: 120,
  },
  label: {
    color: colors.textMuted,
    fontSize: font.small,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: font.h3,
    fontWeight: '800',
  },
  caption: {
    color: colors.textFaint,
    fontSize: font.tiny,
    marginTop: 2,
  },
});
