  import Ionicons from '@expo/vector-icons/Ionicons';
  import { useEffect, useMemo, useState } from 'react';
  import {
    Pressable,
    StyleSheet,
    Text,
    View,
  } from 'react-native';

  import { colors, radius, spacing, typography } from '@/theme';

  export type AvailabilityPeriod = {
    id: number;
    startDate: string;
    endDate: string;
  };

  type AvailabilityCalendarProps = {
    mode: 'mine' | 'common';
    isDesktop?: boolean;

    periods?: AvailabilityPeriod[];
    commonPeriods?: AvailabilityPeriod[];
    commonMessage?: string | null;

    loading?: boolean;

    onCreatePeriod?: (
      startDate: string,
      endDate: string,
    ) => void | Promise<void>;

    onUpdatePeriod?: (
      id: number,
      startDate: string,
      endDate: string,
    ) => void | Promise<void>;

    onDeletePeriod?: (id: number) => void | Promise<void>;

    onPrimaryAction?: () => void;
  };

  const WEEKDAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

  export function AvailabilityCalendar({
    mode,
    isDesktop = false,
    periods = [],
    commonPeriods = [],
    commonMessage = null,
    loading = false,
    onCreatePeriod,
    onUpdatePeriod,
    onDeletePeriod,
    onPrimaryAction,
  }: AvailabilityCalendarProps) {
    const [displayedMonth, setDisplayedMonth] = useState(() => {
      const firstPeriod = periods[0];

      if (firstPeriod) {
        const [year, month] = firstPeriod.startDate.split('-').map(Number);
        return new Date(year, month - 1, 1);
      }

      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [selectionStart, setSelectionStart] = useState<string | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

    const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
      if (periods.length === 0) {
        return;
      }

      const [year, month] = periods[0].startDate.split('-').map(Number);

      setDisplayedMonth(current => {
        if (
          current.getFullYear() === year &&
          current.getMonth() === month - 1
        ) {
          return current;
        }

        return new Date(year, month - 1, 1);
      });
    }, [periods]);

    const year = displayedMonth.getFullYear();
    const monthIndex = displayedMonth.getMonth();

    const daysInMonth = new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate();

    const emptyCells =
      (new Date(year, monthIndex, 1).getDay() + 6) % 7;

    const monthLabel = useMemo(() => {
      const label = displayedMonth.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      });

      return label.charAt(0).toUpperCase() + label.slice(1);
    }, [displayedMonth]);

    const visiblePeriods =
      mode === 'mine' ? periods : commonPeriods;

    const dateKeyForDay = (day: number) =>
      `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;

    const isDayAvailable = (day: number) => {
      const date = dateKeyForDay(day);

      return visiblePeriods.some(
        period =>
          date >= period.startDate &&
          date <= period.endDate,
      );
    };

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

    const isSelectedDay = (day: number) => {
      const date = dateKeyForDay(day);

      if (!selectionStart) {
        return false;
      }

      if (!selectionEnd) {
        return date === selectionStart;
      }

      return date >= selectionStart && date <= selectionEnd;
    };

    const isSelectionStart = (day: number) =>
    dateKeyForDay(day) === selectionStart;

    const isSelectionEnd = (day: number) =>
      dateKeyForDay(day) === selectionEnd;

    const handleDelete = async (periodId: number) => {
      try {
        await onDeletePeriod?.(periodId);
      } catch (error) {
        console.error(
          'Impossible de supprimer la disponibilité :',
          error,
        );
      }
    };

    const handleDayPress = (day: number) => {
      if (mode === 'common') {
        return;
      }

      const date = dateKeyForDay(day);

      // Premier clic : nouvelle date de début
      if (!selectionStart || selectionEnd) {
        setSelectionStart(date);
        setSelectionEnd(null);
        return;
      }

      // Deuxième clic : date de fin
      if (date <= selectionStart) {
        setSelectionStart(date);
        setSelectionEnd(null);
        return;
      }

      setSelectionEnd(date);
    };

    const handleSaveSelectedPeriod = async () => {
      if (!selectionStart || !selectionEnd || saving) {
        return;
      }

      try {
        setSaving(true);
        setSaveError(null);

        if (editingPeriodId !== null) {
          await onUpdatePeriod?.(
            editingPeriodId,
            selectionStart,
            selectionEnd,
          );
        } else {
          await onCreatePeriod?.(
            selectionStart,
            selectionEnd,
          );
        }

        setSelectionStart(null);
        setSelectionEnd(null);
        setEditingPeriodId(null);
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Impossible d’enregistrer cette période.',
        );
        setSelectionStart(null);
        setSelectionEnd(null);
        setEditingPeriodId(null);
      } finally {
        setSaving(false);
      }
    };

    const handleAddSelectedPeriod = async () => {
      if (!selectionStart || !selectionEnd) {
        return;
      }

      await onCreatePeriod?.(
        selectionStart,
        selectionEnd,
      );

      setSelectionStart(null);
      setSelectionEnd(null);
    };

    return (
      <View
        style={[
          styles.wrapper,
          isDesktop && styles.desktopWrapper,
        ]}
      >
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable
              onPress={() => changeMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Mois précédent"
              style={({ pressed }) => [
                styles.monthButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={17}
                color={colors.textSecondary}
              />
            </Pressable>

            <Text style={styles.monthTitle}>{monthLabel}</Text>

            <Pressable
              onPress={() => changeMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Mois suivant"
              style={({ pressed }) => [
                styles.monthButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={17}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
    {WEEKDAYS.map(day => (
      <Text key={day} style={styles.weekday}>
        {day}
      </Text>
    ))}
  </View>

  <View style={styles.daysGrid}>
    {Array.from({ length: emptyCells }).map((_, index) => (
      <View
        key={`empty-${index}`}
        style={styles.dayCell}
      />
    ))}

    {Array.from({ length: daysInMonth }).map((_, index) => {
      const day = index + 1;
      const available = isDayAvailable(day);
      const selected = isSelectedDay(day);

      return (
        <View
          key={dateKeyForDay(day)}
          style={styles.dayCell}
        >
          <Pressable
            onPress={() => handleDayPress(day)}
            disabled={mode === 'common'}
            accessibilityRole="button"
            accessibilityLabel={`${day} ${monthLabel}`}
            style={({ pressed }) => [
            styles.day,
            available && styles.availableDay,

            selected && styles.selectedDay,
            isSelectionStart(day) && styles.selectedStartDay,
            isSelectionEnd(day) && styles.selectedEndDay,

            pressed && mode === 'mine' && styles.pressed,
          ]}
          >
            <Text
              style={[
                styles.dayText,
                available && styles.availableDayText,
                selected && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
                <LegendItem
                  color="#9DDFC0"
                  label={
                    mode === 'mine'
                      ? 'Disponible'
                      : 'Période commune'
                  }
                />
              </View>
            </View>

            {editingPeriodId !== null && (
              <Pressable
                onPress={() => {
                  setEditingPeriodId(null);
                  setSelectionStart(null);
                  setSelectionEnd(null);
                  setSaveError(null);
                }}
                style={({ pressed }) => [
                  styles.cancelEditButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelEditText}>
                  Annuler la modification
                </Text>
              </Pressable>
            )}

            {mode === 'mine' ? (
              <View style={styles.periodsSection}>
                
                <Text style={styles.sectionTitle}>
                  Mes périodes
                </Text>

                {loading ? (
                  <Text style={styles.emptyText}>
                    Chargement…
                  </Text>
                ) : periods.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      Aucune période renseignée.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.periodsList}>
                    {periods.map(period => (
                      <PeriodRow
                          key={period.id}
                          period={period}
                          onEdit={() => {
                            setEditingPeriodId(period.id);

                            // On montre la période actuelle,
                            // mais la prochaine interaction recommence sa sélection.
                            setSelectionStart(null);
                            setSelectionEnd(null);

                            const [year, month] = period.startDate
                              .split('-')
                              .map(Number);

                            setDisplayedMonth(
                              new Date(year, month - 1, 1),
                            );
                          }}
                          onDelete={() =>
                            void handleDelete(period.id)
                          }
                        />
                    ))}
                    {saveError && (
                      <Text style={styles.errorText}>
                        {saveError}
                      </Text>
                    )}
                  </View>
                )}

                <Pressable
                  onPress={() => void handleSaveSelectedPeriod()}
                  disabled={!selectionStart || !selectionEnd || saving}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.addButton,
                    (!selectionStart || !selectionEnd || saving) &&
                      styles.addButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={editingPeriodId !== null ? 'checkmark' : 'add'}
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.addButtonText}>
                    {saving
                      ? 'Enregistrement…'
                      : editingPeriodId !== null &&
                          selectionStart &&
                          selectionEnd
                        ? `Modifier du ${formatShortDate(selectionStart)} au ${formatShortDate(selectionEnd)}`
                        : selectionStart && selectionEnd
                          ? `Ajouter du ${formatShortDate(selectionStart)} au ${formatShortDate(selectionEnd)}`
                          : 'Sélectionnez une période'}
                  </Text>
                </Pressable>
          </View>
        ) : (
          <View style={styles.commonSection}>
            <Text style={styles.sectionTitle}>
              Périodes communes
            </Text>

            {commonPeriods.length === 0 ? (
              <Text style={styles.emptyText}>
                {commonMessage ?? 'Aucune période commune identifiée.'}
              </Text>
            ) : (
              <View style={styles.periodsList}>
                {commonPeriods.map((period, index) => (
                  <View
                    key={`${period.startDate}-${period.endDate}-${index}`}
                    style={styles.periodRow}
                  >
                    <Text style={styles.periodText}>
                      {formatPeriod(period)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {commonPeriods.length > 0 && (
              <Pressable
                onPress={onPrimaryAction}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Proposer des destinations
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  }

  function PeriodRow({
    period,
    onEdit,
    onDelete,
  }: {
    period: AvailabilityPeriod;
    onEdit: () => void;
    onDelete: () => void;
  }) {
    return (
      <View style={styles.periodRow}>
        <Text style={styles.periodText}>
          {formatPeriod(period)}
        </Text>

        <View style={styles.periodActions}>
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Modifier la période"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="pencil-outline"
              size={17}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Supprimer la période"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    );
  }

  function LegendItem({
    color,
    label,
  }: {
    color: string;
    label: string;
  }) {
    return (
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendColor,
            { backgroundColor: color },
          ]}
        />
        <Text style={styles.legendLabel}>{label}</Text>
      </View>
    );
  }

  function formatShortDate(value: string) {
    const date = parseDate(value);

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  function formatPeriod(period: AvailabilityPeriod) {
    const start = parseDate(period.startDate);
    const end = parseDate(period.endDate);

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      const month = end.toLocaleDateString('fr-FR', {
        month: 'long',
      });

      return `${start.getDate()} – ${end.getDate()} ${month} ${end.getFullYear()}`;
    }

    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  function parseDate(value: string) {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const styles = StyleSheet.create({
    wrapper: {
      width: '100%',
    },

    desktopWrapper: {
      width: '100%',
      maxWidth: 820,
      alignSelf: 'center',
    },

    calendarCard: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },

    monthHeader: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    monthButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
    },

    monthTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: typography.fontFamily.semibold,
    },

    weekRow: {
      marginTop: spacing.lg,
      flexDirection: 'row',
    },

    weekday: {
      width: '14.2857%',
      color: colors.textMuted,
      fontSize: 10,
      fontFamily: typography.fontFamily.semibold,
      textAlign: 'center',
    },

    daysGrid: {
      marginTop: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    dayCell: {
    width: '14.2857%',
    height: 48,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  day: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDay: {
    backgroundColor: '#16A879',
    borderRadius: 0,
  },

  selectedStartDay: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  selectedEndDay: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

    dayText: {
      color: colors.textPrimary,
      fontSize: 13,
      fontFamily: typography.fontFamily.medium,
    },

    availableDay: {
      backgroundColor: '#BFEAD2',
    },

    availableDayText: {
      color: '#146B50',
      fontFamily: typography.fontFamily.semibold,
    },

    selectedDayText: {
      color: '#FFFFFF',
      fontFamily: typography.fontFamily.semibold,
    },

    legend: {
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    legendColor: {
      width: 10,
      height: 10,
      borderRadius: 3,
    },

    legendLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontFamily: typography.fontFamily.regular,
    },

    periodsSection: {
      marginTop: spacing.lg,
    },

    commonSection: {
      marginTop: spacing.lg,
    },

    addButtonDisabled: {
      opacity: 0.45,
    },

    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: typography.fontFamily.semibold,
    },

    periodsList: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },

    periodRow: {
      minHeight: 46,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
    },

    cancelEditButton: {
      alignSelf: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },

    cancelEditText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: typography.fontFamily.medium,
    },

    periodText: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 12,
      fontFamily: typography.fontFamily.semibold,
    },

    periodActions: {
      flexDirection: 'row',
      gap: 4,
    },

    iconButton: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
    },

    emptyCard: {
      marginTop: spacing.md,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },

    emptyText: {
      marginTop: spacing.md,
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: typography.fontFamily.regular,
    },

    addButton: {
      minHeight: 48,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.full,
    },

    addButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontFamily: typography.fontFamily.semibold,
    },

    primaryButton: {
      minHeight: 48,
      marginTop: spacing.lg,
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
      fontSize: 12,
      fontFamily: typography.fontFamily.semibold,
    },

    overlay: {
      flex: 1,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(30, 41, 59, 0.38)',
    },

    modalCard: {
      width: '100%',
      maxWidth: 440,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderRadius: 22,
    },

    modalHeader: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    modalTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      fontFamily: typography.fontFamily.semibold,
    },

    closeButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
    },

    form: {
      padding: spacing.lg,
      gap: spacing.md,
    },

    errorText: {
      color: colors.error,
      fontSize: 11,
      fontFamily: typography.fontFamily.medium,
    },

    saveButton: {
      minHeight: 48,
      marginTop: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontFamily: typography.fontFamily.semibold,
    },

    pressed: {
      opacity: 0.72,
    },
  });