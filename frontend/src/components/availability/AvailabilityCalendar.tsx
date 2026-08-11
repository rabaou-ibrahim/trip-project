import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type AvailabilityState = 'available' | 'partial' | 'unavailable';

type AvailabilityCalendarProps = {
  mode: 'mine' | 'common';
  isDesktop?: boolean;
  onPrimaryAction?: () => void;
};

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const EMPTY_CELLS = 3;
const DAYS_IN_MONTH = 31;

const INITIAL_AVAILABILITIES: Record<number, AvailabilityState> = {
  14: 'available',
  15: 'available',
  16: 'available',
  17: 'available',
  18: 'available',
  19: 'partial',
  20: 'partial',
  21: 'partial',
  22: 'partial',
  23: 'partial',
  26: 'unavailable',
};

export function AvailabilityCalendar({
  mode,
  isDesktop = false,
  onPrimaryAction,
}: AvailabilityCalendarProps) {
  const [availabilities, setAvailabilities] = useState(INITIAL_AVAILABILITIES);

  const commonStateForDay = (day: number): AvailabilityState | undefined => {
    if (day >= 14 && day <= 20) return day === 14 || day === 20 ? 'partial' : 'available';
    if (day >= 21 && day <= 23) return 'partial';
    return undefined;
  };

  const handleDayPress = (day: number) => {
    if (mode === 'common') return;

    setAvailabilities((current) => {
      const next = { ...current };
      const state = current[day];

      if (!state) next[day] = 'available';
      else if (state === 'available') next[day] = 'partial';
      else if (state === 'partial') next[day] = 'unavailable';
      else delete next[day];

      return next;
    });
  };

  return (
    <View style={[styles.wrapper, isDesktop && styles.desktopWrapper]}>
      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => console.log('Mois précédent')}
            accessibilityRole="button"
            accessibilityLabel="Afficher le mois précédent"
            style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.monthIdentity}>
            <Text style={styles.month}>Juillet 2027</Text>
            {mode === 'mine' && (
              <Text style={styles.monthHint}>Touchez un jour pour modifier son état</Text>
            )}
          </View>

          <Pressable
            onPress={() => console.log('Mois suivant')}
            accessibilityRole="button"
            accessibilityLabel="Afficher le mois suivant"
            style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((weekday, index) => (
            <Text key={`${weekday}-${index}`} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: EMPTY_CELLS }).map((_, index) => (
            <View key={`empty-${index}`} style={[styles.dayCell, isDesktop ? styles.desktopDayCell : styles.mobileDayCell,]} />
          ))}

          {Array.from({ length: DAYS_IN_MONTH }).map((_, index) => {
            const day = index + 1;
            const state =
              mode === 'mine' ? availabilities[day] : commonStateForDay(day);

            return (
              <View key={day} style={[styles.dayCell, isDesktop ? styles.desktopDayCell: styles.mobileDayCell,]}>
                <Pressable
                  onPress={() => handleDayPress(day)}
                  disabled={mode === 'common'}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} juillet 2027${state ? `, ${state}` : ''}`}
                  style={({ pressed }) => [
                    styles.dayButton,
                    state === 'available' && styles.availableDay,
                    state === 'partial' && styles.partialDay,
                    state === 'unavailable' && styles.unavailableDay,
                    pressed && mode === 'mine' && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      state === 'partial' && styles.strongDayText,
                      state === 'unavailable' && styles.unavailableDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <LegendItem color="#A7E2C2" label="Disponible" />
        <LegendItem color="#16A879" label="Partiel" />
        <LegendItem color="#EF5B5B" label="Indisponible" />
      </View>

      {mode === 'common' && (
        <View style={styles.commonSummary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="checkmark-circle-outline" size={23} color={colors.secondary} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryValue}>2 périodes communes</Text>
            <Text style={styles.summaryLabel}>identifiées pour tous les participants</Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={onPrimaryAction}
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>
          {mode === 'mine' ? 'Enregistrer mes disponibilités' : 'Proposer des destinations'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  desktopWrapper: { maxWidth: 760, alignSelf: 'center' },
  calendarCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  monthButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  monthIdentity: { flex: 1, alignItems: 'center' },
  month: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  monthHint: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },
  weekRow: { marginTop: spacing.lg, flexDirection: 'row' },
  weekday: {
    width: '14.2857%',
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  daysGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

    mobileDayCell: {
    aspectRatio: 1.18,
    },

    desktopDayCell: {
    height: 54,
    },
    desktopDayButton: {
    width: 52,
    height: 42,
    },
  dayButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  dayText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  availableDay: { backgroundColor: '#CBEFD9' },
  partialDay: { backgroundColor: '#16A879' },
  unavailableDay: { backgroundColor: '#FDE1E1' },
  strongDayText: { color: '#FFFFFF', fontFamily: typography.fontFamily.semibold },
  unavailableDayText: { color: colors.error },
  legend: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendColor: { width: 13, height: 13, borderRadius: 4 },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  commonSummary: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#F0FAF6',
    borderWidth: 1,
    borderColor: '#CDEBDD',
    borderRadius: radius.lg,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
  },
  summaryText: { flex: 1 },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  summaryLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  primaryButton: {
    minHeight: 50,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  pressed: { opacity: 0.72 },
});
