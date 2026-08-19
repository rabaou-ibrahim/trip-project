import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { MobileHeroTripCard } from '@/components/home/MobileHeroTripCard';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { TripProjectFormModal } from '@/components/trip-project/TripProjectFormModal';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/services/apiClient';
import { getTripProjects } from '@/services/tripProjectService';
import { colors, radius, spacing, typography } from '@/theme';
import type { TripProjectListItem } from '@/types/tripProject';
import { MobileAppHeader } from '@/components/navigation/MobileAppHeader';

const mapBackground = require('../../assets/images/trip-map-background-v2.png');

export default function HomeScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { width } = useWindowDimensions();
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [tripProjects, setTripProjects] = useState<TripProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isDesktop = width >= 1024;
  const showDesktopRoute = width >= 1350;
  const mobileCardWidth = width - 40;
  const displayedName = user?.firstname || user?.username || 'Utilisateur';
  const highlightedTrips = useMemo(
    () => tripProjects.slice(0, 3),
    [tripProjects],
  );
  const otherTrips = useMemo(
    () => tripProjects.slice(highlightedTrips.length),
    [highlightedTrips.length, tripProjects],
  );
  const displayedTrips = useMemo(() => {
    if (activeTab === 'completed') {
      return tripProjects.filter((trip) => {
        const status = trip.status.trim().toLowerCase();

        return status === 'completed';
      });
    }

    return tripProjects.filter((trip) => {
      const status = trip.status.trim().toLowerCase();

      return status !== 'completed';
    });
  }, [activeTab, tripProjects]);
  const featuredTrip = tripProjects[0] ?? null;

  const loadTripProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const projects = await getTripProjects();
      setTripProjects(projects);
      setActiveTripIndex(0);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }

      setErrorMessage(getTripProjectErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [router, signOut]);

  useEffect(() => {
    void loadTripProjects();
  }, [loadTripProjects]);

  function handleCarouselScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const offset = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offset / (mobileCardWidth + 12));

    setActiveTripIndex(
      Math.max(0, Math.min(nextIndex, highlightedTrips.length - 1)),
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
        <DesktopSidebar activeItem="trips" />

        <View style={styles.desktopWorkspace}>
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopContentInner}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.desktopTopBar}>
              <View style={styles.desktopHeading}>
                <Text style={styles.desktopTitle}>Mes voyages</Text>

                <Text style={styles.desktopSubtitle}>
                  Retrouvez et organisez tous vos projets de voyage.
                </Text>
              </View>

              <View style={styles.desktopTopActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Rechercher"
                  style={({ pressed }) => [
                    styles.desktopIconButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.textPrimary}
                  />
                </Pressable>

                <Pressable
                  onPress={() => router.push('/profile')}
                  accessibilityRole="button"
                  accessibilityLabel="Ouvrir le profil"
                  style={({ pressed }) => [
                    styles.desktopAvatar,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.desktopAvatarText}>
                    {(user?.firstname || user?.username || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.desktopToolbar}>
              <View style={styles.desktopTabs}>
              <Pressable
                onPress={() => setActiveTab('upcoming')}
                style={[
                  styles.desktopTab,
                  activeTab === 'upcoming' && styles.desktopTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.desktopTabText,
                    activeTab === 'upcoming' && styles.desktopTabTextActive,
                  ]}
                >
                  À venir
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('completed')}
                style={[
                  styles.desktopTab,
                  activeTab === 'completed' && styles.desktopTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.desktopTabText,
                    activeTab === 'completed' && styles.desktopTabTextActive,
                  ]}
                >
                  Terminés
                </Text>
              </Pressable>
            </View>

              <Pressable
                onPress={() => setIsCreateModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Créer un nouveau voyage"
                style={({ pressed }) => [
                  styles.desktopNewTripButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="add" size={19} color="#FFFFFF" />

                <Text style={styles.desktopNewTripButtonText}>
                  Nouveau voyage
                </Text>
              </Pressable>
            </View>

            {isLoading ? (
              <HomeFeedback mode="loading" />
            ) : errorMessage ? (
              <HomeFeedback
                mode="error"
                message={errorMessage}
                onRetry={() => void loadTripProjects()}
              />
            ) : tripProjects.length === 0 ? (
              <HomeFeedback
                mode="empty"
                message="Vous n’avez encore aucun projet de voyage."
              />
            ) : (
              <View style={styles.desktopListArea}>
                {displayedTrips.length === 0 ? (
                <View style={styles.desktopEmptyTab}>
                  <Ionicons
                    name="airplane-outline"
                    size={30}
                    color={colors.textMuted}
                  />

                  <Text style={styles.desktopEmptyTabTitle}>
                    {activeTab === 'completed'
                      ? 'Aucun voyage terminé'
                      : 'Aucun voyage à venir'}
                  </Text>
                </View>
              ) : (
                <View style={styles.desktopTripsGrid}>
                 
                </View>
              )}
              </View>
            )}
          </ScrollView>
        </View>

        <TripProjectFormModal
          visible={isCreateModalOpen}
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={async () => {
            setIsCreateModalOpen(false);
            await loadTripProjects();
          }}
        />
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
          <MobileAppHeader
            avatarLabel={(user?.firstname || user?.username || 'U')
              .charAt(0)
              .toUpperCase()}
            onMenuPress={() => console.log('Ouvrir le menu')}
            onSearchPress={() => console.log('Rechercher')}
            onProfilePress={() => router.push('/profile')}
          />

          <View style={styles.mobilePageHeading}>
            <Text style={styles.mobilePageTitle}>Mes voyages</Text>
          </View>

          <View style={styles.mobileTabs}>
            <Pressable
              onPress={() => setActiveTab('upcoming')}
              style={[
                styles.mobileTab,
                activeTab === 'upcoming' && styles.mobileTabActive,
              ]}
            >
              <Text
                style={[
                  styles.mobileTabText,
                  activeTab === 'upcoming' && styles.mobileTabTextActive,
                ]}
              >
                À venir
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('completed')}
              style={[
                styles.mobileTab,
                activeTab === 'completed' && styles.mobileTabActive,
              ]}
            >
              <Text
                style={[
                  styles.mobileTabText,
                  activeTab === 'completed' && styles.mobileTabTextActive,
                ]}
              >
                Terminés
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <HomeFeedback mode="loading" />
          ) : errorMessage ? (
            <HomeFeedback
              mode="error"
              message={errorMessage}
              onRetry={() => void loadTripProjects()}
            />
          ) : tripProjects.length === 0 ? (
            <HomeFeedback
              mode="empty"
              message="Vous n’avez encore aucun projet de voyage."
            />
          ) : (
            <View style={styles.mobileTripsList}>
              {displayedTrips.length === 0 ? (
                <View style={styles.mobileEmptyTab}>
                  <View style={styles.mobileEmptyTabIcon}>
                    <Ionicons
                      name={
                        activeTab === 'completed'
                          ? 'checkmark-circle-outline'
                          : 'airplane-outline'
                      }
                      size={30}
                      color={colors.textMuted}
                    />
                  </View>

                  <Text style={styles.mobileEmptyTabTitle}>
                    {activeTab === 'completed'
                      ? 'Aucun voyage terminé'
                      : 'Aucun voyage à venir'}
                  </Text>

                  <Text style={styles.mobileEmptyTabText}>
                    {activeTab === 'completed'
                      ? 'Vos voyages terminés apparaîtront ici.'
                      : 'Créez un voyage pour commencer à organiser votre prochaine aventure.'}
                  </Text>
                </View>
              ) : (
                displayedTrips.map((trip) => (
                  <MobileCompactTripCard
                    key={trip.id}
                    title={trip.title}
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    selectedDestination={trip.selectedDestination}
                    participantCount={trip.participantCount}
                    participantsPreview={trip.participantsPreview}
                    status={trip.status}
                    onPress={() => openTripProject(trip.id)}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'upcoming' && (
          <Pressable
            onPress={() => setIsCreateModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Créer un nouveau voyage"
            style={({ pressed }) => [
              styles.mobileNewTripButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.mobileNewTripButtonText}>
              Nouveau voyage
            </Text>
          </Pressable>
        )}
        </ScrollView>
      </ImageBackground>

      <MobileBottomNavigation activeItem="trips" />
      <TripProjectFormModal
        visible={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          setIsCreateModalOpen(false);
          await loadTripProjects();
        }}
      />
    </View>
  );
}

function HomeFeedback({
  mode,
  message,
  onRetry,
}: {
  mode: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackIcon}>
        {mode === 'loading' ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={mode === 'empty' ? 'map-outline' : 'cloud-offline-outline'}
            size={25}
            color={colors.primary}
          />
        )}
      </View>

      <Text style={styles.feedbackTitle}>
        {mode === 'loading'
          ? 'Chargement de vos projets…'
          : mode === 'empty'
            ? 'Votre prochain voyage commence ici'
            : 'Impossible de charger vos projets'}
      </Text>

      {message && <Text style={styles.feedbackMessage}>{message}</Text>}

      {mode === 'error' && onRetry && (
        <Button label="Réessayer" onPress={onRetry} />
      )}
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

function formatProjectStatus(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Projet en préparation',
    active: 'Préparation en cours',
    in_progress: 'Préparation en cours',
    ready: 'Voyage prêt',
    completed: 'Projet terminé',
    cancelled: 'Projet annulé',
  };

  return labels[status.trim().toLowerCase()] ?? `Statut : ${status}`;
}

function formatProjectCount(count: number): string {
  return `${count} projet${count > 1 ? 's' : ''}`;
}

function getTripProjectErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Le serveur est injoignable. Vérifiez votre connexion.';
  }

  return 'Une erreur inattendue est survenue.';
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
    backgroundColor: '#F6F9FC',
  },

  desktopListArea: {
    width: '100%',
    maxWidth: 920,
  },

  desktopWorkspace: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  desktopContent: {
    flex: 1,
  },

  desktopTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  desktopHeading: {
    gap: 4,
  },

  desktopContentInner: {
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    paddingHorizontal: 44,
    paddingTop: 36,
    paddingBottom: 56,
  },

  title: {
    marginTop: 10,
    color: '#1A1C23',
    fontSize: 34,
    lineHeight: 40,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.7,
  },

  desktopTitle: {
    color: '#1A1C23',
    fontSize: 36,
    lineHeight: 42,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.8,
  },

  desktopSubtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: typography.fontFamily.regular,
  },

  desktopTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  desktopIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7EF',
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
  },

  desktopAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  desktopAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },

  desktopToolbar: {
    minHeight: 52,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBF2',
  },

  desktopTabs: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },

  desktopTab: {
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },

  desktopTabActive: {
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  desktopTabText: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },

  desktopTabTextActive: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopNewTripButton: {
    marginBottom: 8,
    minHeight: 42,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },

  desktopNewTripButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  feedbackCard: {
    width: '100%',
    minHeight: 260,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E0D3C1',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 253, 248, 0.9)',
  },
  feedbackIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#EAF2FB',
  },
  feedbackTitle: {
    color: colors.brandDark,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.displayBold,
    textAlign: 'center',
  },
  feedbackMessage: {
    maxWidth: 440,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  
  noteFrame: {
    position: 'relative',
  },

  noteOffset: {
    display: 'none',
  },

  note: {
    position: 'relative',
    gap: 12,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',

    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  noteBlue: {
    borderColor: '#DCE8F5',
    backgroundColor: '#F8FBFF',
  },

  noteYellow: {
    borderColor: '#F1D785',
    backgroundColor: '#FFF9E7',
  },

  noteHandwriting: {
    paddingRight: 24,
    color: '#1E5F9B',
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
    fontStyle: 'normal',
  },

  notePin: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: '#FFB300',
  },
  
  summaryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.md 
  },

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
  mobilePage: {
  flex: 1,
  overflow: 'hidden',
  backgroundColor: '#F8FAFC',
},

mobileBackdrop: {
  flex: 1,
},

mobileBackdropImage: {
  opacity: 0,
},

mobileScroll: {
  flex: 1,
  minHeight: 0,
},

mobileContent: {
  flexGrow: 1,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 88,
},

mobilePageHeading: {
  marginBottom: 22,
},

mobilePageTitle: {
  color: '#1A1C23',
  fontSize: 24,
  lineHeight: 29,
  fontFamily: typography.fontFamily.displayBold,
  letterSpacing: -0.4,
},

mobileTabs: {
  flexDirection: 'row',
  marginBottom: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#E6ECF3',
},

mobileTab: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 10,
},

mobileEmptyTab: {
  width: '100%',
  minHeight: 220,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
},

mobileEmptyTabIcon: {
  width: 58,
  height: 58,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
  borderRadius: radius.full,
  backgroundColor: '#EEF3F8',
},

mobileEmptyTabTitle: {
  color: colors.textPrimary,
  fontSize: 17,
  fontFamily: typography.fontFamily.semibold,
  textAlign: 'center',
},

mobileEmptyTabText: {
  maxWidth: 290,
  marginTop: 6,
  color: colors.textSecondary,
  fontSize: 12.5,
  lineHeight: 18,
  fontFamily: typography.fontFamily.regular,
  textAlign: 'center',
},

mobileTabActive: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 2,
  borderBottomColor: colors.primary,
},

mobileTabText: {
  color: colors.textSecondary,
  fontSize: 11,
  fontFamily: typography.fontFamily.medium,
},

mobileTabTextActive: {
  color: colors.primary,
  fontSize: 11,
  fontFamily: typography.fontFamily.semibold,
},

mobileTripsList: {
  gap: 10,
},

mobileNewTripButton: {
  alignSelf: 'center',
  marginTop: 16,
  minHeight: 42,
  paddingHorizontal: 18,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  borderRadius: radius.full,
  backgroundColor: colors.primary,
},

mobileNewTripButtonText: {
  color: '#FFFFFF',
  fontSize: 11.5,
  fontFamily: typography.fontFamily.semibold,
},

bottomNavigation: {
  minHeight: 68,
  paddingHorizontal: 16,
  paddingTop: 7,
  paddingBottom: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  borderTopWidth: 1,
  borderTopColor: '#E7EDF5',
  backgroundColor: '#FFFFFF',
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
  carouselContent: { 
    gap: 12 
  },
  carouselItem: { 
    flexShrink: 0 
  },
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

  desktopTripsGrid: {
    width: '100%',
    maxWidth: 1080,
    gap: 18,
  },

  desktopTripCell: {
    width: '100%',
  },

  desktopEmptyTab: {
    width: '100%',
    maxWidth: 1040,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  desktopEmptyTabTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
  },

  carouselDotActive: { 
    width: 18, backgroundColor: colors.primary 
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
  pressed: { 
    opacity: 0.72 
  },
});
