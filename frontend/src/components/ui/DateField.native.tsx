import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateField({
  label,
  value,
  onChange,
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = value
    ? new Date(`${value}T00:00:00`)
    : new Date();

  const handleChange = (
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    setShowPicker(false);

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onChange(formatDateForApi(date));
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setShowPicker(true)}
        style={styles.input}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={colors.primary}
        />

        <Text
          style={[
            styles.value,
            !value && styles.placeholder,
          ]}
        >
          {value ? formatDateForDisplay(value) : 'Choisir une date'}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR');
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
  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  placeholder: {
    color: colors.textMuted,
  },
});