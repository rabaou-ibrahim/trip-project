import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type SelectedDestination = {
  id: number;
  city: string;
  country: string;
};

type MobileHeroTripCardProps = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  selectedDestination: SelectedDestination | null;
  participantCount: number;

  imageSource?: ImageSourcePropType;
  progress?: number;

  onPress: () => void;
};

export function MobileHeroTripCard({
  title,
  startDate,
  endDate,
  selectedDestination,
  participantCount,
  imageSource,
  progress,
  onPress,
}: MobileHeroTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(
        selectedDestination.country,
      )}`
    : 'Destination à définir';

  const hasProgress =
    typeof progress === 'number' &&
    progress >= 0 &&
    progress <= 100;

  const content = (
    <>
      {imageSource ? (
        <>
          <View style={styles.imageOverlay} />
          <View style={styles.imageBottomShade} />
        </>
      ) : (
        <View style={styles.fallbackDecoration}>
          <View style={styles.fallbackGlowLarge} />
          <View style={styles.fallbackGlowSmall} />
          <Ionicons
            name="airplane"
            size={40}
            color="rgba(255, 255, 255, 0.13)"
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View />

          <View style={styles.expandButton}>
            <Ionicons
              name="expand-outline"
              size={17}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.information}>
          <View style={styles.identityRow}>
            <CountryFlag
              country={selectedDestination?.country ?? null}
            />

            <View style={styles.identity}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>

              <Text
                style={styles.destination}
                numberOfLines={1}
              >
                {destinationLabel}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.metaText} numberOfLines={1}>
                {startDate && endDate
                  ? formatDateRange(startDate, endDate)
                  : 'Dates à définir'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.metaText} numberOfLines={1}>
                {participantCount} participant
                {participantCount > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {hasProgress && (
            <View style={styles.progressRow}>
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

              <Text style={styles.progressText}>
                {progress}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

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
      {imageSource ? (
        <ImageBackground
          source={imageSource}
          resizeMode="cover"
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.background, styles.fallback]}>
          {content}
        </View>
      )}
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
    width: '100%',
    height: 296,
    overflow: 'hidden',

    backgroundColor: '#0A2543',
    borderRadius: radius.xl,

    borderWidth: 1,
    borderColor: 'rgba(15, 50, 82, 0.18)',
  },

  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },

  background: {
    width: '100%',
    height: '100%',
  },

  backgroundImage: {
    borderRadius: radius.xl,
  },

  fallback: {
    backgroundColor: '#092844',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(2, 12, 27, 0.18)',
  },

  imageBottomShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '55%',
    backgroundColor: 'rgba(2, 17, 36, 0.68)',
  },

  fallbackDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 106,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  fallbackGlowLarge: {
    position: 'absolute',
    top: -72,
    right: -35,
    width: 210,
    height: 210,
    borderRadius: radius.full,
    backgroundColor: 'rgba(37, 99, 235, 0.16)',
  },

  fallbackGlowSmall: {
    position: 'absolute',
    bottom: -65,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },

  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  expandButton: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(3, 19, 39, 0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: radius.full,
  },

  information: {
    gap: 14,
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  identity: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: typography.fontFamily.semibold,
  },

  destination: {
    marginTop: spacing.xs,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  metaItem: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  metaIcon: {
    width: 27,
    height: 27,
    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.full,
  },

  metaText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: typography.fontFamily.medium,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  progressTrack: {
    flex: 1,
    height: 6,
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
  },

  progressText: {
    width: 34,
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    textAlign: 'right',
  },

  flagContainer: {
    position: 'relative',
    width: 48,
    height: 44,
    flexShrink: 0,
    overflow: 'hidden',

    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.md,
  },

  japanFlag: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  japanCircle: {
    width: 18,
    height: 18,
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
    left: '31%',
    top: 10,
    width: 8,
    height: 13,
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
});