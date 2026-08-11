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

type Participant = {
  name: string;
  initials: string;
  color: string;
  isCurrentUser?: boolean;
};

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const TODAY = new Date();
const INITIAL_YEAR = TODAY.getFullYear();
const INITIAL_MONTH_INDEX = TODAY.getMonth();

const initialDateKey = (day: number) =>
  `${INITIAL_YEAR}-${String(INITIAL_MONTH_INDEX + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const INITIAL_AVAILABILITIES: Record<string, AvailabilityState> = {
  [initialDateKey(14)]: 'available',
  [initialDateKey(15)]: 'available',
  [initialDateKey(16)]: 'available',
  [initialDateKey(17)]: 'available',
  [initialDateKey(18)]: 'available',
  [initialDateKey(19)]: 'partial',
  [initialDateKey(20)]: 'partial',
  [initialDateKey(21)]: 'partial',
  [initialDateKey(22)]: 'partial',
  [initialDateKey(23)]: 'partial',
  [initialDateKey(26)]: 'unavailable',
};

const COMMON_AVAILABILITIES: Record<string, AvailabilityState> = {
  [initialDateKey(14)]: 'partial',
  [initialDateKey(15)]: 'available',
  [initialDateKey(16)]: 'available',
  [initialDateKey(17)]: 'available',
  [initialDateKey(18)]: 'available',
  [initialDateKey(21)]: 'partial',
  [initialDateKey(22)]: 'partial',
  [initialDateKey(23)]: 'partial',
};

const PARTICIPANTS: Participant[] = [
  { name: 'Ibrahim', initials: 'IB', color: '#2563EB', isCurrentUser: true },
  { name: 'Alice', initials: 'AL', color: '#0F766E' },
  { name: 'Mehdi', initials: 'ME', color: '#D97706' },
  { name: 'Lucas', initials: 'LU', color: '#7C3AED' },
  { name: 'Chloé', initials: 'CH', color: '#DB2777' },
];

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

  const dateKeyForDay = (day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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

  const stateForDay = (day: number) => {
    const dateKey = dateKeyForDay(day);

    return mode === 'mine'
      ? availabilities[dateKey]
      : COMMON_AVAILABILITIES[dateKey];
  };

  const calendar = (
    <CalendarGrid
      monthLabel={monthLabel}
      emptyCells={emptyCells}
      daysInMonth={daysInMonth}
      isDesktop={isDesktop}
      mode={mode}
      stateForDay={stateForDay}
      dateKeyForDay={dateKeyForDay}
      onDayPress={handleDayPress}
      onPreviousMonth={() => changeMonth(-1)}
      onNextMonth={() => changeMonth(1)}
    />
  );

  if (isDesktop && mode === 'mine') {
    return (
      <View style={styles.desktopMinePanel}>
        <View style={styles.mineHeader}>
          <View style={styles.mineHeaderText}>
            <Text style={styles.panelHeading}>
              Mes disponibilités
            </Text>

            <Text style={styles.panelDescription}>
              Indiquez les jours où vous êtes disponible pour ce voyage.
            </Text>
          </View>

          <View style={styles.daysBadge}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.secondary}
            />

            <View>
              <Text style={styles.daysBadgeValue}>
                11 jours renseignés
              </Text>

              <Text style={styles.daysBadgeLabel}>
                sur le mois affiché
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mineWorkspace}>
          <View style={styles.mineCalendarColumn}>
            {calendar}

            <CalendarLegend />

            {!isInitialMonth && (
              <ResetMonthButton onPress={resetMonth} />
            )}
          </View>

          <View style={styles.mineHelpCard}>
            <View style={styles.mineHelpIcon}>
              <Ionicons
                name="finger-print-outline"
                size={26}
                color={colors.primary}
              />
            </View>

            <Text style={styles.mineHelpTitle}>
              Renseignez vos dates
            </Text>

            <Text style={styles.mineHelpDescription}>
              Cliquez plusieurs fois sur une journée pour modifier son état.
            </Text>

            <View style={styles.helpItem}>
              <View
                style={[
                  styles.helpColor,
                  { backgroundColor: '#A7E2C2' },
                ]}
              />
              <View>
                <Text style={styles.helpLabel}>Disponible</Text>
                <Text style={styles.helpDetail}>
                  Vous pouvez participer
                </Text>
              </View>
            </View>

            <View style={styles.helpItem}>
              <View
                style={[
                  styles.helpColor,
                  { backgroundColor: '#16A879' },
                ]}
              />
              <View>
                <Text style={styles.helpLabel}>Partiel</Text>
                <Text style={styles.helpDetail}>
                  Votre présence reste à confirmer
                </Text>
              </View>
            </View>

            <View style={styles.helpItem}>
              <View
                style={[
                  styles.helpColor,
                  { backgroundColor: '#EF5B5B' },
                ]}
              />
              <View>
                <Text style={styles.helpLabel}>Indisponible</Text>
                <Text style={styles.helpDetail}>
                  Vous ne pouvez pas participer
                </Text>
              </View>
            </View>
          </View>
        </View>

        <PrimaryButton
          mode={mode}
          onPress={onPrimaryAction}
        />
      </View>
    );
  }

  if (isDesktop && mode === 'common') {
    return (
      <View style={styles.desktopCommonLayout}>
        <ParticipantsPanel />

        <View style={styles.desktopCenterPanel}>
          <View style={styles.panelHeadingBlock}>
            <Text style={styles.panelHeading}>
              Périodes communes identifiées
            </Text>
            <Text style={styles.panelDescription}>
              Basées sur les disponibilités de tous les participants
            </Text>
          </View>

          {calendar}
          <CalendarLegend />

          {!isInitialMonth && (
            <ResetMonthButton onPress={resetMonth} />
          )}

          <PrimaryButton mode={mode} onPress={onPrimaryAction} />
        </View>

        <View style={styles.desktopSideColumn}>
          <SynthesisPanel hasPeriods={isInitialMonth} />

          <View style={styles.decorativeCard}>
            <View style={styles.decorativeIcon}>
              <Ionicons name="airplane" size={34} color={colors.primary} />
            </View>
            <Text style={styles.decorativeTitle}>Le groupe est prêt</Text>
            <Text style={styles.decorativeText}>
              Les périodes communes permettront de proposer des destinations
              adaptées à tout le monde.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, isDesktop && styles.desktopWrapper]}>
      {calendar}
      <CalendarLegend />

      {!isInitialMonth && <ResetMonthButton onPress={resetMonth} />}

      {mode === 'common' && isInitialMonth && <MobileCommonSummary />}

      <PrimaryButton mode={mode} onPress={onPrimaryAction} />
    </View>
  );
}

function CalendarGrid({
  monthLabel,
  emptyCells,
  daysInMonth,
  isDesktop,
  mode,
  stateForDay,
  dateKeyForDay,
  onDayPress,
  onPreviousMonth,
  onNextMonth,
}: {
  monthLabel: string;
  emptyCells: number;
  daysInMonth: number;
  isDesktop: boolean;
  mode: 'mine' | 'common';
  stateForDay: (day: number) => AvailabilityState | undefined;
  dateKeyForDay: (day: number) => string;
  onDayPress: (day: number) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}) {
  return (
    <View
      style={[
        styles.calendarCard,
        isDesktop && styles.desktopCalendarCard,
      ]}
    >
      <View style={styles.monthHeader}>
        <MonthButton
          icon="chevron-back"
          label="Afficher le mois précédent"
          onPress={onPreviousMonth}
        />

        <Text style={styles.monthTitle}>{monthLabel}</Text>

        <MonthButton
          icon="chevron-forward"
          label="Afficher le mois suivant"
          onPress={onNextMonth}
        />
      </View>

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
          const state = stateForDay(day);

          return (
            <View key={dateKey} style={styles.dayCell}>
              <Pressable
                onPress={() => onDayPress(day)}
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
  );
}

function ParticipantsPanel() {
  return (
    <View style={styles.desktopParticipantsCard}>
      <View style={styles.participantsHeader}>
        <Text style={styles.sideHeading}>Participants</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{PARTICIPANTS.length}</Text>
        </View>
      </View>

      <Text style={styles.sideDescription}>Disponibilités renseignées</Text>

      <View style={styles.participantsList}>
        {PARTICIPANTS.map(participant => (
          <View key={participant.name} style={styles.participantRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: participant.color },
              ]}
            >
              <Text style={styles.avatarText}>{participant.initials}</Text>
            </View>

            <View style={styles.participantIdentity}>
              <Text style={styles.participantName}>
                {participant.name}
                {participant.isCurrentUser ? ' (vous)' : ''}
              </Text>
              <Text style={styles.participantStatus}>Saisie terminée</Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={19}
              color={colors.secondary}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function SynthesisPanel({ hasPeriods }: { hasPeriods: boolean }) {
  return (
    <View style={styles.desktopSynthesisCard}>
      <Text style={styles.sideHeading}>Synthèse</Text>

      <View style={styles.synthesisList}>
        <SynthesisItem
          icon="calendar-outline"
          title={hasPeriods ? '2 périodes communes' : 'Aucune période'}
          detail={hasPeriods ? 'identifiées' : 'sur ce mois'}
        />
        <SynthesisItem
          icon="time-outline"
          title={hasPeriods ? 'Durée idéale' : 'Durée indisponible'}
          detail={hasPeriods ? '5 à 7 jours' : 'Changez de mois'}
        />
        <SynthesisItem
          icon="people-outline"
          title={hasPeriods ? 'Tout le groupe' : 'Aucun résultat'}
          detail={
            hasPeriods
              ? 'peut partir sur ces périodes'
              : 'pour le mois affiché'
          }
        />
      </View>
    </View>
  );
}

function SynthesisItem({
  icon,
  title,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.synthesisItem}>
      <View style={styles.synthesisIcon}>
        <Ionicons name={icon} size={20} color={colors.secondary} />
      </View>
      <View style={styles.synthesisText}>
        <Text style={styles.synthesisTitle}>{title}</Text>
        <Text style={styles.synthesisDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function CalendarLegend() {
  return (
    <View style={styles.legend}>
      <LegendItem color="#A7E2C2" label="Disponible" />
      <LegendItem color="#16A879" label="Partiel" />
      <LegendItem color="#EF5B5B" label="Indisponible" />
    </View>
  );
}

function MobileCommonSummary() {
  return (
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
  );
}

function PrimaryButton({
  mode,
  onPress,
}: {
  mode: 'mine' | 'common';
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>
        {mode === 'mine'
          ? 'Enregistrer mes disponibilités'
          : 'Utiliser ces dates pour proposer des destinations'}
      </Text>
      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
    </Pressable>
  );
}

function ResetMonthButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Revenir au mois actuel"
      style={({ pressed }) => [
        styles.resetMonthButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.resetMonthText}>Revenir à aujourd’hui</Text>
    </Pressable>
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
  wrapper: { width: '100%' },
  desktopWrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  desktopCommonLayout: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  desktopParticipantsCard: {
    width: 230,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCenterPanel: {
    flex: 1,
    minWidth: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopSideColumn: { width: 280, gap: spacing.lg },
  desktopSynthesisCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  decorativeCard: {
    flex: 1,
    minHeight: 170,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F7FF',
    borderRadius: radius.lg,
  },
  decorativeIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4EDFF',
    borderRadius: radius.full,
  },
  decorativeTitle: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  decorativeText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
    textAlign: 'center',
  },
  panelHeadingBlock: { marginBottom: spacing.lg },
  panelHeading: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
  },
  panelDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideHeading: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  sideDescription: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.full,
  },
  countBadgeText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  participantsList: { marginTop: spacing.lg, gap: spacing.lg },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  participantIdentity: { flex: 1, minWidth: 0 },
  participantName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  participantStatus: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },
  synthesisList: { marginTop: spacing.lg, gap: spacing.xl },
  synthesisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  synthesisIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECF9F4',
    borderRadius: radius.full,
  },
  synthesisText: { flex: 1 },
  synthesisTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  synthesisDetail: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 17,
  },
  calendarCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCalendarCard: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
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
  weekRow: { marginTop: spacing.lg, flexDirection: 'row' },
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
  desktopDayButton: { width: 54, height: 34 },
  dayText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  availableDay: { backgroundColor: '#CBEFD9' },
  partialDay: { backgroundColor: '#16A879' },
  unavailableDay: { backgroundColor: '#FDE1E1' },
  strongDayText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
  },
  unavailableDayText: { color: colors.error },
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
  legendColor: { width: 13, height: 13, borderRadius: 4 },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
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
  pressed: { 
    opacity: 0.72 
  },
  desktopMinePanel: {
  width: '100%',
  maxWidth: 1050,
  alignSelf: 'center',
  padding: spacing.xl,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.xl,
},

mineHeader: {
  marginBottom: spacing.xxl,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing.xl,
},

mineHeaderText: {
  flex: 1,
  gap: spacing.xs,
},

daysBadge: {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  backgroundColor: '#ECF9F4',
  borderWidth: 1,
  borderColor: '#C7EBDD',
  borderRadius: radius.md,
},

daysBadgeValue: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.semibold,
},

daysBadgeLabel: {
  marginTop: 2,
  color: colors.textSecondary,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.regular,
},

mineWorkspace: {
  marginBottom: spacing.xxl,
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: spacing.xl,
},

mineCalendarColumn: {
  width: 620,
  gap: spacing.lg,
},

mineHelpCard: {
  width: 280,
  padding: spacing.xl,
  backgroundColor: '#F4F7FD',
  borderWidth: 1,
  borderColor: '#DCE6F5',
  borderRadius: radius.lg,
},

mineHelpIcon: {
  width: 48,
  height: 48,
  marginBottom: spacing.lg,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#E4EDFF',
  borderRadius: radius.full,
},

mineHelpTitle: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.md,
  fontFamily: typography.fontFamily.semibold,
},

mineHelpDescription: {
  marginTop: spacing.sm,
  marginBottom: spacing.xl,
  color: colors.textSecondary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.regular,
  lineHeight: 20,
},

helpItem: {
  marginTop: spacing.lg,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
},

helpColor: {
  width: 14,
  height: 14,
  flexShrink: 0,
  borderRadius: radius.sm,
},

helpLabel: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.medium,
},

helpDetail: {
  marginTop: 2,
  color: colors.textMuted,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.regular,
},
});
