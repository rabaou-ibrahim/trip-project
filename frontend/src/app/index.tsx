import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DesktopTripCard } from '@/components/home/DesktopTripCard';
import { MobileCompactTripCard } from '@/components/home/MobileCompactTripCard';
import { MobileHeroTripCard } from '@/components/home/MobileHeroTripCard';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [activeTripIndex, setActiveTripIndex] = useState(0);

  const isDesktop = width >= 1024;
  const mobileCardWidth = width - 40;

  const ongoingTrips = [
    {
      id: 1,
      title: 'Japon été 2027',
      startDate: '2027-07-15',
      endDate: '2027-07-20',
      selectedDestination: {
        id: 1,
        city: 'Tokyo',
        country: 'Japan',
      },
      participantCount: 5,
      progress: 67,
    },
    {
      id: 102,
      title: 'Thaïlande 2027',
      startDate: '2027-02-10',
      endDate: '2027-02-26',
      selectedDestination: {
        id: 4,
        city: 'Bangkok',
        country: 'Thailand',
      },
      participantCount: 6,
      progress: 30,
    },
    {
      id: 103,
      title: 'Séjour au Portugal',
      startDate: '2027-05-08',
      endDate: '2027-05-15',
      selectedDestination: {
        id: 5,
        city: 'Porto',
        country: 'Portugal',
      },
      participantCount: 5,
      progress: 52,
    },
  ];

  function handleCarouselScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const offset = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offset / (mobileCardWidth + 12));

    setActiveTripIndex(
      Math.max(0, Math.min(nextIndex, ongoingTrips.length - 1)),
    );
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <View style={styles.sidebar}>
          <View>
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>✈</Text>
              </View>

              <Text style={styles.logo}>
                TripProject
              </Text>
            </View>

            <View style={styles.sidebarNavigation}>
              <View style={styles.navItemActive}>
                <Text style={styles.navIconActive}>⌂</Text>
                <Text style={styles.sidebarItemActive}>Accueil</Text>
              </View>

              <View style={styles.navItem}>
                <Text style={styles.navIcon}>✈</Text>
                <Text style={styles.sidebarItem}>Voyages</Text>
              </View>

              <View style={styles.navItem}>
                <Text style={styles.navIcon}>✉</Text>
                <Text style={styles.sidebarItem}>Invitations</Text>
              </View>

              <View style={styles.navItem}>
                <Text style={styles.navIcon}>◉</Text>
                <Text style={styles.sidebarItem}>Profil</Text>
              </View>

              <View style={styles.navItem}>
                <Text style={styles.navIcon}>⚙</Text>
                <Text style={styles.sidebarItem}>Paramètres</Text>
              </View>
            </View>
          </View>

          <View style={styles.sidebarBottom}>
            <View style={styles.logoutRow}>
              <Text style={styles.navIcon}>↪</Text>
              <Text style={styles.sidebarItem}>Déconnexion</Text>
            </View>

            <View style={styles.sidebarFooter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>I</Text>
              </View>

              <View>
                <Text style={styles.profileName}>Ibrahim</Text>
                <Text style={styles.profileHint}>Mon profil</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.desktopContent}
          contentContainerStyle={styles.desktopContentInner}
        >
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                Bonjour Ibrahim 👋
              </Text>

              <Text style={styles.heroSubtitle}>
                Voici vos projets de voyage
              </Text>

              <View style={styles.heroAction}>
                <Button
                  label="+ Créer un voyage"
                  onPress={() => {
                    console.log('Create trip');
                  }}
                />
              </View>
            </View>
          </View>

          <View style={styles.desktopMain}>
            <View style={styles.desktopTripsColumn}>
              <View style={styles.desktopGrid}>
                <DesktopTripCard
                  title="Japon été 2027"
                  startDate="2027-07-15"
                  endDate="2027-07-20"
                  selectedDestination={{
                    id: 1,
                    city: 'Tokyo',
                    country: 'Japan',
                  }}
                  participantCount={5}
                  currentStep="Votes en cours"
                  progress={67}
                  onPress={() => {
                    console.log('Open Japan');
                  }}
                />

                <DesktopTripCard
                  title="Week-end à Lisbonne"
                  startDate="2026-10-12"
                  endDate="2026-10-14"
                  selectedDestination={{
                    id: 2,
                    city: 'Lisbonne',
                    country: 'Portugal',
                  }}
                  participantCount={4}
                  currentStep="Hébergement"
                  progress={40}
                  onPress={() => {
                    console.log('Open Lisbon');
                  }}
                />

                <DesktopTripCard
                  title="Roadtrip Italie"
                  startDate="2026-09-03"
                  endDate="2026-09-10"
                  selectedDestination={{
                    id: 3,
                    city: 'Rome',
                    country: 'Italy',
                  }}
                  participantCount={4}
                  currentStep="Disponibilités"
                  progress={25}
                  onPress={() => {
                    console.log('Open Italy');
                  }}
                />

                <DesktopTripCard
                  title="Thaïlande 2027"
                  startDate="2027-02-10"
                  endDate="2027-02-26"
                  selectedDestination={{
                    id: 4,
                    city: 'Bangkok',
                    country: 'Thailand',
                  }}
                  participantCount={6}
                  currentStep="Destinations"
                  progress={30}
                  onPress={() => {
                    console.log('Open Thailand');
                  }}
                />
              </View>
            </View>

            <View style={styles.desktopAside}>
              <View style={styles.asideCard}>
                <Text style={styles.asideLabel}>
                  Résumé rapide
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>◷</Text>
                  <View>
                    <Text style={styles.summaryValue}>À venir</Text>
                    <Text style={styles.summaryMeta}>2 voyages</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>◉</Text>
                  <View>
                    <Text style={styles.summaryValue}>En cours</Text>
                    <Text style={styles.summaryMeta}>2 voyages</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryIcon}>✓</Text>
                  <View>
                    <Text style={styles.summaryValue}>Terminés</Text>
                    <Text style={styles.summaryMeta}>1 voyage</Text>
                  </View>
                </View>
              </View>

              <View style={styles.asideCard}>
                <Text style={styles.asideLabel}>
                  Prochaine action
                </Text>

                <Text style={styles.asideTitle}>
                  Japon été 2027
                </Text>

                <Text style={styles.asideText}>
                  3 votes en attente
                </Text>

                <Text style={styles.asideLink}>
                  Voir le projet →
                </Text>
              </View>

              <View style={styles.asideCard}>
                <Text style={styles.asideLabel}>
                  Astuce du jour ✨
                </Text>

                <Text style={styles.asideText}>
                  Invitez vos amis pour trouver plus facilement des périodes communes.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage}>
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.mobileHeader}>
      <View style={styles.mobileHeading}>
        <Text style={styles.mobileTitle}>
          Bonjour Ibrahim 👋
        </Text>

        <Text style={styles.mobileSubtitle}>
          Vos projets de voyage
        </Text>
      </View>

      <Pressable
        onPress={() => {
          console.log('Open notifications');
        }}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir les notifications"
        style={({ pressed }) => [
          styles.notificationButton,
          pressed && styles.notificationButtonPressed,
        ]}
      >
        <Ionicons
          name="notifications-outline"
          size={23}
          color={colors.textPrimary}
        />

        <View style={styles.notificationDot} />
      </Pressable>
    </View>

      <View style={styles.mobileSection}>
        <Text style={styles.sectionTitle}>
          En cours
        </Text>

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
              style={[
                styles.carouselItem,
                { width: mobileCardWidth },
              ]}
            >
              <MobileHeroTripCard
                title={trip.title}
                startDate={trip.startDate}
                endDate={trip.endDate}
                selectedDestination={trip.selectedDestination}
                participantCount={trip.participantCount}
                progress={trip.progress}
                onPress={() => {
                  console.log(`Open trip ${trip.id}`);
                }}
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
        <Text style={styles.sectionTitle}>
          À venir
        </Text>

        <MobileCompactTripCard
          title="Week-end à Lisbonne"
          startDate="2026-10-12"
          endDate="2026-10-14"
          selectedDestination={{
            id: 2,
            city: 'Lisbonne',
            country: 'Portugal',
          }}
          participantCount={4}
          onPress={() => {
            console.log('Open Lisbon trip');
          }}
        />

        <MobileCompactTripCard
          title="Roadtrip Italie"
          startDate="2026-09-03"
          endDate="2026-09-10"
          selectedDestination={{
            id: 3,
            city: 'Rome',
            country: 'Italy',
          }}
          participantCount={4}
          onPress={() => {
            console.log('Open Italy trip');
          }}
        />
      </View>

      </ScrollView>

      <View style={styles.bottomNavigation}>
        <BottomNavigationItem
          label="Accueil"
          active
          icon="home"
        />

        <BottomNavigationItem
          label="Voyages"
          icon="people-outline"
        />

        <Pressable
          onPress={() => {
            console.log('Create trip');
          }}
          accessibilityRole="button"
          accessibilityLabel="Créer un voyage"
          style={({ pressed }) => [
            styles.createTripButton,
            pressed && styles.bottomItemPressed,
          ]}
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
        />
      </View>
    </View>
  );
}

type BottomNavigationItemProps = {
  label: string;
  active?: boolean;
  badge?: number;
  icon: ComponentProps<typeof Ionicons>['name'];
};

function BottomNavigationItem({
  label,
  active = false,
  badge,
  icon,
}: BottomNavigationItemProps) {
  const tintColor = active ? colors.primary : '#64748B';

  return (
    <Pressable
      onPress={() => {
        console.log(`Open ${label}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.bottomNavigationItem,
        pressed && styles.bottomItemPressed,
      ]}
    >
      <View style={styles.bottomIconContainer}>
        <Ionicons
          name={icon}
          size={22}
          color={tintColor}
        />

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
    backgroundColor: colors.background,
  },

  sidebar: {
    width: 260,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    backgroundColor: '#0F2742',
    justifyContent: 'space-between',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    transform: [{ rotate: '-15deg' }],
  },

  logo: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },

  sidebarNavigation: {
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },

  navItem: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  navItemActive: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  navIcon: {
    width: 22,
    color: '#8EA4BA',
    fontSize: 17,
    textAlign: 'center',
  },

  navIconActive: {
    width: 22,
    color: '#FFFFFF',
    fontSize: 17,
    textAlign: 'center',
  },

  sidebarItem: {
    color: '#AFC0D0',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },

  sidebarItemActive: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },

  sidebarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  profileHint: {
    marginTop: 2,
    color: '#8EA4BA',
    fontSize: typography.fontSize.xs,
  },

  desktopContent: {
    flex: 1,
  },

  desktopContentInner: {
    width: '100%',
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },

  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xxxl,
  },

  heading: {
    maxWidth: 620,
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.md,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
  },

  desktopMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xxl,
  },

  desktopTripsColumn: {
    flex: 1,
    gap: spacing.lg,
  },

  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },

  desktopAside: {
    width: 300,
    gap: spacing.lg,
  },

  asideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },

  asideLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  asideTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },

  asideText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },

  mobileScroll: {
    flex: 1,
  },

  mobileContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 30,
  },

  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },

  mobileHeading: {
    flex: 1,
  },

  mobileTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: -0.35,
    lineHeight: 28,
  },

  mobileSubtitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
  },

  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',
    borderRadius: radius.full,
  },

  notificationButtonPressed: {
    opacity: 0.7,
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,

    width: 7,
    height: 7,

    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
    borderRadius: radius.full,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: -0.15,
  },

  mobileSection: {
    gap: 13,
  },

  carouselDots: {
    minHeight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  carouselContent: {
    gap: 12,
  },

  carouselItem: {
    flexShrink: 0,
  },

  carouselDot: {
    width: 7,
    height: 7,
    backgroundColor: '#D6DFEA',
    borderRadius: radius.full,
  },

  carouselDotActive: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
  },

  bottomNavigation: {
    minHeight: 82,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 9,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',

    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#DDE5EF',
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

  bottomItemPressed: {
    opacity: 0.72,
  },

  createTripButton: {
    width: 60,
    height: 60,
    marginHorizontal: 4,
    marginTop: -25,
    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary,
    borderWidth: 5,
    borderColor: colors.surface,
    borderRadius: radius.full,
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

    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.full,
  },

  bottomBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },

  hero: {
    position: 'relative',
    minHeight: 125,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

heroText: {
  zIndex: 2,
},

heroTitle: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.xxl,
  fontFamily: typography.fontFamily.bold,
},

heroSubtitle: {
  marginTop: spacing.sm,
  color: colors.textSecondary,
  fontSize: typography.fontSize.md,
},

heroAction: {
  marginTop: spacing.lg,
  alignSelf: 'flex-start',
},

asideLink: {
  color: colors.primary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.semibold,
},

summaryRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
},

summaryIcon: {
  width: 22,
  color: colors.primary,
  fontSize: 16,
  textAlign: 'center',
},

summaryValue: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.medium,
},

summaryMeta: {
  marginTop: 2,
  color: colors.textMuted,
  fontSize: typography.fontSize.xs,
},

sidebarBottom: {
  gap: spacing.lg,
},

logoutRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
},
});