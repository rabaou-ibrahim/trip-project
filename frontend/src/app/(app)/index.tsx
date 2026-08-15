import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import {
  ImageBackground,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { DesktopTripCard } from '@/components/home/DesktopTripCard';
import { MobileCompactTripCard } from '@/components/home/MobileCompactTripCard';
import { MobileHeroTripCard } from '@/components/home/MobileHeroTripCard';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';

const mapBackground = require('../../assets/images/trip-map-background-v2.png');

type SelectedDestination = {
  id: number;
  city: string;
  country: string;
};

type TripPreview = {
  id: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  selectedDestination: SelectedDestination | null;
  participantCount: number;
  currentStep: string;
  progress: number;
};

const trips: TripPreview[] = [
  {
    id: 1,
    title: 'Japon été 2027',
    startDate: '2027-07-15',
    endDate: '2027-07-20',
    selectedDestination: { id: 1, city: 'Tokyo', country: 'Japan' },
    participantCount: 5,
    currentStep: 'Votes en cours',
    progress: 67,
  },
  {
    id: 2,
    title: 'Week-end à Lisbonne',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    selectedDestination: { id: 2, city: 'Lisbonne', country: 'Portugal' },
    participantCount: 4,
    currentStep: 'Hébergement',
    progress: 40,
  },
  {
    id: 3,
    title: 'Roadtrip Italie',
    startDate: '2026-09-03',
    endDate: '2026-09-10',
    selectedDestination: { id: 3, city: 'Rome', country: 'Italy' },
    participantCount: 4,
    currentStep: 'Disponibilités',
    progress: 25,
  },
  {
    id: 4,
    title: 'Thaïlande 2027',
    startDate: '2027-02-10',
    endDate: '2027-02-26',
    selectedDestination: { id: 4, city: 'Bangkok', country: 'Thailand' },
    participantCount: 6,
    currentStep: 'Destinations',
    progress: 30,
  },
];

const ongoingTrips: TripPreview[] = [
  trips[0],
  trips[3],
  {
    id: 103,
    title: 'Séjour au Portugal',
    startDate: '2027-05-08',
    endDate: '2027-05-15',
    selectedDestination: { id: 5, city: 'Porto', country: 'Portugal' },
    participantCount: 5,
    currentStep: 'Périodes communes',
    progress: 52,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [activeTripIndex, setActiveTripIndex] = useState(0);

  const isDesktop = width >= 1024;
  const showDesktopRoute = width >= 1350;
  const mobileCardWidth = width - 40;
  const displayedName = user?.firstname || user?.username || 'Ibrahim';

  function handleCarouselScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const offset = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offset / (mobileCardWidth + 12));

    setActiveTripIndex(
      Math.max(0, Math.min(nextIndex, ongoingTrips.length - 1)),
    );
  }

  function openTripProject(id: number) {
    router.push({
      pathname: '/trip-projects/[id]',
      params: { id: String(id) },
    });
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="home" />

        <ImageBackground
          source={mapBackground}
          resizeMode="cover"
          style={styles.desktopBackdrop}
          imageStyle={styles.backdropImage}
        >
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopContentInner}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.heroText}>
                <View style={styles.eyebrow}>
                  <View style={styles.eyebrowDot} />
                  <Text style={styles.eyebrowText}>VOS PROJETS DE VOYAGE</Text>
                </View>

                <Text style={styles.heroTitle}>
                  Bonjour {displayedName} 👋
                </Text>
                <Text style={styles.heroSubtitle}>
                  Retrouvez votre groupe et la prochaine décision à prendre.
                </Text>

                <View style={styles.heroAction}>
                  <Button
                    label="+ Créer un voyage"
                    onPress={() => console.log('Create trip')}
                  />
                </View>
              </View>

              {showDesktopRoute && (
                <View pointerEvents="none" style={styles.heroRoute}>
                  <View style={styles.routeStart} />
                  <View style={styles.routeLine} />
                  <Ionicons
                    name="paper-plane-outline"
                    size={24}
                    color="#7CA5D1"
                  />
                </View>
              )}
            </View>

            <View style={styles.desktopMain}>
              <View style={styles.desktopTripsColumn}>
                <DesktopTripCard
                  featured
                  {...trips[0]}
                  onPress={() => openTripProject(trips[0].id)}
                />

                <View style={styles.desktopSecondaryGrid}>
                  {trips.slice(1).map((trip) => (
                    <DesktopTripCard
                      key={trip.id}
                      {...trip}
                      onPress={() => openTripProject(trip.id)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.desktopAside}>
                <PaperNote tone="blue">
                  <Text style={styles.noteHandwriting}>Résumé rapide</Text>
                  <SummaryRow icon="time-outline" label="À venir" value="2 voyages" />
                  <SummaryRow
                    icon="navigate-circle-outline"
                    label="En cours"
                    value="2 voyages"
                  />
                  <SummaryRow
                    icon="checkmark-circle-outline"
                    label="Terminés"
                    value="1 voyage"
                  />
                </PaperNote>

                <PaperNote tone="paper">
                  <Text style={styles.noteHandwriting}>Prochaine action</Text>
                  <Text style={styles.asideTitle}>Japon été 2027</Text>
                  <Text style={styles.asideText}>3 votes en attente</Text>

                  <Pressable
                    onPress={() => openTripProject(1)}
                    accessibilityRole="button"
                    accessibilityLabel="Voir le projet Japon été 2027"
                    style={({ pressed }) => [
                      styles.asideLinkRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.asideLink}>Voir le projet</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </Pressable>
                </PaperNote>

                <PaperNote tone="yellow">
                  <Text style={styles.noteHandwriting}>Astuce du jour ✨</Text>
                  <Text style={styles.asideText}>
                    Invitez vos amis pour trouver plus facilement des périodes
                    communes.
                  </Text>
                </PaperNote>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage}>
      <ImageBackground
        source={mapBackground}
        resizeMode="cover"
        style={styles.mobileBackdrop}
        imageStyle={styles.mobileBackdropImage}
      >
        <ScrollView
          style={styles.mobileScroll}
          contentContainerStyle={styles.mobileContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mobileHeader}>
            <View style={styles.mobileHeading}>
              <View style={styles.mobileEyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.mobileEyebrowText}>VOS VOYAGES</Text>
              </View>
              <Text style={styles.mobileTitle}>
                Bonjour {displayedName} 👋
              </Text>
              <Text style={styles.mobileSubtitle}>
                Votre groupe, vos dates, votre prochaine décision.
              </Text>
            </View>

            <Pressable
              onPress={() => console.log('Open notifications')}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir les notifications"
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.brandDark}
              />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.mobileSection}>
            <SectionHeading title="En cours" detail="3 projets" />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={mobileCardWidth + 12}
              snapToAlignment="start"
              disableIntervalMomentum
              onScroll={handleCarouselScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.carouselContent}
            >
              {ongoingTrips.map((trip) => (
                <View
                  key={trip.id}
                  style={[styles.carouselItem, { width: mobileCardWidth }]}
                >
                  <MobileHeroTripCard
                    {...trip}
                    onPress={() => openTripProject(trip.id)}
                  />
                </View>
              ))}
            </ScrollView>

            <View
              style={styles.carouselDots}
              accessibilityLabel={`Projet ${activeTripIndex + 1} sur ${ongoingTrips.length}`}
            >
              {ongoingTrips.map((trip, index) => (
                <View
                  key={trip.id}
                  style={[
                    styles.carouselDot,
                    index === activeTripIndex && styles.carouselDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.mobileSection}>
            <SectionHeading title="À venir" detail="2 projets" />
            {trips.slice(1, 3).map((trip) => (
              <MobileCompactTripCard
                key={trip.id}
                {...trip}
                onPress={() => openTripProject(trip.id)}
              />
            ))}
          </View>
        </ScrollView>
      </ImageBackground>

      <View style={styles.bottomNavigation}>
        <BottomNavigationItem label="Accueil" active icon="home" />
        <BottomNavigationItem label="Voyages" icon="people-outline" />

        <Pressable
          onPress={() => console.log('Create trip')}
          accessibilityRole="button"
          accessibilityLabel="Créer un voyage"
          style={({ pressed }) => [styles.createTripButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={31} color="#FFFFFF" />
        </Pressable>

        <BottomNavigationItem
          label="Invitations"
          icon="notifications-outline"
          badge={2}
        />
        <BottomNavigationItem
          label="Profil"
          icon="person-circle-outline"
          onPress={() => router.push('/profile')}
        />
      </View>
    </View>
  );
}

function PaperNote({
  tone,
  children,
}: {
  tone: 'blue' | 'paper' | 'yellow';
  children: ReactNode;
}) {
  return (
    <View style={styles.noteFrame}>
      <View style={styles.noteOffset} />
      <View
        style={[
          styles.note,
          tone === 'blue' && styles.noteBlue,
          tone === 'yellow' && styles.noteYellow,
        ]}
      >
        <View style={styles.notePin} />
        {children}
      </View>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.summaryValue}>{label}</Text>
        <Text style={styles.summaryMeta}>{value}</Text>
      </View>
    </View>
  );
}

function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDetail}>{detail}</Text>
    </View>
  );
}

type BottomNavigationItemProps = {
  label: string;
  active?: boolean;
  badge?: number;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
};

function BottomNavigationItem({
  label,
  active = false,
  badge,
  icon,
  onPress,
}: BottomNavigationItemProps) {
  const tintColor = active ? colors.primary : '#64748B';

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        console.log(`Open ${label}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.bottomNavigationItem,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.bottomIconContainer}>
        <Ionicons name={icon} size={22} color={tintColor} />
        {typeof badge === 'number' && badge > 0 && (
          <View style={styles.bottomBadge}>
            <Text style={styles.bottomBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.bottomNavigationLabel,
          active && styles.bottomNavigationLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.backgroundWarm,
  },
  desktopBackdrop: { flex: 1 },
  backdropImage: { opacity: 0.58 },
  desktopContent: { flex: 1 },
  desktopContentInner: {
    width: '100%',
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  hero: {
    position: 'relative',
    minHeight: 170,
    overflow: 'hidden',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(178, 154, 114, 0.28)',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 253, 248, 0.78)',
  },
  heroText: { zIndex: 2, maxWidth: 680 },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  eyebrowText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: colors.brandDark,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.9,
  },
  heroSubtitle: {
    maxWidth: 560,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    fontFamily: typography.fontFamily.regular,
  },
  heroAction: { alignSelf: 'flex-start', marginTop: spacing.lg },
  heroRoute: {
    position: 'absolute',
    right: 30,
    top: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStart: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: '#9DC0E2',
    borderRadius: radius.full,
  },
  routeLine: {
    width: 220,
    marginHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderColor: '#9DC0E2',
    borderStyle: 'dashed',
  },
  desktopMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  desktopTripsColumn: { flex: 1, minWidth: 0, gap: spacing.lg },
  desktopSecondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  desktopAside: { width: 280, gap: spacing.lg },
  noteFrame: { position: 'relative' },
  noteOffset: {
    position: 'absolute',
    top: 7,
    right: -5,
    bottom: -7,
    left: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(123, 96, 53, 0.13)',
    transform: [{ rotate: '1deg' }],
  },
  note: {
    position: 'relative',
    gap: spacing.md,
    padding: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4D7C4',
    borderRadius: 8,
    backgroundColor: '#FFFDF8',
  },
  noteBlue: { borderColor: '#D3E0EC', backgroundColor: '#F8FBFD' },
  noteYellow: { borderColor: '#E9D18D', backgroundColor: '#FFF2BA' },
  notePin: {
    position: 'absolute',
    top: 9,
    right: 16,
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: '#C88A24',
  },
  noteHandwriting: {
    paddingRight: spacing.xl,
    color: '#37658F',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.displayBold,
    fontStyle: 'italic',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#EAF2FB',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  summaryMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  asideTitle: {
    color: colors.brandDark,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  asideText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
  asideLinkRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  asideLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  mobilePage: { flex: 1, backgroundColor: colors.backgroundWarm },
  mobileBackdrop: { flex: 1 },
  mobileBackdropImage: { opacity: 0.58 },
  mobileScroll: { flex: 1 },
  mobileContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 34,
    gap: 28,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  mobileHeading: { flex: 1 },
  mobileEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mobileEyebrowText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1.1,
  },
  mobileTitle: {
    color: colors.brandDark,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.55,
  },
  mobileSubtitle: {
    maxWidth: 280,
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: typography.fontFamily.regular,
  },
  notificationButton: {
    position: 'relative',
    width: 43,
    height: 43,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCCFBF',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 253, 248, 0.9)',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderWidth: 1.5,
    borderColor: colors.surfaceWarm,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  mobileSection: { gap: 13 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.brandDark,
    fontSize: 17,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.2,
  },
  sectionDetail: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  carouselContent: { gap: 12 },
  carouselItem: { flexShrink: 0 },
  carouselDots: {
    minHeight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  carouselDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: '#D4D4CD',
  },
  carouselDotActive: { width: 18, backgroundColor: colors.primary },
  bottomNavigation: {
    minHeight: 82,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 9,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#DED4C6',
    backgroundColor: colors.surfaceWarm,
  },
  bottomNavigationItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavigationLabel: {
    color: '#52657B',
    fontSize: 10.5,
    fontFamily: typography.fontFamily.medium,
  },
  bottomNavigationLabelActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },
  createTripButton: {
    width: 60,
    height: 60,
    marginHorizontal: 4,
    marginTop: -25,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: colors.surfaceWarm,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  bottomBadge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceWarm,
    borderRadius: radius.full,
    backgroundColor: '#EF4444',
  },
  bottomBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
  },
  pressed: { opacity: 0.72 },
});
