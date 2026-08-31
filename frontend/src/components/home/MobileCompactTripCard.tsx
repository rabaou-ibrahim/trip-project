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
  participantsPreview: {
    id: number;
    userId: number;
    firstname: string;
    username: string;
    avatar: string | null;
  } [];
  status: string;
  onPress: () => void;
  isDesktop?: boolean;
};

export function MobileCompactTripCard({
  title,
  startDate,
  endDate,
  selectedDestination,
  participantCount,
  participantsPreview,
  status,
  onPress,
  isDesktop = false,
}: MobileCompactTripCardProps) {
  const destinationLabel = selectedDestination
    ? `${selectedDestination.city}, ${translateCountry(selectedDestination.country)}`
    : 'Destination à définir';

  const progress = getProjectProgress(status);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir le voyage ${title}`}
      style={({ pressed }) => [
          styles.card,
          isDesktop && styles.desktopCard,
          pressed && styles.cardPressed,
        ]}
      >
      <View style={[styles.thumbnail, isDesktop && styles.desktopThumbnail]}>
        {selectedDestination ? (
          <CountryFlag country={selectedDestination.country} isDesktop={isDesktop} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons
              name="image-outline"
              size={22}
              color={colors.textMuted}
            />
          </View>
        )}
      </View>

      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text
              style={[styles.title, isDesktop && styles.desktopTitle]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text
              style={[styles.destination, isDesktop && styles.desktopDestination]}
              numberOfLines={1}
            >
              {destinationLabel}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.textMuted}
          />
        </View>

        <View
          style={[
            styles.dateRow,
            isDesktop && styles.desktopDateRow,
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={13}
            color={colors.textSecondary}
          />

          <Text style={[styles.dateText, isDesktop && styles.desktopDateText]}>
            {startDate && endDate
              ? formatDateRange(startDate, endDate)
              : 'Dates à définir'}
          </Text>
        </View>

        <View
          style={[
            styles.footer,
            isDesktop && styles.desktopFooter,
          ]}
        >
          <View style={styles.avatarGroup}>
            {participantsPreview.slice(0, 4).map((participant, index) => (
              <ParticipantAvatar
                key={participant.id}
                participant={participant}
                index={index}
              />
            ))}

            {participantCount > 4 && (
              <View style={[styles.avatar, styles.extraAvatar]}>
                <Text style={styles.extraAvatarText}>
                  +{participantCount - 4}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.progressArea, isDesktop && styles.desktopProgressArea, ]}
>
            <Text style={styles.progressLabel}>
              {formatProgressLabel(status)}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ParticipantAvatar({
  participant,
  index,
}: {
  participant: {
    firstname: string;
    username: string;
    avatar: string | null;
  };
  index: number;
}) {
  const initial =
    participant.firstname?.trim().charAt(0).toUpperCase() ||
    participant.username?.trim().charAt(0).toUpperCase() ||
    '?';

  return (
    <View
      style={[
        styles.avatar,
        index > 0 && styles.overlappingAvatar,
      ]}
    >
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function CountryFlag({ country, isDesktop = false, }: { country: string | null; isDesktop?: boolean; }) {
  const normalized = country?.trim().toLowerCase();

  if (normalized === 'japan' || normalized === 'japon') {
    return (
      <View
        style={[
          styles.flagContainer,
          isDesktop && styles.desktopFlagContainer,
        ]}
      >
        <View style={styles.japanCircle} />
      </View>
    );
  }

  if (normalized === 'portugal') {
    return (
      <View style={[ styles.flagContainer, isDesktop && styles.desktopFlagContainer, ]}
>
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
      <View style={[ styles.flagContainer, isDesktop && styles.desktopFlagContainer, ]}>
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
      <View style={[ styles.flagContainer, isDesktop && styles.desktopFlagContainer, ]}
>
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
    <View
      style={[
        styles.flagContainer,
        isDesktop && styles.desktopFlagContainer,
      ]}
    >
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

function getProjectProgress(status: string): number {
  switch (status.trim().toLowerCase()) {
    case 'completed':
      return 100;
    case 'ready':
      return 85;
    case 'active':
    case 'in_progress':
      return 60;
    case 'draft':
    default:
      return 25;
  }
}

function formatProgressLabel(status: string): string {
  switch (status.trim().toLowerCase()) {
    case 'completed':
      return 'Terminé';
    case 'ready':
      return 'Presque prêt';
    case 'active':
    case 'in_progress':
      return 'En préparation';
    case 'draft':
    default:
      return 'En préparation';
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 132,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  desktopCard: {
    minHeight: 190,
    borderRadius: 18,
  },

  desktopThumbnail: {
    width: 180,
    minHeight: 190,
    padding: 14,
  },

  desktopContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  desktopTitle: {
    fontSize: 23,
    lineHeight: 29,
  },

  desktopDestination: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
  },

  desktopDateText: {
    fontSize: 14,
  },

  desktopProgressArea: {
    maxWidth: 220,
  },

  thumbnail: {
    width: 82,
    minHeight: 132,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8FC',
  },

  desktopFooter: {
    marginTop: 18,
  },

  desktopDateRow: {
    marginTop: 13,
  },

  content: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  title: {
    color: '#1A1C23',
    fontSize: 15,
    lineHeight: 19,
    fontFamily: typography.fontFamily.displayBold,
  },

  destination: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
  },

  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },

  placeholderThumbnail: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FA',
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  headingCopy: {
    flex: 1,
    minWidth: 0,
  },

  dateRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    color: '#475569',
    fontSize: 10.5,
    fontFamily: typography.fontFamily.medium,
  },

  footer: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: radius.full,
    backgroundColor: '#DCEBFA',

    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  overlappingAvatar: {
    marginLeft: -8,
  },

  avatarText: {
    color: colors.primary,
    fontSize: 9.5,
    fontFamily: typography.fontFamily.bold,
  },

  extraAvatar: {
    marginLeft: -7,
    backgroundColor: '#F0F4F8',
  },

  extraAvatarText: {
    color: colors.textSecondary,
    fontSize: 8.5,
    fontFamily: typography.fontFamily.semibold,
  },

  progressArea: {
    flex: 1,
    maxWidth: 105,
  },

  progressLabel: {
    marginBottom: 4,
    color: '#64748B',
    fontSize: 9,
    textAlign: 'right',
    fontFamily: typography.fontFamily.medium,
  },

  progressTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: '#E8EEF5',
  },

  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#00BFA6',
  },

  desktopFlagContainer: {
    width: 72,
    height: 98,
  },

  flagContainer: {
    position: 'relative',
    width: 54,
    height: 76,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECF3',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  japanFlag: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  japanCircle: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: '#E32636',
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
    top: 28,
    width: 8,
    height: 13,
    borderRadius: radius.full,
    backgroundColor: '#F4C542',
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
    backgroundColor: '#F2F6FA',
  },
});
