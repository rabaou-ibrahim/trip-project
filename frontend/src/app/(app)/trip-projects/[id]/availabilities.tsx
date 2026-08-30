import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  createAvailability,
  deleteAvailability,
  getAvailabilities,
  getCommonAvailabilities,
  updateAvailability,
  type Availability,
  type CommonAvailabilityPeriod,
} from '@/services/availabilityService';
import {
  completeAvailabilitiesStep,
  getTripProject,
} from '@/services/tripProjectService';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import { colors, radius, spacing, typography } from '@/theme';

type AvailabilityTab = 'mine' | 'common';

export default function TripProjectAvailabilitiesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<AvailabilityTab>('mine');

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [commonPeriods, setCommonPeriods] = useState<CommonAvailabilityPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commonMessage, setCommonMessage] = useState<string | null>(null);
  const [projectRole, setProjectRole] = useState<string | null>(null);
  const [availabilitiesStepCompleted, setAvailabilitiesStepCompleted] =
    useState(false);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const isDesktop = width >= 1024;

  const loadAvailabilities = async () => {
    const tripProjectId = Number(id);

    if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
      setError('Projet invalide.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getAvailabilities(tripProjectId);

      setAvailabilities(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les disponibilités.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectState = async () => {
    const tripProjectId = Number(id);

    if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
      return;
    }

    const project = await getTripProject(tripProjectId);

    setProjectRole(project.role);
    setAvailabilitiesStepCompleted(
      project.availabilitiesStepCompleted ?? false,
    );
  };

  const loadCommonPeriods = async () => {
    const tripProjectId = Number(id);

    if (!Number.isInteger(tripProjectId) || tripProjectId <= 0) {
      return;
    }

    try {
      const data = await getCommonAvailabilities(tripProjectId);

      setCommonPeriods(data.commonPeriods);
      setCommonMessage(data.message ?? null);
    } catch (error) {
      setCommonPeriods([]);
      setCommonMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les périodes communes.',
      );
    }
  };

  useEffect(() => {
    void Promise.all([
      loadAvailabilities(),
      loadProjectState(),
    ]);
  }, [id]);

  useEffect(() => {
    if (activeTab !== 'common') {
      return;
    }

    void loadCommonPeriods();
  }, [activeTab, id]);

  const handleCreatePeriod = async (
    startDate: string,
    endDate: string,
  ) => {
    const tripProjectId = Number(id);

    await createAvailability(tripProjectId, {
      startDate,
      endDate,
    });

    await loadAvailabilities();
  };

  const handleUpdatePeriod = async (
    availabilityId: number,
    startDate: string,
    endDate: string,
  ) => {
    await updateAvailability(availabilityId, {
      startDate,
      endDate,
    });

    await loadAvailabilities();
  };

  const handleDeletePeriod = async (
    availabilityId: number,
  ) => {
    await deleteAvailability(availabilityId);

    await loadAvailabilities();
  };

  const handleCompleteAvailabilitiesStep = async () => {
    const tripProjectId = Number(id);

    if (
      !Number.isInteger(tripProjectId) ||
      tripProjectId <= 0 ||
      isCompletingStep
    ) {
      return;
    }

    try {
      setIsCompletingStep(true);
      setStepError(null);

      await completeAvailabilitiesStep(tripProjectId);

      await loadProjectState();
    } catch (error) {
      setStepError(
        error instanceof Error
          ? error.message
          : 'Impossible de terminer cette étape.',
      );
    } finally {
      setIsCompletingStep(false);
    }
  };

  const handleBack = () => {
    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id },
    });
  };

  const myPeriods = availabilities
    .filter(availability => availability.isCurrentUser)
    .map(availability => ({
      id: availability.id,
      startDate: availability.startDate,
      endDate: availability.endDate,
    }));

  const otherParticipants = Object.values(
    availabilities
      .filter(availability => !availability.isCurrentUser)
      .reduce<
        Record<
          number,
          {
            userId: number;
            firstname: string;
            lastname: string;
            username: string;
            periods: Availability[];
          }
        >
      >((acc, availability) => {
        if (!acc[availability.userId]) {
          acc[availability.userId] = {
            userId: availability.userId,
            firstname: availability.firstname,
            lastname: availability.lastname,
            username: availability.username,
            periods: [],
          };
        }

        acc[availability.userId].periods.push(availability);

        return acc;
      }, {}),
  );

  const formatAvailabilityDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const content = (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir au détail du voyage"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backLabel}>Retour au voyage</Text>
      </Pressable>

      <View style={[styles.screenCard, !isDesktop && styles.mobileScreenCard]}>
        {isDesktop && <Text style={styles.desktopTitle}>Disponibilités</Text>}

        <View
          style={[
            styles.tabs,
            isDesktop ? styles.desktopTabs : styles.mobileTabs,
          ]}
          accessibilityRole="tablist"
        >
          <TabButton
            label="Mes disponibilités"
            selected={activeTab === 'mine'}
            isDesktop={isDesktop}
            onPress={() => setActiveTab('mine')}
          />
          <TabButton
            label="Périodes communes"
            selected={activeTab === 'common'}
            isDesktop={isDesktop}
            onPress={() => setActiveTab('common')}
          />
        </View>

        {!isDesktop && (
          <Text style={styles.mobileTitle}>
            {activeTab === 'mine' ? 'Mes disponibilités' : 'Périodes communes'}
          </Text>
        )}

        <View style={styles.calendarSection}>
        <AvailabilityCalendar
          mode={activeTab}
          isDesktop={isDesktop}
          loading={isLoading}
          periods={myPeriods}
          commonPeriods={commonPeriods.map((period, index) => ({
            id: -(index + 1),
            startDate: period.startDate,
            endDate: period.endDate,
          }))}
          commonMessage={commonMessage}
          onCreatePeriod={handleCreatePeriod}
          onUpdatePeriod={handleUpdatePeriod}
          onDeletePeriod={handleDeletePeriod}
          onPrimaryAction={() => {
            if (activeTab === 'common') {
              console.log('Proposer des destinations');
            }
          }}
        />
        {activeTab === 'mine' && otherParticipants.length > 0 && (
        <View style={styles.participantsSection}>
          <Text style={styles.participantsTitle}>
            Disponibilités des participants
          </Text>

          {otherParticipants.map(participant => (
            <View
              key={participant.userId}
              style={styles.participantCard}
            >
              <Text style={styles.participantName}>
                {participant.firstname} {participant.lastname}
              </Text>

              <Text style={styles.participantUsername}>
                @{participant.username}
              </Text>

              <View style={styles.participantPeriods}>
                {participant.periods.map(period => (
                  <Text
                    key={period.id}
                    style={styles.participantPeriod}
                  >
                    Du {formatAvailabilityDate(period.startDate)} au{' '}
{formatAvailabilityDate(period.endDate)}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
        {projectRole === 'OWNER' && (
          <View style={styles.completeStepCard}>
            <Text style={styles.completeStepTitle}>
              {availabilitiesStepCompleted
                ? 'Disponibilités terminées'
                : 'Tout le monde a renseigné ses disponibilités ?'}
            </Text>

            <Text style={styles.completeStepText}>
              {availabilitiesStepCompleted
                ? 'Cette étape est terminée. Vous pouvez maintenant consulter les périodes communes.'
                : 'Validez cette étape lorsque chaque participant a renseigné au moins une période.'}
            </Text>

            {availabilitiesStepCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#00A990"
                />
                <Text style={styles.completedBadgeText}>
                  Terminé
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => void handleCompleteAvailabilitiesStep()}
                disabled={isCompletingStep}
                style={({ pressed }) => [
                  styles.completeStepButton,
                  pressed && styles.pressed,
                  isCompletingStep && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.completeStepButtonText}>
                  {isCompletingStep
                    ? 'Validation…'
                    : 'Terminer les disponibilités'}
                </Text>
              </Pressable>
            )}

            {stepError && (
              <Text style={styles.stepError}>
                {stepError}
              </Text>
            )}
          </View>
        )}
        </View>
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />
        <ScrollView
          style={styles.desktopScroll}
          contentContainerStyle={styles.desktopContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
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
        {content}
      </ScrollView>
      <MobileBottomNavigation activeItem="trips" />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  isDesktop: boolean;
  onPress: () => void;
};

function TabButton({ label, selected, isDesktop, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tab,
        isDesktop ? styles.desktopTab : styles.mobileTab,
        selected && (isDesktop ? styles.desktopTabSelected : styles.mobileTabSelected),
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
        {label}
      </Text>
      {isDesktop && selected && <View style={styles.desktopIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  desktopScroll: { flex: 1 },
  desktopContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileScroll: { flex: 1 },
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
  backLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  screenCard: {
    marginTop: spacing.xl,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  mobileScreenCard: {
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  desktopTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.semibold,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  desktopTabs: {
    marginTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  participantsSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  participantsTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },

  participantCard: {
    padding: spacing.lg,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  participantName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  participantUsername: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },

  participantPeriods: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },

  participantPeriod: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  mobileTabs: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  tab: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopTab: {
    minWidth: 210,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  mobileTab: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  desktopTabSelected: {},
  mobileTabSelected: {
    backgroundColor: '#EAF1FF',
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  tabTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },
  completeStepCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#D9E7F5',
    borderRadius: radius.lg,
    backgroundColor: '#F7FBFF',
  },

  completeStepTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },

  completeStepText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },

  completeStepButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  completeStepButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  completedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: '#E6F8F4',
  },

  completedBadgeText: {
    color: '#008C78',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  stepError: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  disabledButton: {
    opacity: 0.55,
  },
  desktopIndicator: {
    position: 'absolute',
    right: spacing.md,
    bottom: -1,
    left: spacing.md,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  mobileTitle: {
    marginTop: spacing.xl,
    marginLeft: spacing.lg,
    color: colors.textPrimary,
    fontSize: 25,
    fontFamily: typography.fontFamily.semibold,
  },
  panel: {
    minHeight: 300,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  panelIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.full,
  },
  panelText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  pressed: { 
    opacity: 0.72 
  },
  calendarSection: {
    marginTop: spacing.xl,},
});
