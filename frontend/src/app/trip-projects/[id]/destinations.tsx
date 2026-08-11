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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [proposals, setProposals] = useState(initialProposals);

  const leadingProposal = useMemo(
    () =>
      [...proposals].sort(
        (first, second) => second.votes - first.votes,
      )[0],
    [proposals],
  );

  const handleBack = () => {
    if (!id) {
      router.replace('/');
      return;
    }

    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id },
    });
  };

  const handleVote = (proposalId: string) => {
    setProposals((currentProposals) =>
      currentProposals.map((proposal) => {
        if (proposal.id !== proposalId) {
          return proposal;
        }

        return {
          ...proposal,
          hasVoted: !proposal.hasVoted,
          votes: Math.max(
            0,
            proposal.votes + (proposal.hasVoted ? -1 : 1),
          ),
        };
      }),
    );
  };

  const cards = (
    <View style={[styles.cards, isDesktop && styles.desktopCards]}>
      {proposals.map((proposal) => (
        <DestinationProposalCard
          key={proposal.id}
          proposal={proposal}
          isDesktop={isDesktop}
          onPress={() => console.log('Ouvrir', proposal.id)}
          onVote={() => handleVote(proposal.id)}
        />
      ))}
    </View>
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
          <View style={styles.desktopMainColumn}>{cards}</View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="podium-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryTitle}>En tête du vote</Text>
            <Text style={styles.summaryCity}>{leadingProposal.city}</Text>
            <Text style={styles.summaryCountry}>
              {leadingProposal.flag} {leadingProposal.country}
            </Text>

            <View style={styles.summaryDivider} />

            <Text style={styles.summaryVotes}>
              {leadingProposal.votes} votes actuellement
            </Text>
            <Text style={styles.summaryText}>
              Les participants peuvent encore modifier leur choix avant la clôture.
            </Text>

            <Pressable
              onPress={() => console.log('Voir les détails et votes')}
              style={({ pressed }) => [
                styles.detailsButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.detailsButtonText}>
                Voir les détails et votes
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {cards}

          <Pressable
            onPress={() => console.log('Voir les détails et votes')}
            style={({ pressed }) => [
              styles.mobilePrimaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.mobilePrimaryButtonText}>
              Voir les détails et votes
            </Text>
          </Pressable>
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
  detailsButton: {
    minHeight: 46,
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  mobilePrimaryButton: {
    minHeight: 50,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  mobilePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
});