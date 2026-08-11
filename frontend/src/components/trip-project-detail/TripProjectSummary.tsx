import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type TripProjectSummaryProps = {
  isDesktop?: boolean;
  proposedDestinationCount: number;
  pendingVoteCount: number;
  onViewVotes: () => void;
};

export function TripProjectSummary({
  isDesktop = false,
  proposedDestinationCount,
  pendingVoteCount,
  onViewVotes,
}: TripProjectSummaryProps) {
  return (
    <View style={[styles.card, isDesktop && styles.desktopCard]}>
      <View>
        <Text style={styles.title}>Résumé</Text>

        <Text style={styles.description}>
          Nous avons {proposedDestinationCount} destination
          {proposedDestinationCount > 1 ? 's' : ''} proposée
          {proposedDestinationCount > 1 ? 's' : ''}. {'\n'}
          {pendingVoteCount} vote{pendingVoteCount > 1 ? 's' : ''} en attente.
          La destination sera déterminée bientôt !
        </Text>
      </View>

      <View style={styles.divider} />

      <View>
        <Text style={styles.nextActionTitle}>Prochaine action</Text>

        <Text style={styles.nextActionText}>
          Rappel : {pendingVoteCount} participant
          {pendingVoteCount > 1 ? 's' : ''} n’
          {pendingVoteCount > 1 ? 'ont' : 'a'} pas encore voté.
        </Text>

        <Pressable
          onPress={onViewVotes}
          accessibilityRole="button"
          accessibilityLabel="Voir les votes"
          style={({ pressed }) => [
            isDesktop ? styles.desktopAction : styles.mobileAction,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={
              isDesktop
                ? styles.desktopActionText
                : styles.mobileActionText
            }
          >
            Voir les votes
          </Text>

          <Ionicons
            name="arrow-forward"
            size={isDesktop ? 15 : 17}
            color={isDesktop ? colors.primary : '#FFFFFF'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCard: {
    height: '100%',
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  description: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xl,
    backgroundColor: colors.border,
  },
  nextActionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  nextActionText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 21,
  },
  mobileAction: {
    minHeight: 46,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  mobileActionText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  desktopAction: {
    alignSelf: 'flex-start',
    minHeight: 36,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  desktopActionText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  pressed: {
    opacity: 0.72,
  },
});