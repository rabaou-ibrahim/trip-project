import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  featured?: boolean;
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
  featured = false,
  onPress,
}: DesktopTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(selectedDestination.country)}`
    : 'Destination à définir';

  const displayedCurrentStep =
    currentStep ??
    (selectedDestination ? 'Destination sélectionnée' : 'Destination à définir');

  const hasProgress =
    typeof progress === 'number' && progress >= 0 && progress <= 100;

  const foreground = featured ? '#FFFFFF' : colors.textPrimary;
  const mutedForeground = featured
    ? 'rgba(255, 255, 255, 0.72)'
    : colors.textSecondary;

  return (
    <View style={[styles.frame, featured && styles.featuredFrame]}>
      <View
        style={[
          styles.paperOffset,
          featured && styles.featuredPaperOffset,
        ]}
      />

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir le voyage ${title}`}
        style={({ pressed }) => [
          styles.card,
          featured && styles.featuredCard,
          pressed && styles.cardPressed,
        ]}
      >
        {featured && (
          <View pointerEvents="none" style={styles.featuredDecoration}>
            <View style={styles.decorativeCircleLarge} />
            <View style={styles.decorativeCircleSmall} />
            <View style={styles.flightRoute} />
            <Ionicons
              name="airplane"
              size={32}
              color="rgba(255, 255, 255, 0.14)"
              style={styles.decorativePlane}
            />
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.identity}>
            <View style={[styles.stamp, featured && styles.featuredStamp]}>
              <CountryFlag
                country={selectedDestination?.country ?? null}
                featured={featured}
              />
              {featured && <View style={styles.stampNotch} />}
            </View>

            <View style={styles.heading}>
              {featured && (
                <View style={styles.statusStamp}>
                  <Text style={styles.statusStampText}>À POURSUIVRE</Text>
                </View>
              )}

              <Text
                style={[
                  styles.title,
                  featured && styles.featuredTitle,
                  { color: foreground },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>

              <Text
                style={[styles.destination, { color: mutedForeground }]}
                numberOfLines={1}
              >
                {destinationLabel}
              </Text>
            </View>
          </View>

          <View style={[styles.menuButton, featured && styles.featuredMenuButton]}>
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={featured ? '#FFFFFF' : colors.textMuted}
            />
          </View>
        </View>

        <View style={[styles.metaList, featured && styles.featuredMetaList]}>
          <MetaItem
            icon="calendar-outline"
            text={
              startDate && endDate
                ? formatDateRange(startDate, endDate)
                : 'Dates à définir'
            }
            featured={featured}
          />
          <MetaItem
            icon="people-outline"
            text={`${participantCount} participant${participantCount > 1 ? 's' : ''}`}
            featured={featured}
          />
        </View>

        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text
              style={[
                styles.stepLabel,
                featured && styles.featuredMutedText,
              ]}
            >
              Étape actuelle
            </Text>

            {hasProgress && (
              <Text
                style={[
                  styles.progressPercent,
                  featured && styles.featuredText,
                ]}
              >
                {progress} %
              </Text>
            )}
          </View>

          <View style={styles.stepBottom}>
            <Text
              style={[styles.stepValue, featured && styles.featuredText]}
              numberOfLines={1}
            >
              {displayedCurrentStep}
            </Text>

            {hasProgress && (
              <View
                style={[
                  styles.progressTrack,
                  featured && styles.featuredProgressTrack,
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    featured && styles.featuredProgressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function MetaItem({
  icon,
  text,
  featured,
}: {
  icon: 'calendar-outline' | 'people-outline';
  text: string;
  featured: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <View style={[styles.metaIcon, featured && styles.featuredMetaIcon]}>
        <Ionicons
          name={icon}
          size={15}
          color={featured ? '#FFFFFF' : '#647B98'}
        />
      </View>
      <Text style={[styles.metaText, featured && styles.featuredMetaText]}>
        {text}
      </Text>
    </View>
  );
}

function CountryFlag({
  country,
  featured,
}: {
  country: string | null;
  featured: boolean;
}) {
  const normalized = country?.trim().toLowerCase();
  const containerStyle = [
    styles.flagContainer,
    featured && styles.featuredFlagContainer,
  ];

  if (normalized === 'japan' || normalized === 'japon') {
    return (
      <View style={[containerStyle, styles.japanFlag]}>
        <View style={[styles.japanCircle, featured && styles.featuredJapanCircle]} />
      </View>
    );
  }

  if (normalized === 'portugal') {
    return (
      <View style={containerStyle}>
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
      <View style={containerStyle}>
        <View style={styles.italyFlag}>
          <View style={styles.italyGreen} />
          <View style={styles.italyWhite} />
          <View style={styles.italyRed} />
        </View>
      </View>
    );
  }

  if (normalized === 'thailand' || normalized === 'thaïlande') {
    return (
      <View style={containerStyle}>
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
    <View style={[containerStyle, styles.worldFlag]}>
      <Ionicons name="earth-outline" size={20} color={colors.primary} />
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

function formatDateRange(startDate: string, endDate: string): string {
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
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    flexBasis: 245,
    flexGrow: 1,
    minWidth: 235,
    minHeight: 262,
  },
  featuredFrame: {
    width: '100%',
    flexBasis: '100%',
    minHeight: 270,
  },
  paperOffset: {
    position: 'absolute',
    top: 7,
    right: -5,
    bottom: -7,
    left: 6,
    borderRadius: 20,
    backgroundColor: '#E7D9C5',
    transform: [{ rotate: '0.7deg' }],
  },
  featuredPaperOffset: {
    backgroundColor: '#CDBD9F',
    transform: [{ rotate: '-0.45deg' }],
  },
  card: {
    position: 'relative',
    flex: 1,
    gap: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E4D7C4',
    borderRadius: 20,
    backgroundColor: '#FFFDF8',
  },
  featuredCard: {
    minHeight: 270,
    padding: spacing.xl,
    borderColor: '#173E64',
    borderRadius: 24,
    backgroundColor: colors.brandDark,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  featuredDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  decorativeCircleLarge: {
    position: 'absolute',
    top: -105,
    right: -55,
    width: 250,
    height: 250,
    borderRadius: radius.full,
    backgroundColor: 'rgba(47, 128, 237, 0.15)',
  },
  decorativeCircleSmall: {
    position: 'absolute',
    bottom: -90,
    left: -45,
    width: 190,
    height: 190,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16, 169, 128, 0.08)',
  },
  flightRoute: {
    position: 'absolute',
    top: 92,
    right: 80,
    width: 230,
    borderTopWidth: 1,
    borderColor: 'rgba(132, 176, 223, 0.5)',
    borderStyle: 'dashed',
    transform: [{ rotate: '-8deg' }],
  },
  decorativePlane: {
    position: 'absolute',
    top: 68,
    right: 44,
    transform: [{ rotate: '-14deg' }],
  },
  header: {
    zIndex: 1,
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
  stamp: {
    padding: 3,
    borderWidth: 1,
    borderColor: '#D9C9B1',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F4EADB',
    transform: [{ rotate: '-2deg' }],
  },
  featuredStamp: {
    padding: 5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: '#F7EEDC',
  },
  stampNotch: {
    position: 'absolute',
    right: -4,
    bottom: 6,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brandDark,
  },
  heading: { flex: 1, minWidth: 0 },
  statusStamp: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F5B944',
    borderRadius: 5,
    backgroundColor: 'rgba(245, 185, 68, 0.12)',
    transform: [{ rotate: '-1.5deg' }],
  },
  statusStampText: {
    color: '#FFD77A',
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.displayBold,
  },
  featuredTitle: {
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.65,
  },
  destination: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  menuButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  featuredMenuButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaList: { zIndex: 1, gap: spacing.sm },
  featuredMetaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#F0F4F8',
  },
  featuredMetaIcon: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  featuredMetaText: { color: '#FFFFFF' },
  stepSection: { zIndex: 1, marginTop: 'auto', gap: spacing.sm },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  progressPercent: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  stepBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepValue: {
    width: 120,
    flexShrink: 0,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: '#E7EDF3',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#10A879',
  },
  featuredProgressTrack: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  featuredProgressFill: { backgroundColor: '#70D5AE' },
  featuredText: { color: '#FFFFFF' },
  featuredMutedText: { color: 'rgba(255, 255, 255, 0.62)' },
  flagContainer: {
    position: 'relative',
    width: 44,
    height: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  featuredFlagContainer: { width: 58, height: 46 },
  japanFlag: { alignItems: 'center', justifyContent: 'center' },
  japanCircle: {
    width: 15,
    height: 15,
    borderRadius: radius.full,
    backgroundColor: '#E32636',
  },
  featuredJapanCircle: { width: 20, height: 20 },
  portugalFlag: { position: 'relative', flex: 1, flexDirection: 'row' },
  portugalGreen: { width: '40%', backgroundColor: '#087A42' },
  portugalRed: { flex: 1, backgroundColor: '#D52331' },
  portugalEmblem: {
    position: 'absolute',
    left: '31%',
    top: 9,
    width: 8,
    height: 13,
    borderRadius: radius.full,
    backgroundColor: '#F4C542',
  },
  italyFlag: { flex: 1, flexDirection: 'row' },
  italyGreen: { flex: 1, backgroundColor: '#138B51' },
  italyWhite: { flex: 1, backgroundColor: '#FFFFFF' },
  italyRed: { flex: 1, backgroundColor: '#D72B3F' },
  thailandFlag: { flex: 1 },
  thailandRedStripe: { flex: 1, backgroundColor: '#C92B3B' },
  thailandWhiteStripe: { flex: 1, backgroundColor: '#FFFFFF' },
  thailandBlueStripe: { flex: 2, backgroundColor: '#263A75' },
  worldFlag: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});
