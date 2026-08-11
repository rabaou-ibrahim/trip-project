import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { TripProjectHeader } from '@/components/trip-project-detail/TripProjectHeader';
import { TripProjectKeyInfo } from '@/components/trip-project-detail/TripProjectKeyInfo';
import { TripProjectProgress } from '@/components/trip-project-detail/TripProjectProgress';
import { TripProjectSummary } from '@/components/trip-project-detail/TripProjectSummary';
import { TripProjectParticipants } from '@/components/trip-project-detail/TripProjectParticipants';
import { colors, radius, spacing, typography } from '@/theme';

export default function TripProjectDetailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const detailContent = (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir à l’accueil"
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={colors.textPrimary}
        />

        <Text style={styles.backLabel}>Retour</Text>
      </Pressable>

      <View style={styles.content}>
        <TripProjectHeader
          title="Japon été 2027"
          city="Tokyo"
          country="Japon"
          startDate="2027-07-15"
          endDate="2027-07-20"
          participantCount={5}
          isDesktop={isDesktop}
          onShare={() => console.log('Partager le projet')}
          onMore={() => console.log('Options du projet')}
        />

        <TripProjectProgress
          currentStep={3}
          activeEndStep={4}
          isDesktop={isDesktop}
        />

        <View
          style={[
            styles.detailsGrid,
            isDesktop && styles.desktopDetailsGrid,
          ]}
        >
          <View
            style={[
              styles.detailColumn,
              isDesktop && styles.desktopDetailColumn,
            ]}
          >
            <TripProjectSummary
              isDesktop={isDesktop}
              proposedDestinationCount={2}
              pendingVoteCount={3}
              onViewVotes={() => console.log('Voir les votes')}
            />
          </View>

          <View
            style={[
              styles.detailColumn,
              isDesktop && styles.desktopDetailColumn,
            ]}
          >
            <TripProjectKeyInfo
              startDate="2027-07-15"
              endDate="2027-07-20"
              estimatedBudget={1200}
              currency="EUR"
              voteStatus="Votes en cours"
              createdAt="2026-05-12"
              isDesktop={isDesktop}
            />
          </View>
          <View
            style={[
              styles.detailColumn,
              isDesktop && styles.desktopDetailColumn,
            ]}
          >
            <TripProjectParticipants
              isDesktop={isDesktop}
              participants={[
                {
                  id: 1,
                  firstName: 'Ibrahim',
                  role: 'Propriétaire',
                  isCurrentUser: true,
                },
                {
                  id: 2,
                  firstName: 'Alice',
                  role: 'Membre',
                },
                {
                  id: 3,
                  firstName: 'Mehdi',
                  role: 'Membre',
                },
                {
                  id: 4,
                  firstName: 'Lucas',
                  role: 'Membre',
                },
                {
                  id: 5,
                  firstName: 'Chloé',
                  role: 'Membre',
                },
              ]}
              onViewAll={() => console.log('Voir tous les participants')}
            />
          </View>
        </View>
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />

        <ScrollView
          style={styles.desktopContent}
          contentContainerStyle={styles.desktopContentInner}
          showsVerticalScrollIndicator={false}
        >
          {detailContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage}>
      <ScrollView
        style={styles.mobileScrollView}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {detailContent}
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

  desktopContent: {
    flex: 1,
  },

  desktopContentInner: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },

  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },

  mobileScrollView: {
    flex: 1,
  },

  mobileContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.md,

    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,

    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  backButtonPressed: {
    opacity: 0.7,
  },

  backLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },

  content: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },

  detailsGrid: {
    width: '100%',
    gap: spacing.lg,
  },

  desktopDetailsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  detailColumn: {
    width: '100%',
  },

  desktopDetailColumn: {
    flex: 1,
    width: 'auto',
  },
});