import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ImageBackground,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  currentStep?: string;
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
  currentStep = 'Projet en cours',
  progress,
  onPress,
}: MobileHeroTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(selectedDestination.country)}`
    : 'Destination à définir';

  const hasProgress =
    typeof progress === 'number' && progress >= 0 && progress <= 100;

  const content = (
    <>
      {imageSource ? (
        <>
          <View style={styles.imageOverlay} />
          <View style={styles.imageBottomShade} />
        </>
      ) : (
        <View pointerEvents="none" style={styles.fallbackDecoration}>
          <View style={styles.fallbackGlowLarge} />
          <View style={styles.fallbackGlowSmall} />
          <View style={styles.routeStart} />
          <View style={styles.routeLine} />
          <Ionicons
            name="paper-plane"
            size={40}
            color="rgba(122, 173, 224, 0.44)"
            style={styles.routePlane}
          />
          <View style={styles.passportStamp}>
            <Ionicons
              name="airplane-outline"
              size={32}
              color="rgba(255, 255, 255, 0.12)"
            />
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.statusStamp}>
            <View style={styles.statusDot} />
            <Text style={styles.statusStampText}>EN COURS</Text>
          </View>

          <View style={styles.expandButton}>
            <Ionicons name="expand-outline" size={17} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.information}>
          <View style={styles.identityRow}>
            <View style={styles.flagStamp}>
              <CountryFlag country={selectedDestination?.country ?? null} />
            </View>

            <View style={styles.identity}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.destination} numberOfLines={1}>
                {destinationLabel}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <MetaItem
              icon="calendar-outline"
              text={
                startDate && endDate
                  ? formatDateRange(startDate, endDate)
                  : 'Dates à définir'
              }
            />
            <MetaItem
              icon="people-outline"
              text={`${participantCount} participant${participantCount > 1 ? 's' : ''}`}
            />
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepCopy}>
              <Text style={styles.stepLabel}>Étape actuelle</Text>
              <Text style={styles.stepValue} numberOfLines={1}>
                {currentStep}
              </Text>
            </View>

            {hasProgress && <Text style={styles.progressText}>{progress}%</Text>}
          </View>

          {hasProgress && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.frame}>
      <View style={styles.paperOffset} />

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
          <View style={[styles.background, styles.fallback]}>{content}</View>
        )}
      </Pressable>
    </View>
  );
}

function MetaItem({
  icon,
  text,
}: {
  icon: 'calendar-outline' | 'people-outline';
  text: string;
}) {
  return (
    <View style={styles.metaItem}>
      <View style={styles.metaIcon}>
        <Ionicons name={icon} size={14} color="#FFFFFF" />
      </View>
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function CountryFlag({ country }: { country: string | null }) {
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

  if (normalized === 'thailand' || normalized === 'thaïlande') {
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
    width: '100%',
    height: 326,
  },
  paperOffset: {
    position: 'absolute',
    top: 7,
    right: -4,
    bottom: -7,
    left: 6,
    borderRadius: 24,
    backgroundColor: '#D8C8AF',
    transform: [{ rotate: '0.8deg' }],
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#173E64',
    borderRadius: 24,
    backgroundColor: colors.brandDark,
  },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  background: { width: '100%', height: '100%' },
  backgroundImage: { borderRadius: 24 },
  fallback: { backgroundColor: colors.brandDark },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(2, 12, 27, 0.28)',
  },
  imageBottomShade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '68%',
    backgroundColor: 'rgba(2, 17, 36, 0.72)',
  },
  fallbackDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  fallbackGlowLarge: {
    position: 'absolute',
    top: -92,
    right: -52,
    width: 245,
    height: 245,
    borderRadius: radius.full,
    backgroundColor: 'rgba(47, 128, 237, 0.16)',
  },
  fallbackGlowSmall: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  routeStart: {
    position: 'absolute',
    top: 91,
    left: 36,
    width: 9,
    height: 9,
    borderWidth: 2,
    borderColor: 'rgba(132, 176, 223, 0.62)',
    borderRadius: radius.full,
  },
  routeLine: {
    position: 'absolute',
    top: 94,
    left: 50,
    width: 185,
    borderTopWidth: 1,
    borderColor: 'rgba(132, 176, 223, 0.56)',
    borderStyle: 'dashed',
    transform: [{ rotate: '-13deg' }],
  },
  routePlane: {
    position: 'absolute',
    top: 44,
    right: 42,
    transform: [{ rotate: '-13deg' }],
  },
  passportStamp: {
    position: 'absolute',
    top: 84,
    right: 20,
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.full,
    transform: [{ rotate: '13deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 15,
  },
  topRow: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 185, 68, 0.64)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(4, 24, 44, 0.62)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: '#F5B944',
  },
  statusStampText: {
    color: '#FFE09A',
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  expandButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(3, 19, 39, 0.42)',
  },
  information: {
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    backgroundColor: 'rgba(2, 20, 39, 0.56)',
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flagStamp: {
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
    borderRadius: 11,
    backgroundColor: '#F4EADB',
    transform: [{ rotate: '-2deg' }],
  },
  identity: { flex: 1, minWidth: 0 },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.3,
  },
  destination: {
    marginTop: 3,
    color: 'rgba(255, 255, 255, 0.72)',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  metaText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: typography.fontFamily.medium,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stepCopy: { flex: 1, minWidth: 0 },
  stepLabel: {
    color: 'rgba(255, 255, 255, 0.58)',
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },
  stepValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#70D5AE',
  },
  flagContainer: {
    position: 'relative',
    width: 46,
    height: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  japanFlag: { alignItems: 'center', justifyContent: 'center' },
  japanCircle: {
    width: 17,
    height: 17,
    borderRadius: radius.full,
    backgroundColor: '#E32636',
  },
  portugalFlag: { position: 'relative', flex: 1, flexDirection: 'row' },
  portugalGreen: { width: '40%', backgroundColor: '#087A42' },
  portugalRed: { flex: 1, backgroundColor: '#D52331' },
  portugalEmblem: {
    position: 'absolute',
    left: '31%',
    top: 10,
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
