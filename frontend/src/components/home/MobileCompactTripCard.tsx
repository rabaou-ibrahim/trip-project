import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, typography } from '@/theme';

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
      <CountryFlag country={selectedDestination?.country ?? null} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            {startDate && endDate
              ? formatDateRange(startDate, endDate)
              : 'Dates à définir'}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.metaText} numberOfLines={1}>
            {participantCount} participant
            {participantCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons
          name="chevron-forward"
          size={17}
          color="#8295AC"
        />
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
  card: {
    width: '100%',
    minHeight: 84,
    paddingHorizontal: 13,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: radius.lg,

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  content: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: -0.1,
  },

  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  metaText: {
    flexShrink: 1,
    color: colors.textSecondary,
    fontSize: 11.5,
    fontFamily: typography.fontFamily.regular,
  },

  separator: {
    width: 3,
    height: 3,
    flexShrink: 0,
    backgroundColor: '#A5B3C3',
    borderRadius: radius.full,
  },

  chevronContainer: {
    width: 22,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  flagContainer: {
    position: 'relative',
    width: 42,
    height: 36,
    flexShrink: 0,
    overflow: 'hidden',

    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE7F0',
    borderRadius: 9,
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
});