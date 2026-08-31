import Ionicons from '@expo/vector-icons/Ionicons';
import { createElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type DateFieldProps = {
  label: string | null;
  value: string;
  onChange: (value: string) => void;
};

export function DateField({
  label,
  value,
  onChange,
}: DateFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.input}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={colors.primary}
        />

        {createElement('input', {
          type: 'date',
          value,
          onChange: (event: any) => onChange(event.target.value),
          style: {
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            color: '#1A1C23',
          },
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
  },
});