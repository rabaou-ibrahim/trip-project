import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { colors, radius, spacing, typography } from '@/theme';

type SelectedDestination = {
  id: number;
  city: string;
  country: string;
};

type DesktopTripCardProps = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  selectedDestination: SelectedDestination | null;
  participantCount: number;

  currentStep?: string;
  progress?: number;

  onPress: () => void;
};

export function DesktopTripCard({
  title,
  startDate,
  endDate,
  selectedDestination,
  participantCount,
  currentStep,
  progress,
  onPress,
}: DesktopTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(
        selectedDestination.country,
      )}`
    : 'Destination à définir';

  const displayedCurrentStep =
    currentStep ??
    (selectedDestination
      ? 'Destination sélectionnée'
      : 'Destination à définir');

  const hasProgress =
    typeof progress === 'number' &&
    progress >= 0 &&
    progress <= 100;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir le voyage ${title}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.identity}>
          <CountryFlag
            country={selectedDestination?.country ?? null}
          />

          <View style={styles.heading}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <Text style={styles.destination} numberOfLines={1}>
              {destinationLabel}
            </Text>
          </View>
        </View>

        <View style={styles.menuButton}>
          <SymbolView
            name={{
              ios: 'ellipsis',
              android: 'more_horiz',
              web: 'more_horiz',
            }}
            size={18}
            tintColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.metaList}>
        <View style={styles.metaItem}>
          <View style={styles.metaIcon}>
            <SymbolView
              name={{
                ios: 'calendar',
                android: 'calendar_today',
                web: 'calendar_today',
              }}
              size={15}
              tintColor="#647B98"
            />
          </View>

          <Text style={styles.metaText}>
            {startDate && endDate
              ? formatDateRange(startDate, endDate)
              : 'Dates à définir'}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <View style={styles.metaIcon}>
            <SymbolView
              name={{
                ios: 'person.2.fill',
                android: 'group',
                web: 'group',
              }}
              size={15}
              tintColor="#647B98"
            />
          </View>

          <Text style={styles.metaText}>
            {participantCount} participant
            {participantCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.stepSection}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepLabel}>Étape actuelle</Text>

          {hasProgress && (
            <Text style={styles.progressPercent}>
              {progress} %
            </Text>
          )}
        </View>

        <View style={styles.stepBottom}>
          <Text style={styles.stepValue} numberOfLines={1}>
            {displayedCurrentStep}
          </Text>

          {hasProgress && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

type CountryFlagProps = {
  country: string | null;
};

function CountryFlag({ country }: CountryFlagProps) {
  const normalized = country?.trim().toLowerCase();

  if (normalized === 'japan' || normalized === 'japon') {
    return (
      <View style={[styles.flagContainer, styles.japanFlag]}>
        <View style={styles.japanCircle} />
      </View>
    );
  }

  if (normalized === 'portugal') {
    return (
      <View style={styles.flagContainer}>
        <View style={styles.portugalFlag}>
          <View style={styles.portugalGreen} />
          <View style={styles.portugalRed} />
          <View style={styles.portugalEmblem} />
        </View>
      </View>
    );
  }

  if (normalized === 'italy' || normalized === 'italie') {
    return (
      <View style={styles.flagContainer}>
        <View style={styles.italyFlag}>
          <View style={styles.italyGreen} />
          <View style={styles.italyWhite} />
          <View style={styles.italyRed} />
        </View>
      </View>
    );
  }

  if (
    normalized === 'thailand' ||
    normalized === 'thaïlande'
  ) {
    return (
      <View style={styles.flagContainer}>
        <View style={styles.thailandFlag}>
          <View style={styles.thailandRedStripe} />
          <View style={styles.thailandWhiteStripe} />
          <View style={styles.thailandBlueStripe} />
          <View style={styles.thailandWhiteStripe} />
          <View style={styles.thailandRedStripe} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flagContainer, styles.worldFlag]}>
      <Text style={styles.worldIcon}>🌍</Text>
    </View>
  );
}

function translateCountry(country: string): string {
  const translations: Record<string, string> = {
    Japan: 'Japon',
    Italy: 'Italie',
    Spain: 'Espagne',
    Germany: 'Allemagne',
    Greece: 'Grèce',
    Morocco: 'Maroc',
    Thailand: 'Thaïlande',
  };

  return translations[country] ?? country;
}

function formatDateRange(
  startDate: string,
  endDate: string,
): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const monthYear = end.toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    });

    return `${start.getDate()} – ${end.getDate()} ${monthYear}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'fr-FR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '49%',

    minHeight: 226,
    padding: spacing.lg,
    gap: spacing.lg,

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    borderRadius: radius.lg,

    shadowColor: '#234263',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  heading: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  destination: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },

  menuButton: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },

  flagContainer: {
    position: 'relative',
    width: 44,
    height: 34,
    flexShrink: 0,
    overflow: 'hidden',

    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    borderRadius: 8,

    shadowColor: '#17345A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  japanFlag: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  japanCircle: {
    width: 15,
    height: 15,
    backgroundColor: '#E32636',
    borderRadius: radius.full,
  },

  portugalFlag: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
  },

  portugalGreen: {
    width: '40%',
    backgroundColor: '#087A42',
  },

  portugalRed: {
    flex: 1,
    backgroundColor: '#D52331',
  },

  portugalEmblem: {
    position: 'absolute',
    left: '32%',
    top: 10,
    width: 8,
    height: 12,
    backgroundColor: '#F4C542',
    borderRadius: radius.full,
  },

  italyFlag: {
    flex: 1,
    flexDirection: 'row',
  },

  italyGreen: {
    flex: 1,
    backgroundColor: '#138B51',
  },

  italyWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  italyRed: {
    flex: 1,
    backgroundColor: '#D72B3F',
  },

  thailandFlag: {
    flex: 1,
  },

  thailandRedStripe: {
    flex: 1,
    backgroundColor: '#C92B3B',
  },

  thailandWhiteStripe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  thailandBlueStripe: {
    flex: 2,
    backgroundColor: '#263A75',
  },

  worldFlag: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  worldIcon: {
    fontSize: 18,
  },

  metaList: {
    gap: spacing.sm,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  metaIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F0F4F8',
    borderRadius: radius.full,
  },

  metaText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  stepSection: {
    marginTop: 'auto',
    gap: spacing.sm,
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  stepLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  progressPercent: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  stepBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  stepValue: {
    width: 120,
    flexShrink: 0,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    overflow: 'hidden',
    backgroundColor: '#E7EDF3',
    borderRadius: radius.full,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#10A879',
    borderRadius: radius.full,
  },
});