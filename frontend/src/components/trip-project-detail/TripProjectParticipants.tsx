import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Participant = {
  id: number;
  firstName: string;
  lastName?: string;
  role: string;
  isCurrentUser?: boolean;
};

type TripProjectParticipantsProps = {
  participants: Participant[];
  isDesktop?: boolean;
  onViewAll: () => void;
};

const AVATAR_COLORS = ['#DCEAFE', '#DCFCE7', '#FEE2E2', '#FEF3C7', '#EDE9FE'];

export function TripProjectParticipants({
  participants,
  isDesktop = false,
  onViewAll,
}: TripProjectParticipantsProps) {
  const displayedParticipants = isDesktop
    ? participants.slice(0, 5)
    : participants.slice(0, 4);

  return (
    <View style={[styles.card, isDesktop && styles.desktopCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Participants ({participants.length})
        </Text>

        {isDesktop && (
        <Pressable
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel="Voir tous les participants"
            style={({ pressed }) => pressed && styles.pressed}
        >
            <Text style={styles.viewAll}>Voir tout</Text>
        </Pressable>
        )}
      </View>

      <View style={styles.list}>
        {displayedParticipants.map((participant, index) => (
          <View key={participant.id} style={styles.participantRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
              ]}
            >
              <Text style={styles.initials}>
                {getInitials(participant.firstName, participant.lastName)}
              </Text>
            </View>

            <View style={styles.identity}>
              <Text style={styles.name} numberOfLines={1}>
                {participant.firstName}
                {participant.lastName ? ` ${participant.lastName}` : ''}
                {participant.isCurrentUser ? ' (vous)' : ''}
              </Text>

              <Text style={styles.role} numberOfLines={1}>
                {participant.role}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {!isDesktop && participants.length > displayedParticipants.length && (
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.mobileViewAllButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.mobileViewAllText}>
            Voir les {participants.length} participants
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function getInitials(firstName: string, lastName?: string) {
  return `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

const styles = StyleSheet.create({
  card: {
    height: '100%',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  viewAll: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  participantRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  initials: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  role: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  mobileViewAllButton: {
    minHeight: 42,
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  mobileViewAllText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  pressed: {
    opacity: 0.68,
  },
});