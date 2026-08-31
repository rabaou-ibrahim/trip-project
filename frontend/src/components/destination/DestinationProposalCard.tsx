import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

export type DestinationProposal = {
  id: string;
  city: string;
  country: string;
  imageUrl?: string;
  flagUrl?: string;
  estimatedBudget: number;
  votes: number;
  hasVoted: boolean;
  accentColor: string;
  accentSoftColor: string;
};

type DestinationProposalCardProps = {
  proposal: DestinationProposal;
  isDesktop?: boolean;
  onPress: () => void;
  onVote: () => void;
};

export function DestinationProposalCard({
  proposal,
  isDesktop = false,
  onPress,
  onVote,
}: DestinationProposalCardProps) {
  const budget = new Intl.NumberFormat('fr-FR').format(
    proposal.estimatedBudget,
  );

  return (
    <View style={[styles.card, isDesktop && styles.desktopCard]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.visual,
          isDesktop && styles.desktopVisual,
          { backgroundColor: proposal.accentSoftColor },
        ]}
      >
        {proposal.imageUrl ? (
          <Image
            source={{ uri: proposal.imageUrl }}
            style={styles.destinationImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <View
              style={[
                styles.largeCircle,
                { backgroundColor: proposal.accentColor },
              ]}
            />

            <Ionicons
              name="airplane"
              size={isDesktop ? 42 : 36}
              color={proposal.accentColor}
              style={styles.plane}
            />
          </>
        )}

        <View style={styles.imageOverlay} />

        {proposal.flagUrl && (
          <View style={styles.flagBadge}>
            <Image
              source={{ uri: proposal.flagUrl }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.votesOverlay}>
          <Ionicons
            name={proposal.hasVoted ? 'checkmark-circle' : 'heart'}
            size={14}
            color="#FFFFFF"
          />

          <Text style={styles.votesOverlayText}>
            {proposal.votes} vote{proposal.votes > 1 ? 's' : ''}
          </Text>
        </View>
      </Pressable>

      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <View>
          <Pressable onPress={onPress} style={styles.titleRow}>
            <View style={styles.destinationIdentity}>
              <Text
                style={[styles.city, isDesktop && styles.desktopCity]}
                numberOfLines={1}
              >
                {proposal.city}
              </Text>

              <Text style={styles.country} numberOfLines={1}>
                {proposal.country}
              </Text>
            </View>

            <View style={styles.openButton}>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textMuted}
              />
            </View>
          </Pressable>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="wallet-outline"
                size={16}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.budgetLabel}>Budget estimé</Text>

              <Text style={styles.budgetValue}>
                {budget} € / pers.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onVote}
          accessibilityRole="button"
          accessibilityState={{ selected: proposal.hasVoted }}
          style={({ pressed }) => [
            styles.voteButton,
            proposal.hasVoted && styles.votedButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={
              proposal.hasVoted
                ? 'checkmark-circle'
                : 'thumbs-up-outline'
            }
            size={17}
            color={
              proposal.hasVoted
                ? colors.secondary
                : colors.primary
            }
          />

          <Text
            style={[
              styles.voteButtonText,
              proposal.hasVoted && styles.votedButtonText,
            ]}
          >
            {proposal.hasVoted ? 'Votre choix' : 'Voter'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },

  desktopCard: {
    flexDirection: 'row',
    minHeight: 220,
  },

  visual: {
    position: 'relative',
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },

  desktopVisual: {
    width: 300,
    height: '100%',
    minHeight: 220,
  },

  destinationImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 29, 53, 0.13)',
  },

  largeCircle: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 190,
    height: 190,
    opacity: 0.12,
    borderRadius: radius.full,
  },

  plane: {
    position: 'absolute',
    top: '39%',
    alignSelf: 'center',
    opacity: 0.65,
  },

  flagBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.sm,
  },

  flagImage: {
    width: 30,
    height: 20,
    borderRadius: 3,
  },

  votesOverlay: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(8, 29, 53, 0.78)',
    borderRadius: radius.full,
  },

  votesOverlayText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xl,
  },

  desktopContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  destinationIdentity: {
    flex: 1,
  },

  city: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },

  desktopCity: {
    fontSize: typography.fontSize.xxl,
  },

  country: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },

  openButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },

  infoRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  infoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.md,
  },

  budgetLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },

  budgetValue: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  voteButton: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#EAF1FF',
    borderWidth: 1,
    borderColor: '#C9DAFF',
    borderRadius: radius.md,
  },

  voteButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  votedButton: {
    backgroundColor: '#E8F8F1',
    borderColor: '#BDE8D5',
  },

  votedButtonText: {
    color: colors.secondary,
  },

  pressed: {
    opacity: 0.72,
  },
});