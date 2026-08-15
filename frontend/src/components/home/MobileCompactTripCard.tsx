import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type SelectedDestination = {
  id: number;
  city: string;
  country: string;
};

type MobileCompactTripCardProps = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  selectedDestination: SelectedDestination | null;
  participantCount: number;
  onPress: () => void;
};

export function MobileCompactTripCard({
  title,
  startDate,
  endDate,
  selectedDestination,
  participantCount,
  onPress,
}: MobileCompactTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(selectedDestination.country)}`
    : 'Destination à définir';

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
        <View style={styles.flagStamp}>
          <CountryFlag country={selectedDestination?.country ?? null} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.destination} numberOfLines={1}>
            {destinationLabel}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color="#56718E" />
              <Text style={styles.metaText} numberOfLines={1}>
                {startDate && endDate
                  ? formatDateRange(startDate, endDate)
                  : 'Dates à définir'}
              </Text>
            </View>

            <View style={styles.metaDot} />

            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color="#56718E" />
              <Text style={styles.metaText} numberOfLines={1}>
                {participantCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </Pressable>
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
      <Ionicons name="earth-outline" size={18} color={colors.primary} />
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
    minHeight: 104,
  },
  paperOffset: {
    position: 'absolute',
    top: 5,
    right: -3,
    bottom: -5,
    left: 4,
    borderRadius: 18,
    backgroundColor: '#DED0BA',
    transform: [{ rotate: '0.6deg' }],
  },
  card: {
    minHeight: 104,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E3D8C8',
    borderRadius: 18,
    backgroundColor: '#FFFDF8',
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  flagStamp: {
    padding: 3,
    borderWidth: 1,
    borderColor: '#D8C5A8',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F4EADB',
    transform: [{ rotate: '-2deg' }],
  },
  content: { flex: 1, minWidth: 0 },
  title: {
    color: colors.brandDark,
    fontSize: 14,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.15,
  },
  destination: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
  },
  metaRow: {
    minWidth: 0,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    minWidth: 0,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flexShrink: 1,
    color: '#56718E',
    fontSize: 10.5,
    fontFamily: typography.fontFamily.medium,
  },
  metaDot: {
    width: 3,
    height: 3,
    flexShrink: 0,
    borderRadius: radius.full,
    backgroundColor: '#B09A78',
  },
  chevronContainer: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E4F0',
    borderRadius: radius.full,
    backgroundColor: '#F2F7FC',
  },
  flagContainer: {
    position: 'relative',
    width: 42,
    height: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DFE7F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  japanFlag: { alignItems: 'center', justifyContent: 'center' },
  japanCircle: {
    width: 15,
    height: 15,
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
