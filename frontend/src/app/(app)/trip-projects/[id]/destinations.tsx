import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  DestinationProposalCard,
  type DestinationProposal,
} from '@/components/destination/DestinationProposalCard';
import { colors, radius, spacing, typography } from '@/theme';

const DESKTOP_BREAKPOINT = 1024;

const initialProposals: DestinationProposal[] = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japon',
    flag: '🇯🇵',
    estimatedBudget: 1200,
    votes: 8,
    hasVoted: true,
    accentColor: '#D9364D',
    accentSoftColor: '#FFF0F2',
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonésie',
    flag: '🇮🇩',
    estimatedBudget: 1100,
    votes: 5,
    hasVoted: false,
    accentColor: '#0F8A72',
    accentSoftColor: '#EAF8F4',
  },
];

export default function DestinationsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const tripProjectId = Array.isArray(id) ? id[0] : id;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [proposals, setProposals] = useState(initialProposals);

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const [summaryVisible, setSummaryVisible] = useState(false);

  const leadingProposal = [...proposals].sort(
  (first, second) => second.votes - first.votes,
  )[0];

  const currentVote = proposals.find((proposal) => proposal.hasVoted) ?? null;

  const selectedProposal = proposals.find((proposal) => proposal.id === selectedProposalId,) ?? null;

  const summaryProposal =
  selectedProposal ?? currentVote ?? leadingProposal ?? null;

  const totalVotes = proposals.reduce(
    (total, proposal) => total + proposal.votes,
    0,
  );

  const selectedVoteShare =
    selectedProposal && totalVotes > 0
      ? Math.round((selectedProposal.votes / totalVotes) * 100)
      : 0;

  const handleSelectProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setSummaryVisible(true);
  };

  const handleBack = () => {
    if (!tripProjectId) {
      router.replace('/');
      return;
    }

    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id: tripProjectId },
    });
  };

  const handleVote = (proposalId: string) => {
    setProposals((currentProposals) => {
      const clickedProposal = currentProposals.find(
        (proposal) => proposal.id === proposalId,
      );

      if (!clickedProposal) {
        return currentProposals;
      }

      const isRemovingVote = clickedProposal.hasVoted;

      return currentProposals.map((proposal) => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            hasVoted: !isRemovingVote,
            votes: Math.max(
              0,
              proposal.votes + (isRemovingVote ? -1 : 1),
            ),
          };
        }

        if (!isRemovingVote && proposal.hasVoted) {
          return {
            ...proposal,
            hasVoted: false,
            votes: Math.max(0, proposal.votes - 1),
          };
        }

        return proposal;
      });
    });
  };

  const cards = (
    <View style={styles.cards}>
      {proposals.map((proposal) => (
        <DestinationProposalCard
          key={proposal.id}
          proposal={proposal}
          isDesktop={isDesktop}
          onPress={() => handleSelectProposal(proposal.id)}
          onVote={() => handleVote(proposal.id)}
        />
      ))}
    </View>
  );

  const voteSummary = summaryVisible && summaryProposal ? (
    <View
      style={[
        styles.summaryCard,
        !isDesktop && styles.mobileSummaryCard,
      ]}
    >
      <View style={styles.summaryHeaderRow}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="stats-chart-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <Pressable
          onPress={() => setSummaryVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Masquer le résumé du vote"
          style={({ pressed }) => [
            styles.summaryCloseButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="close"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <Text style={styles.summaryTitle}>
        PROPOSITION CONSULTÉE
      </Text>

      <Text style={styles.summaryCity}>
        {summaryProposal.city}
      </Text>

      <Text style={styles.summaryCountry}>
        {summaryProposal.flag} {summaryProposal.country}
      </Text>

      <View style={styles.summaryDivider} />

      <Text style={styles.summaryVotes}>
        {summaryProposal.votes} vote
        {summaryProposal.votes > 1 ? 's' : ''} actuellement
      </Text>

      <Text style={styles.summaryText}>
        {leadingProposal
          ? `${leadingProposal.city} est actuellement en tête.`
          : 'Aucune proposition en tête.'}
      </Text>

      <View style={styles.currentVoteBox}>
        <Ionicons
          name={
            currentVote
              ? 'checkmark-circle'
              : 'remove-circle-outline'
          }
          size={20}
          color={
            currentVote ? colors.secondary : colors.textMuted
          }
        />

        <View>
          <Text style={styles.currentVoteLabel}>
            Votre vote
          </Text>

          <Text style={styles.currentVoteCity}>
            {currentVote?.city ?? 'Aucun vote enregistré'}
          </Text>
        </View>
      </View>
    </View>
  ) : (
    <Pressable
      onPress={() => setSummaryVisible(true)}
      accessibilityRole="button"
      accessibilityLabel="Afficher le résumé du vote"
      style={({ pressed }) => [
        styles.reopenSummaryButton,
        !isDesktop && styles.mobileReopenSummaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="stats-chart-outline"
        size={18}
        color={colors.primary}
      />

      <Text style={styles.reopenSummaryText}>
        Afficher le vote
      </Text>
    </Pressable>
  );

  const pageContent = (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Retour au voyage"
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={19}
          color={colors.textPrimary}
        />
        <Text style={styles.backButtonText}>Retour au voyage</Text>
      </Pressable>

      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>VACANCES ÉTÉ 2027</Text>
          <Text style={[styles.title, isDesktop && styles.desktopTitle]}>
            Destinations proposées
          </Text>
          <Text style={styles.subtitle}>
            {proposals.length} propositions · Votez pour votre destination préférée.
          </Text>
        </View>

        <View style={styles.voteOpenBadge}>
          <View style={styles.voteOpenDot} />
          <Text style={styles.voteOpenText}>Vote ouvert</Text>
        </View>
      </View>

      {isDesktop ? (
        <View style={styles.desktopBody}>
          <View style={styles.desktopMainColumn}>
            {cards}
          </View>

          {voteSummary}
        </View>
      ) : (
        <>
          {voteSummary}
          {cards}
        </>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />

        <ScrollView
          style={styles.desktopScroll}
          contentContainerStyle={styles.desktopScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {pageContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage}>
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={styles.mobileScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pageContent}
      </ScrollView>

      <MobileBottomNavigation activeItem="trips" />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  desktopScroll: {
    flex: 1,
  },
  desktopScrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  pressed: {
    opacity: 0.72,
  },
  header: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  desktopHeader: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  desktopTitle: {
    fontSize: typography.fontSize.xxl,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  voteOpenBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#E9F8F1',
    borderRadius: radius.full,
  },
  voteOpenDot: {
    width: 7,
    height: 7,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
  },
  voteOpenText: {
    color: colors.secondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  cards: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  desktopCards: {
    marginTop: 0,
  },
  desktopBody: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  summaryCard: {
    width: 300,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.md,
  },
  summaryTitle: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryCity: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  summaryCountry: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  summaryDivider: {
    height: 1,
    marginVertical: spacing.lg,
    backgroundColor: colors.border,
  },
  summaryVotes: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  summaryText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
  },
  mobileSummaryCard: {
    width: '100%',
    marginTop: spacing.xl,
  },

  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },

  currentVoteBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E8F8F1',
    borderWidth: 1,
    borderColor: '#BDE8D5',
    borderRadius: radius.md,
  },

  currentVoteLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },

  currentVoteCity: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  reopenSummaryButton: {
    width: 300,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  mobileReopenSummaryButton: {
    width: '100%',
    marginTop: spacing.xl,
  },

  reopenSummaryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
});