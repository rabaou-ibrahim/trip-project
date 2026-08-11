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
import { TripProjectHeader } from '@/components/trip-project-detail/TripProjectHeader';
import { TripProjectProgress } from '@/components/trip-project-detail/TripProjectProgress';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { colors, radius, spacing, typography } from '@/theme';

export default function TripProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const detailContent = (
    <>
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
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

  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },

  title: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
  },

  description: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
});