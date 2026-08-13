import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

export type DestinationProposal = {
  id: string;
  city: string;
  country: string;
  flag: string;
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
    <View
      style={[
        styles.visual,
        isDesktop && styles.desktopVisual,
        { backgroundColor: proposal.accentSoftColor },
      ]}
    >
      <View
        style={[
          styles.largeCircle,
          { backgroundColor: proposal.accentColor },
        ]}
      />

      <View
        style={[
          styles.smallCircle,
          { borderColor: proposal.accentColor },
        ]}
      />

      <View style={styles.flagBadge}>
        <Text style={styles.flag}>{proposal.flag}</Text>
      </View>

      <Ionicons
        name="airplane"
        size={isDesktop ? 40 : 34}
        color={proposal.accentColor}
        style={styles.plane}
      />

      <View style={styles.votesOverlay}>
        <Ionicons name="heart" size={13} color="#FFFFFF" />

        <Text style={styles.votesOverlayText}>
          {proposal.votes} vote{proposal.votes > 1 ? 's' : ''}
        </Text>
      </View>
    </View>

    <View style={[styles.content, isDesktop && styles.desktopContent]}>
      <View style={styles.contentHeader}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Consulter ${proposal.city}`}
          style={styles.destinationIdentity}
        >
          <Text style={styles.city}>{proposal.city}</Text>
          <Text style={styles.country}>{proposal.country}</Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Voir la proposition ${proposal.city}`}
          style={({ pressed }) => [
            styles.openButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.budgetBlock}>
        <Text style={styles.budgetLabel}>Budget estimé</Text>

        <Text style={styles.budgetValue}>
          {budget} € / pers.
        </Text>
      </View>

      <Pressable
        onPress={onVote}
        accessibilityRole="button"
        accessibilityLabel={
          proposal.hasVoted
            ? `${proposal.city}, votre choix actuel`
            : `Voter pour ${proposal.city}`
        }
        accessibilityState={{
          selected: proposal.hasVoted,
        }}
        style={({ pressed }) => [
          styles.voteButton,
          isDesktop && styles.desktopVoteButton,
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
          size={15}
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
    minHeight: 210,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCard: {
    minHeight: 190,
  },
  visual: {
    position: 'relative',
    width: '43%',
    minHeight: 210,
    overflow: 'hidden',
    padding: spacing.md,
  },
  desktopVisual: {
    width: 230,
    minHeight: 190,
  },
  largeCircle: {
    position: 'absolute',
    top: -55,
    right: -55,
    width: 170,
    height: 170,
    opacity: 0.13,
    borderRadius: radius.full,
  },
  smallCircle: {
    position: 'absolute',
    bottom: 30,
    left: -34,
    width: 110,
    height: 110,
    opacity: 0.12,
    borderWidth: 22,
    borderRadius: radius.full,
  },
  flagBadge: {
    width: 42,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.md,
  },
  flag: {
    fontSize: 21,
  },
  plane: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    opacity: 0.65,
  },
  votesOverlay: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    left: spacing.sm,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(8, 29, 53, 0.78)',
    borderRadius: radius.md,
  },
  votesOverlayText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  city: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  country: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  budgetLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  budgetValue: {
    marginTop: 3,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 210,
    padding: spacing.md,
  },

   desktopContent: {
    minHeight: 190,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    },

    contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    },

    destinationIdentity: {
    flex: 1,
    },

    budgetBlock: {
    marginTop: spacing.lg,
    },

    voteButton: {
        alignSelf: 'flex-end',
        minWidth: 112,
        minHeight: 40,
        marginTop: 'auto',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.lg,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,

        backgroundColor: '#EAF1FF',
        borderWidth: 1,
        borderColor: '#C9DAFF',
        borderRadius: radius.full,
    },

    desktopVoteButton: {
    minWidth: 120,
    maxWidth: 150,
    marginBottom: 0,
    },

    voteButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
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
    openButton: {
    padding: spacing.sm,
    borderRadius: radius.full,
    },
});