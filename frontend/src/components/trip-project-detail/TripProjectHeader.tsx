import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type TripProjectHeaderProps = {
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  isDesktop?: boolean;
  onShare?: () => void;
  onMore?: () => void;
};

export function TripProjectHeader({
  title,
  city,
  country,
  startDate,
  endDate,
  participantCount,
  isDesktop = false,
  onShare,
  onMore,
}: TripProjectHeaderProps) {
  return (
    <View style={[styles.container, isDesktop && styles.desktopContainer]}>
      <View style={styles.decorationLarge} />
      <View style={styles.decorationSmall} />
      <Ionicons
        name="airplane"
        size={isDesktop ? 48 : 34}
        color="rgba(255,255,255,0.14)"
        style={styles.airplane}
      />

      <View style={styles.topRow}>
        <View style={styles.heading}>
          <View style={styles.flagBox}>
            <View style={styles.japanCircle} />
          </View>

          <View style={styles.identity}>
            <Text style={[styles.title, isDesktop && styles.desktopTitle]} numberOfLines={1}>
              {title}
            </Text>

            <Text style={styles.destination} numberOfLines={1}>
              {city}, {country}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isDesktop && (
            <Pressable
              onPress={onShare}
              accessibilityRole="button"
              accessibilityLabel="Partager le projet"
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Ionicons name="share-outline" size={17} color={colors.textPrimary} />
              <Text style={styles.actionLabel}>Partager</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onMore}
            accessibilityRole="button"
            accessibilityLabel="Plus d’options"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
          <Text style={styles.metaText}>{formatDateRange(startDate, endDate)}</Text>
        </View>

        <View style={styles.metaDot} />

        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={17} color="#FFFFFF" />
          <Text style={styles.metaText}>
            {participantCount} participant{participantCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const monthYear = end.toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    });

    return `${start.getDate()} – ${end.getDate()} ${monthYear}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 190,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: '#0D3557',
    borderRadius: radius.xl,
  },
  desktopContainer: {
    minHeight: 210,
    padding: spacing.xl,
  },
  decorationLarge: {
    position: 'absolute',
    top: -70,
    right: -35,
    width: 190,
    height: 190,
    borderRadius: radius.full,
    backgroundColor: '#164778',
  },
  decorationSmall: {
    position: 'absolute',
    top: 48,
    left: -45,
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: '#0C4557',
  },
  airplane: {
    position: 'absolute',
    top: 48,
    left: '47%',
    transform: [{ rotate: '-12deg' }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heading: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flagBox: {
    width: 46,
    height: 40,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
  },
  japanCircle: {
    width: 17,
    height: 17,
    borderRadius: radius.full,
    backgroundColor: '#E32636',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  desktopTitle: {
    fontSize: typography.fontSize.xl,
  },
  destination: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.78)',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    height: 38,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.md,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.78,
  },
  metaRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
});