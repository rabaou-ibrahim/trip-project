import { useMemo, useState } from 'react';
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
const TODAY = new Date();
const INITIAL_YEAR = TODAY.getFullYear();
const INITIAL_MONTH_INDEX = TODAY.getMonth();

const INITIAL_AVAILABILITIES: Record<string, AvailabilityState> = {
  '2027-07-14': 'available',
  '2027-07-15': 'available',
  '2027-07-16': 'available',
  '2027-07-17': 'available',
  '2027-07-18': 'available',
  '2027-07-19': 'partial',
  '2027-07-20': 'partial',
  '2027-07-21': 'partial',
  '2027-07-22': 'partial',
  '2027-07-23': 'partial',
  '2027-07-26': 'unavailable',
};

const COMMON_AVAILABILITIES: Record<string, AvailabilityState> = {
  '2027-07-14': 'partial',
  '2027-07-15': 'available',
  '2027-07-16': 'available',
  '2027-07-17': 'available',
  '2027-07-18': 'available',
  '2027-07-19': 'available',
  '2027-07-20': 'partial',
  '2027-07-21': 'partial',
  '2027-07-22': 'partial',
  '2027-07-23': 'partial',
};

export function AvailabilityCalendar({
  mode,
  isDesktop = false,
  onPrimaryAction,
}: AvailabilityCalendarProps) {
  const [availabilities, setAvailabilities] = useState(
    INITIAL_AVAILABILITIES,
  );
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(INITIAL_YEAR, INITIAL_MONTH_INDEX, 1),
  );

  const year = displayedMonth.getFullYear();
  const monthIndex = displayedMonth.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const emptyCells = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  const monthLabel = useMemo(() => {
    const value = displayedMonth.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });

    return value.charAt(0).toUpperCase() + value.slice(1);
  }, [displayedMonth]);

  const isInitialMonth =
    year === INITIAL_YEAR && monthIndex === INITIAL_MONTH_INDEX;

  const changeMonth = (offset: number) => {
    setDisplayedMonth(
      current =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1,
        ),
    );
  };

  const resetMonth = () => {
    setDisplayedMonth(new Date(INITIAL_YEAR, INITIAL_MONTH_INDEX, 1));
  };

  const dateKeyForDay = (day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDayPress = (day: number) => {
    if (mode === 'common') return;

    const dateKey = dateKeyForDay(day);

    setAvailabilities(current => {
      const next = { ...current };
      const state = current[dateKey];

      if (!state) next[dateKey] = 'available';
      else if (state === 'available') next[dateKey] = 'partial';
      else if (state === 'partial') next[dateKey] = 'unavailable';
      else delete next[dateKey];

      return next;
    });
  };

  return (
    <View style={[styles.wrapper, isDesktop && styles.desktopWrapper]}>
      <View style={[styles.calendarCard, isDesktop && styles.desktopCalendarCard]}>
        <View style={styles.monthHeader}>
        <MonthButton
          icon="chevron-back"
          label="Afficher le mois précédent"
          onPress={() => changeMonth(-1)}
        />

        <Text style={styles.monthTitle}>
          {monthLabel}
        </Text>

        <MonthButton
          icon="chevron-forward"
          label="Afficher le mois suivant"
          onPress={() => changeMonth(1)}
        />
      </View>

        {!isInitialMonth && (
          <Pressable
            onPress={resetMonth}
            accessibilityRole="button"
            accessibilityLabel="Revenir au mois actuel"
            style={({ pressed }) => [
              styles.resetMonthButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.resetMonthText}>
              Revenir à aujourd’hui
            </Text>
          </Pressable>
        )}

        <View style={styles.weekRow}>
          {WEEKDAYS.map((weekday, index) => (
            <Text key={`${weekday}-${index}`} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: emptyCells }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateKey = dateKeyForDay(day);
            const state =
              mode === 'mine'
                ? availabilities[dateKey]
                : COMMON_AVAILABILITIES[dateKey];

            return (
              <View key={dateKey} style={styles.dayCell}>
                <Pressable
                  onPress={() => handleDayPress(day)}
                  disabled={mode === 'common'}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} ${monthLabel}${state ? `, ${state}` : ''}`}
                  style={({ pressed }) => [
                    styles.dayButton,
                    isDesktop
                      ? styles.desktopDayButton
                      : styles.mobileDayButton,
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

      {mode === 'common' && isInitialMonth && (
        <View style={styles.commonSummary}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={23}
              color={colors.secondary}
            />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryValue}>2 périodes communes</Text>
            <Text style={styles.summaryLabel}>
              identifiées pour tous les participants
            </Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={onPrimaryAction}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>
          {mode === 'mine'
            ? 'Enregistrer mes disponibilités'
            : 'Proposer des destinations'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function MonthButton({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.monthButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
    </Pressable>
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
  wrapper: { 
    width: '100%' 
  },
  desktopWrapper: { 
    maxWidth: 760, alignSelf: 'center' 
  },
  calendarCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  monthHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  monthTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontFamily: typography.fontFamily.bold,
  },
  resetMonthButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#EAF1FF',
    borderRadius: radius.full,
  },
  resetMonthText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  weekRow: { 
    marginTop: spacing.lg, 
    flexDirection: 'row' 
  },
  weekday: {
    width: '14.2857%',
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily.semibold,
    textAlign: 'center',
  },
  daysGrid: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  mobileDayButton: { width: 40, height: 38 },
  desktopDayButton: {
    width: 54,
    height: 34,
  },
  dayText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  availableDay: { 
    backgroundColor: '#CBEFD9' 
  },
  partialDay: { 
    backgroundColor: '#16A879' 
  },
  unavailableDay: { 
    backgroundColor: '#FDE1E1' 
  },
  strongDayText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
  },
  unavailableDayText: { 
    color: colors.error 
  },
  legend: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: { 
    width: 13, height: 13, 
    borderRadius: 4 
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
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
  desktopCalendarCard: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  pressed: { opacity: 0.72 },
});