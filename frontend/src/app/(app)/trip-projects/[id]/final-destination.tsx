import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { colors, radius, spacing, typography } from '@/theme';

const DESKTOP_BREAKPOINT = 1024;

export default function FinalDestinationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const tripProjectId = Array.isArray(id) ? id[0] : id;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const handleContinue = () => {
    if (!tripProjectId) {
      router.replace('/');
      return;
    }

    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id: tripProjectId },
    });
  };

  const pageContent = (
    <View
      style={[
        styles.content,
        isDesktop && styles.desktopContent,
      ]}
    >
      <View style={styles.celebration}>
        <Text
          style={styles.celebrationEmoji}
          accessibilityLabel="Célébration"
        >
          🎉
        </Text>
      </View>

      <Text
        style={[
          styles.title,
          isDesktop && styles.desktopTitle,
        ]}
      >
        Destination retenue !
      </Text>

      <View
        style={[
          styles.destinationCard,
          isDesktop && styles.desktopDestinationCard,
        ]}
      >
        <View
          style={styles.flag}
          accessibilityLabel="Drapeau du Japon"
        >
          <View style={styles.flagCircle} />
        </View>

        <View style={styles.destinationInformation}>
          <Text
            style={[
              styles.destinationName,
              isDesktop && styles.desktopDestinationName,
            ]}
          >
            Tokyo, Japon
          </Text>

          <Text style={styles.destinationDates}>
            15 – 20 juillet 2027
          </Text>
        </View>
      </View>

      <View style={styles.message}>
        <Text style={styles.congratulations}>
          Bravo à tous !
        </Text>

        <Text style={styles.description}>
          Préparons maintenant notre séjour à Tokyo 🎉
        </Text>
      </View>

      <Pressable
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continuer l’organisation du voyage"
        style={({ pressed }) => [
          styles.continueButton,
          isDesktop && styles.desktopContinueButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.continueButtonText}>
          Continuer l’organisation
        </Text>
      </Pressable>
    </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },

  content: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },

  desktopContent: {
    maxWidth: 560,
  },

  celebration: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E8',
    borderRadius: radius.full,
  },

  celebrationEmoji: {
    fontSize: 76,
    lineHeight: 100,
  },

  title: {
    marginTop: spacing.xl,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },

  desktopTitle: {
    fontSize: typography.fontSize.xxl,
  },

  destinationCard: {
    width: '100%',
    marginTop: spacing.xxl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#D7E6FA',
    borderRadius: radius.xl,
  },

  desktopDestinationCard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },

  flag: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  flagCircle: {
    width: 30,
    height: 30,
    backgroundColor: '#D61F2C',
    borderRadius: radius.full,
  },

  destinationInformation: {
    flex: 1,
  },

  destinationName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },

  desktopDestinationName: {
    fontSize: typography.fontSize.xxl,
  },

  destinationDates: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },

  message: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },

  congratulations: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },

  description: {
    maxWidth: 340,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 22,
    textAlign: 'center',
  },

  continueButton: {
    width: '100%',
    minHeight: 54,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  desktopContinueButton: {
    maxWidth: 420,
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.76,
  },
});