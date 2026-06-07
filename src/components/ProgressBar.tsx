import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.success, height = 10 }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
