import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type BadgeProps = {
  label: string;
  variant?: 'success' | 'warning' | 'info';
};

export function Badge({
  label,
  variant = 'info',
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },

  success: {
    backgroundColor: '#DCFCE7',
  },

  warning: {
    backgroundColor: '#FEF3C7',
  },

  info: {
    backgroundColor: '#DBEAFE',
  },

  text: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 20,
    textAlign: 'center',
  },
});