import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme';

const globeArtwork = require('../../assets/images/trip-globe-handcrafted.png');
const mapBackground = require('../../assets/images/trip-map-background.png');

type IconName = ComponentProps<typeof Ionicons>['name'];

type JourneyStep = {
  icon: IconName;
  number: string;
  title: string;
  text: string;
};

const journeySteps: JourneyStep[] = [
  {
    icon: 'people-outline',
    number: '01',
    title: 'Réunissez le groupe',
    text: 'Invitez les personnes qui participent au projet.',
  },
  {
    icon: 'calendar-outline',
    number: '02',
    title: 'Croisez les dates',
    text: 'Repérez les périodes communes aux participants.',
  },
  {
    icon: 'location-outline',
    number: '03',
    title: 'Choisissez ensemble',
    text: 'Proposez des destinations puis passez au vote.',
  },
  {
    icon: 'wallet-outline',
    number: '04',
    title: 'Organisez le séjour',
    text: 'Préparez le départ et partagez les dépenses.',
  },
];

const mobileSteps = [
  { icon: 'people-outline' as const, number: '1', label: 'Invitez' },
  { icon: 'calendar-outline' as const, number: '2', label: 'Croisez' },
  { icon: 'checkmark-circle-outline' as const, number: '3', label: 'Votez' },
];

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isDesktop ? (
          <DesktopWelcome />
        ) : (
          <MobileWelcome viewportHeight={height} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DesktopWelcome() {
  return (
    <ImageBackground
      source={mapBackground}
      resizeMode="cover"
      imageStyle={styles.mapImage}
      style={styles.desktopShell}
    >
      <View style={styles.informationPanel}>
        <Brand />

        <View style={styles.informationBody}>
          <RouteDecoration />

          <View style={styles.informationCopy}>
            <View style={styles.paperNote}>
              <Text style={styles.paperNoteText}>
                Le groupe avant la destination
              </Text>
            </View>

            <Text style={styles.informationTitle}>
              Un voyage n’est pas qu’une réservation. C’est une décision de
              groupe.
            </Text>

            <Text style={styles.informationSubtitle}>
              TripProject guide les participants dans le bon ordre, depuis les
              premières disponibilités jusqu’au partage des dépenses.
            </Text>
          </View>

          <View style={styles.journeyGrid}>
            {journeySteps.map((step, index) => (
              <View
                key={step.number}
                style={[
                  styles.journeyCard,
                  index % 2 === 0
                    ? styles.cardTiltLeft
                    : styles.cardTiltRight,
                ]}
              >
                <View style={styles.journeyCardHeader}>
                  <View style={styles.journeyIcon}>
                    <Ionicons
                      name={step.icon}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.journeyNumber}>{step.number}</Text>
                </View>

                <Text style={styles.journeyTitle}>{step.title}</Text>
                <Text style={styles.journeyText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.informationFooter}>
          Planifiez. Partagez. Partez ensemble.
        </Text>
      </View>

      <View style={styles.desktopHero}>
        <Brand inverted compact />

        <View style={styles.desktopArtworkStage}>
          <Image
            source={globeArtwork}
            resizeMode="contain"
            style={styles.desktopGlobe}
          />

          <PaperQuestion desktop />

          <View style={styles.desktopPreviewPosition}>
            <ProjectPreview />
          </View>
        </View>

        <View style={styles.desktopHeroBottom}>
          <Eyebrow />

          <Text style={styles.desktopHeroTitle}>
            Votre prochain voyage commence par le groupe.
          </Text>

          <Text style={styles.desktopHeroSubtitle}>
            Créez le projet aujourd’hui. La destination viendra ensuite.
          </Text>

          <Actions />
        </View>
      </View>
    </ImageBackground>
  );
}

function MobileWelcome({ viewportHeight }: { viewportHeight: number }) {
  const visualHeight = Math.max(465, Math.min(viewportHeight * 0.58, 530));

  return (
    <View style={styles.mobileShell}>
      <View style={[styles.mobileVisual, { minHeight: visualHeight }]}>
        <Brand inverted />

        <Image
          source={globeArtwork}
          resizeMode="contain"
          style={styles.mobileGlobe}
        />

        <PaperQuestion />

        <View style={styles.mobilePreviewPosition}>
          <ProjectPreview />
        </View>
      </View>

      <ImageBackground
        source={mapBackground}
        resizeMode="cover"
        imageStyle={styles.mobileSheetImage}
        style={styles.mobileSheet}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.mobileHeading}>
          <Eyebrow light />

          <Text style={styles.mobileTitle}>
            Le prochain départ commence ici.
          </Text>

          <Text style={styles.mobileSubtitle}>
            Invitez le groupe, trouvez les dates communes, puis choisissez la
            destination.
          </Text>
        </View>

        <View style={styles.mobileFlow}>
          {mobileSteps.map((step, index) => (
            <View key={step.number} style={styles.mobileFlowGroup}>
              <View style={styles.mobileFlowStep}>
                <View style={styles.mobileFlowIcon}>
                  <Ionicons
                    name={step.icon}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.mobileStepNumber}>
                  <Text style={styles.mobileStepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.mobileFlowLabel}>{step.label}</Text>
              </View>

              {index < mobileSteps.length - 1 && (
                <View style={styles.flowConnector}>
                  <View style={styles.flowConnectorLine} />
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color="#89A5BF"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        <Actions mobile />
      </ImageBackground>
    </View>
  );
}

function ProjectPreview() {
  const avatarLabels = ['I', 'A', 'M'];

  return (
    <View style={styles.projectPreview}>
      <View style={styles.previewTopRow}>
        <View style={styles.previewCopy}>
          <Text style={styles.previewLabel}>PROJET EN PRÉPARATION</Text>
          <Text style={styles.previewTitle}>Le groupe se met d’accord</Text>
        </View>

        <View style={styles.previewStatus}>
          <View style={styles.previewStatusDot} />
          <Text style={styles.previewStatusText}>EN COURS</Text>
        </View>
      </View>

      <View style={styles.previewBottomRow}>
        <View style={styles.avatarStack}>
          {avatarLabels.map((label, index) => (
            <View
              key={label}
              style={[
                styles.previewAvatar,
                index > 0 && styles.previewAvatarOverlap,
              ]}
            >
              <Text style={styles.previewAvatarText}>{label}</Text>
            </View>
          ))}

          <View style={[styles.previewAvatar, styles.previewAvatarOverlap]}>
            <Text style={styles.previewAvatarMore}>+2</Text>
          </View>
        </View>

        <View style={styles.commonDatesBadge}>
          <View style={styles.commonDatesDot} />
          <Text style={styles.commonDatesText}>Périodes communes trouvées</Text>
        </View>
      </View>
    </View>
  );
}

function PaperQuestion({ desktop = false }: { desktop?: boolean }) {
  return (
    <View
      style={[
        styles.paperQuestion,
        desktop ? styles.desktopQuestion : styles.mobileQuestion,
      ]}
    >
      <View style={styles.questionPin} />
      <Text style={styles.paperQuestionText}>On part quand ?</Text>
    </View>
  );
}

function RouteDecoration() {
  return (
    <View style={styles.routeDecoration}>
      <View style={styles.routeDot} />
      <View style={styles.routeLine} />
      <Ionicons
        name="paper-plane-outline"
        size={20}
        color="#82ADD7"
      />
    </View>
  );
}

function Eyebrow({ light = false }: { light?: boolean }) {
  return (
    <View style={[styles.eyebrow, light && styles.eyebrowLight]}>
      <View style={styles.eyebrowDot} />
      <Text style={[styles.eyebrowText, light && styles.eyebrowTextLight]}>
        PLANIFIEZ ENSEMBLE
      </Text>
    </View>
  );
}

function Actions({ mobile = false }: { mobile?: boolean }) {
  return (
    <View style={[styles.actions, mobile && styles.mobileActions]}>
      <Pressable
        onPress={() => router.push('/register')}
        accessibilityRole="button"
        accessibilityLabel="Commencer un projet"
        style={({ pressed }) => [
          styles.primaryAction,
          mobile && styles.mobilePrimaryAction,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.primaryActionText,
            mobile && styles.mobilePrimaryActionText,
          ]}
        >
          Commencer un projet
        </Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={mobile ? colors.surface : colors.primary}
        />
      </Pressable>

      <Pressable
        onPress={() => router.push('/login')}
        accessibilityRole="button"
        accessibilityLabel="Se connecter"
        style={({ pressed }) => [
          styles.loginAction,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.loginActionText,
            mobile && styles.mobileLoginActionText,
          ]}
        >
          J’ai déjà un compte
        </Text>
      </Pressable>
    </View>
  );
}

function Brand({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={styles.brand}>
      <View
        style={[
          styles.brandIcon,
          !inverted && styles.brandIconLight,
          compact && styles.brandIconCompact,
        ]}
      >
        <Ionicons
          name="paper-plane"
          size={compact ? 18 : 22}
          color={inverted ? colors.surface : colors.primary}
        />
      </View>

      <View>
        <Text
          style={[
            styles.brandName,
            inverted && styles.brandNameInverted,
            compact && styles.brandNameCompact,
          ]}
        >
          TripProject
        </Text>

        {!inverted && (
          <Text style={styles.brandTagline}>
            Planifiez. Partagez. Partez ensemble.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.backgroundWarm,
  },
  mapImage: {
    opacity: 0.76,
  },
  desktopShell: {
    flex: 1,
    minHeight: 760,
    flexDirection: 'row',
    padding: spacing.xxl,
    gap: spacing.xxl,
    backgroundColor: colors.backgroundWarm,
  },
  informationPanel: {
    flex: 1.25,
    minHeight: 696,
    justifyContent: 'space-between',
    padding: spacing.xxxl,
  },
  informationBody: {
    maxWidth: 770,
    gap: spacing.xxl,
  },
  routeDecoration: {
    maxWidth: 590,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    opacity: 0.72,
  },
  routeDot: {
    width: 9,
    height: 9,
    borderWidth: 2,
    borderColor: '#82ADD7',
    borderRadius: radius.full,
  },
  routeLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#82ADD7',
    borderStyle: 'dashed',
  },
  informationCopy: {
    gap: spacing.lg,
  },
  paperNote: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0C46D',
    borderRadius: 10,
    backgroundColor: '#FFF0BE',
    transform: [{ rotate: '-1.5deg' }],
  },
  paperNoteText: {
    color: '#754C08',
    fontFamily: typography.fontFamily.displaySemibold,
    fontSize: typography.fontSize.xs,
  },
  informationTitle: {
    maxWidth: 740,
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 43,
    lineHeight: 50,
    letterSpacing: -1.25,
  },
  informationSubtitle: {
    maxWidth: 610,
    color: '#405870',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    lineHeight: 26,
  },
  journeyGrid: {
    maxWidth: 760,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  journeyCard: {
    width: '47%',
    minHeight: 112,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D5E1EC',
    borderRadius: 17,
    backgroundColor: 'rgba(255, 252, 247, 0.93)',
  },
  cardTiltLeft: {
    transform: [{ rotate: '-0.3deg' }],
  },
  cardTiltRight: {
    transform: [{ rotate: '0.3deg' }],
  },
  journeyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  journeyIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E8F1FC',
  },
  journeyNumber: {
    color: '#A3B6C8',
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
  },
  journeyTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },
  journeyText: {
    marginTop: 3,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  informationFooter: {
    color: '#70859A',
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },
  desktopHero: {
    flex: 0.82,
    maxWidth: 560,
    minHeight: 696,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderRadius: 30,
    backgroundColor: colors.brandDark,
  },
  desktopArtworkStage: {
    position: 'relative',
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopGlobe: {
    width: '118%',
    height: 380,
    opacity: 0.91,
  },
  desktopPreviewPosition: {
    position: 'absolute',
    right: spacing.md,
    bottom: 0,
    left: spacing.md,
    alignItems: 'center',
  },
  desktopHeroBottom: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  projectPreview: {
    width: '100%',
    maxWidth: 430,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D7E3EE',
    borderRadius: 17,
    backgroundColor: 'rgba(255, 252, 247, 0.97)',
    transform: [{ rotate: '-0.7deg' }],
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  previewCopy: {
    flex: 1,
  },
  previewLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  previewTitle: {
    marginTop: 3,
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displaySemibold,
    fontSize: typography.fontSize.sm,
  },
  previewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: '#E7F8F1',
  },
  previewStatusDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  previewStatusText: {
    color: '#087A58',
    fontFamily: typography.fontFamily.bold,
    fontSize: 8,
  },
  previewBottomRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  previewAvatar: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceWarm,
    borderRadius: radius.full,
    backgroundColor: '#E7F0FB',
  },
  previewAvatarOverlap: {
    marginLeft: -7,
  },
  previewAvatarText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
  },
  previewAvatarMore: {
    color: '#516A82',
    fontFamily: typography.fontFamily.bold,
    fontSize: 9,
  },
  commonDatesBadge: {
    flex: 1,
    maxWidth: 185,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  commonDatesDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  commonDatesText: {
    flexShrink: 1,
    color: '#087A58',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    textAlign: 'right',
  },
  paperQuestion: {
    position: 'absolute',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E7BF68',
    borderRadius: 7,
    backgroundColor: '#FFE6A4',
    transform: [{ rotate: '-5deg' }],
  },
  desktopQuestion: {
    top: 24,
    left: 4,
  },
  mobileQuestion: {
    top: 132,
    left: spacing.lg,
  },
  questionPin: {
    position: 'absolute',
    top: -5,
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: '#D79822',
  },
  paperQuestionText: {
    color: '#754C08',
    fontFamily: typography.fontFamily.displaySemibold,
    fontSize: typography.fontSize.xs,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.23)',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  eyebrowLight: {
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    color: '#DCEBFA',
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1,
  },
  eyebrowTextLight: {
    color: colors.primary,
  },
  desktopHeroTitle: {
    maxWidth: 430,
    color: colors.surface,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  desktopHeroSubtitle: {
    maxWidth: 370,
    color: '#C5D5E4',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryAction: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceWarm,
  },
  primaryActionText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.md,
  },
  loginAction: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginActionText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
  brand: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
  },
  brandIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
    transform: [{ rotate: '-4deg' }],
  },
  brandIconLight: {
    backgroundColor: '#E7F0FB',
  },
  brandIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  brandName: {
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 27,
    letterSpacing: -0.8,
  },
  brandNameInverted: {
    color: colors.surface,
  },
  brandNameCompact: {
    fontSize: typography.fontSize.lg,
  },
  brandTagline: {
    marginTop: 2,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
  mobileShell: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  mobileVisual: {
    position: 'relative',
    overflow: 'hidden',
    padding: spacing.xl,
    backgroundColor: colors.brandDark,
  },
  mobileGlobe: {
    position: 'absolute',
    top: 63,
    left: '-9%',
    width: '118%',
    height: 340,
    opacity: 0.9,
  },
  mobilePreviewPosition: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 36,
    left: spacing.lg,
  },
  mobileSheet: {
    minHeight: 405,
    overflow: 'hidden',
    marginTop: -25,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.surfaceWarm,
  },
  mobileSheetImage: {
    opacity: 0.43,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: '#C9D6E2',
  },
  mobileHeading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  mobileTitle: {
    maxWidth: 350,
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  mobileSubtitle: {
    maxWidth: 350,
    color: '#4E6479',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
  mobileFlow: {
    marginVertical: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFlowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileFlowStep: {
    position: 'relative',
    width: 72,
    alignItems: 'center',
    gap: 5,
  },
  mobileFlowIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(222, 236, 249, 0.92)',
  },
  mobileStepNumber: {
    position: 'absolute',
    top: 40,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  mobileStepNumberText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
  },
  mobileFlowLabel: {
    marginTop: 7,
    color: colors.brandDark,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
  },
  flowConnector: {
    width: 29,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowConnectorLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#89A5BF',
    borderStyle: 'dashed',
  },
  mobileActions: {
    maxWidth: '100%',
  },
  mobilePrimaryAction: {
    backgroundColor: colors.primary,
  },
  mobilePrimaryActionText: {
    color: colors.surface,
  },
  mobileLoginActionText: {
    color: colors.brandDark,
  },
  pressed: {
    opacity: 0.74,
  },
});