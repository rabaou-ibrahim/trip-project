import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme';

const globeArtwork = require('../../assets/images/trip-globe-handcrafted.png');
const desktopGlobeArtwork = require('../../assets/images/trip-globe-panel-v2.png');
const mapBackground = require('../../assets/images/trip-map-background-v2.png');

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

const benefits = [
  'Croisez les disponibilités',
  'Décidez et votez ensemble',
  'Gardez les dépenses au même endroit',
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        styles.safeArea,
        !isDesktop && styles.mobileSafeArea,
        Platform.OS === 'web' && styles.webViewport,
      ]}
    >
      <ImageBackground
        source={mapBackground}
        resizeMode="cover"
        style={styles.backgroundCanvas}
        imageStyle={styles.backgroundCanvasImage}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { minHeight: height },
            ]}
          >
            <View
              style={[
                styles.shell,
                !isDesktop && styles.mobileShell,
                { minHeight: height },
                isDesktop && styles.desktopShell,
              ]}
            >
              <View
                style={[
                  styles.storyPanel,
                  isDesktop && styles.desktopStoryPanel,
                  isDesktop && { minHeight: height },
                ]}
              >
                {isDesktop ? (
                  <ImageBackground
                    source={desktopGlobeArtwork}
                    resizeMode="stretch"
                    style={styles.storyArtwork}
                    imageStyle={styles.storyArtworkImage}
                  >
                    <View style={styles.storyOverlay} />

                    <View style={styles.storyContent}>
                      <Brand />

                      <View style={styles.storyCopy}>
                        <View style={styles.storyLabel}>
                          <View style={styles.storyLabelDot} />
                          <Text style={styles.storyLabelText}>
                            LE VOYAGE SE DÉCIDE ENSEMBLE
                          </Text>
                        </View>

                        <Text style={styles.storyTitle}>
                          Les meilleurs voyages commencent bien avant le départ.
                        </Text>

                        <Text style={styles.storySubtitle}>
                          Réunissez le groupe, trouvez les bonnes dates et faites
                          avancer chaque décision sans perdre le fil.
                        </Text>
                      </View>

                      <View style={styles.benefits}>
                        {benefits.map((benefit) => (
                          <View key={benefit} style={styles.benefit}>
                            <View style={styles.benefitIcon}>
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color={colors.brandDark}
                              />
                            </View>
                            <Text style={styles.benefitText}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={styles.mobileHeader}>
                    <Image
                      source={globeArtwork}
                      resizeMode="contain"
                      style={styles.mobileHeaderArtwork}
                    />

                    <View style={styles.mobileHeaderContent}>
                      <Brand />

                      <View style={styles.mobileHeaderLabel}>
                        <View style={styles.mobileHeaderLabelDot} />
                        <Text style={styles.mobileHeaderLabelText}>
                          PLANIFIEZ ENSEMBLE
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.formPanel,
                  isDesktop && styles.desktopFormPanel,
                ]}
              >
                <View style={styles.cardWrapper}>
                  <View style={styles.paperOffset} />

                  <View style={styles.paperCard}>
                    <View style={styles.cardContent}>
                      <View style={styles.heading}>
                        <View style={styles.eyebrow}>
                          <Ionicons
                            name="navigate-outline"
                            size={14}
                            color={colors.primary}
                          />
                          <Text style={styles.eyebrowText}>
                            VOTRE VOYAGE COMMENCE ICI
                          </Text>
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                      </View>

                      {children}

                      <View style={styles.footer}>{footer}</View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.logoIcon}>
        <Ionicons
          name="paper-plane"
          size={21}
          color={colors.surface}
        />
      </View>

      <Text style={styles.brandName}>TripProject</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  webViewport: {
    minHeight: '100vh' as never,
  },
  mobileSafeArea: {
    backgroundColor: colors.backgroundWarm,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  shell: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mobileShell: {
    paddingBottom: spacing.xxl,
  },
  backgroundCanvas: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
  backgroundCanvasImage: {
    width: '100%',
    height: '100%',
    opacity: 0.88,
  },
  desktopShell: {
    width: '100%',
    minHeight: 760,
    flexDirection: 'row',
  },
  storyPanel: {
    height: 210,
    overflow: 'hidden',
    backgroundColor: colors.brandDark,
  },
  desktopStoryPanel: {
    flex: 1,
    minWidth: 0,
    height: 'auto',
    minHeight: 696,
  },
  storyArtwork: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  storyArtworkImage: {
    width: '100%',
    height: '100%',
    opacity: 0.76,
  },
  storyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 22, 38, 0.60)',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
    transform: [{ rotate: '-4deg' }],
  },
  brandName: {
    color: colors.surface,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    letterSpacing: -0.7,
  },
  storyCopy: {
    maxWidth: 530,
    gap: spacing.lg,
  },
  storyLabel: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  storyLabelDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  storyLabelText: {
    color: '#DCEBFA',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  storyTitle: {
    maxWidth: 540,
    color: colors.surface,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  storySubtitle: {
    maxWidth: 490,
    color: '#C5D5E4',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    lineHeight: 26,
  },
  benefits: {
    gap: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#F5B944',
    transform: [{ rotate: '-3deg' }],
  },
  benefitText: {
    color: '#E8F0F7',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  mobileHeader: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  mobileHeaderArtwork: {
    position: 'absolute',
    top: 8,
    right: -62,
    width: 300,
    height: 205,
    opacity: 0.78,
  },
  mobileHeaderContent: {
    zIndex: 1,
    flex: 1,
    justifyContent: 'space-between',
  },
  mobileHeaderLabel: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mobileHeaderLabelDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  mobileHeaderLabelText: {
    color: '#DCEBFA',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1,
  },
  formPanel: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    marginTop: -26,
  },
  desktopFormPanel: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
  },
  paperOffset: {
    position: 'absolute',
    top: 8,
    right: -6,
    bottom: -8,
    left: 7,
    borderRadius: 28,
    backgroundColor: '#DCE8F4',
    transform: [{ rotate: '0.8deg' }],
  },
  paperCard: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#D7E1EB',
    borderRadius: 26,
    backgroundColor: colors.surfaceWarm,
  },
  cardContent: {
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eyebrowText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  subtitle: {
    maxWidth: 410,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },
  footer: {
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
});
