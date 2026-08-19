import {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
} from 'react';
import {
  ActivityIndicator,
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
import { TripProjectDetailBottomNavigation } from '@/components/navigation/TripProjectDetailBottomNavigation';
import { TripProjectHeader } from '@/components/trip-project-detail/TripProjectHeader';
import { TripProjectParticipants } from '@/components/trip-project-detail/TripProjectParticipants';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/apiClient';
import { getTripProject } from '@/services/tripProjectService';
import { colors, radius, spacing, typography } from '@/theme';
import type { TripProjectDetail } from '@/types/tripProject';

export default function TripProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const { signOut } = useAuth();
  const { width } = useWindowDimensions();
  const [tripProject, setTripProject] = useState<TripProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDesktop = width >= 1024;
  const rawId = Array.isArray(id) ? id[0] : id;
  const projectId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;

  const loadTripProject = useCallback(async () => {
    if (projectId === null || projectId <= 0) {
      setTripProject(null);
      setErrorMessage('L’identifiant du projet est invalide.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setTripProject(await getTripProject(projectId));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }

      setTripProject(null);
      setErrorMessage(getDetailErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router, signOut]);

  useEffect(() => {
    void loadTripProject();
  }, [loadTripProject]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const participantsDone = tripProject?.participantsStepCompleted ?? false;
  const availabilitiesDone =
    tripProject?.availabilitiesStepCompleted ?? false;

  const completedSteps =
    Number(participantsDone) +
    Number(availabilitiesDone);

  const progressPercentage = Math.round(
    (completedSteps / 7) * 100,
  );

  const desktopDetailContent = tripProject && (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir aux voyages"
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={19}
          color={colors.textPrimary}
        />

        <Text style={styles.backLabel}>
          Retour aux voyages
        </Text>
      </Pressable>

      <View style={styles.desktopDetailLayout}>
        {/* HEADER */}
        <View style={styles.desktopProjectHeader}>
          <View style={styles.desktopProjectHeaderMain}>
            <View style={styles.desktopProjectIcon}>
              <Ionicons
                name="airplane-outline"
                size={28}
                color={colors.primary}
              />
            </View>

            <View style={styles.desktopProjectHeading}>
              <View style={styles.desktopTitleRow}>
                <Text style={styles.desktopProjectTitle}>
                  {tripProject.title}
                </Text>

                <View style={styles.desktopStatusBadge}>
                  <View style={styles.desktopStatusDot} />

                  <Text style={styles.desktopStatusText}>
                    {formatProjectStatus(tripProject.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.desktopProjectDestination}>
                {tripProject.selectedDestination
                  ? `${tripProject.selectedDestination.city}, ${tripProject.selectedDestination.country}`
                  : 'Destination à définir'}
              </Text>

              <View style={styles.desktopProjectMeta}>
                <View style={styles.desktopMetaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={17}
                    color={colors.textSecondary}
                  />

                  <Text style={styles.desktopMetaText}>
                    {formatProjectDates(
                      tripProject.startDate,
                      tripProject.endDate,
                    )}
                  </Text>
                </View>

                <View style={styles.desktopMetaSeparator} />

                <Pressable
                  onPress={() =>
                    router.push(
                      `/trip-projects/${tripProject.id}/participants`,
                    )
                  }
                  style={styles.desktopMetaItem}
                >
                  <Ionicons
                    name="people-outline"
                    size={17}
                    color={colors.textSecondary}
                  />

                  <Text style={styles.desktopMetaText}>
                    {formatParticipantCount(
                      tripProject.participantCount,
                    )}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* CONTENU PRINCIPAL */}
        <View style={styles.desktopMainGrid}>
          {/* GAUCHE : AVANCEMENT */}
          <View style={styles.desktopProgressPanel}>
            <View style={styles.desktopPanelHeader}>
              <View>
                <Text style={styles.desktopPanelTitle}>
                  Avancement du voyage
                </Text>

                <Text style={styles.desktopPanelSubtitle}>
                  {completedSteps} / 7 étapes complétées
                </Text>
              </View>

              <Text style={styles.desktopProgressPercent}>
                {progressPercentage} %
              </Text>
            </View>

            <View style={styles.desktopProgressTrack}>
              <View
                style={[
                  styles.desktopProgressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>

            <View style={styles.desktopStepsList}>
              <DesktopProjectStep
                icon="people-outline"
                title="Participants"
                subtitle={formatParticipantCount(
                  tripProject.participantCount,
                )}
                status={
                  participantsDone ? 'done' : 'current'
                }
                onPress={() =>
                  router.push(
                    `/trip-projects/${tripProject.id}/participants`,
                  )
                }
              />

              <DesktopProjectStep
                icon="calendar-outline"
                title="Disponibilités"
                subtitle="Renseignez les disponibilités du groupe"
                status={
                  availabilitiesDone
                    ? 'done'
                    : participantsDone
                      ? 'current'
                      : 'todo'
                }
                onPress={() =>
                  router.push(
                    `/trip-projects/${tripProject.id}/availabilities`,
                  )
                }
              />

              <DesktopProjectStep
                icon="git-compare-outline"
                title="Périodes communes"
                subtitle="Trouvez les dates compatibles"
                status={
                  availabilitiesDone ? 'current' : 'todo'
                }
              />

              <DesktopProjectStep
                icon="location-outline"
                title="Destinations"
                subtitle={
                  tripProject.selectedDestination
                    ? `${tripProject.selectedDestination.city}, ${tripProject.selectedDestination.country}`
                    : 'Choisissez où partir'
                }
                status="todo"
                onPress={() =>
                  router.push(
                    `/trip-projects/${tripProject.id}/destinations`,
                  )
                }
              />

              <DesktopProjectStep
                icon="heart-outline"
                title="Vote"
                subtitle="Votez pour votre destination préférée"
                status="todo"
              />

              <DesktopProjectStep
                icon="flag-outline"
                title="Destination finale"
                subtitle="Validez le choix du groupe"
                status="todo"
              />

              <DesktopProjectStep
                icon="briefcase-outline"
                title="Organisation"
                subtitle="Préparez votre voyage"
                status="todo"
              />
            </View>
          </View>

          {/* DROITE */}
          <View style={styles.desktopAside}>
            <View style={styles.desktopAsideCard}>
              <View style={styles.desktopAsideHeader}>
                <Text style={styles.desktopPanelTitle}>
                  Participants
                </Text>

                <Pressable
                  onPress={() =>
                    router.push(
                      `/trip-projects/${tripProject.id}/participants`,
                    )
                  }
                >
                  <Text style={styles.desktopLink}>
                    Voir tout
                  </Text>
                </Pressable>
              </View>

              <View style={styles.desktopParticipantsList}>
                {tripProject.participantsPreview
                  .slice(0, 5)
                  .map((participant) => (
                    <View
                      key={participant.id}
                      style={styles.desktopParticipantRow}
                    >
                      <View style={styles.desktopParticipantAvatar}>
                        <Text
                          style={styles.desktopParticipantInitial}
                        >
                          {(
                            participant.firstname ||
                            participant.username ||
                            '?'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={styles.desktopParticipantName}
                        >
                          {participant.firstname ||
                            participant.username}
                          {participant.isCurrentUser
                            ? ' (vous)'
                            : ''}
                        </Text>

                        <Text
                          style={styles.desktopParticipantRole}
                        >
                          {participant.role === 'OWNER'
                            ? 'Propriétaire'
                            : 'Membre'}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>

            <View style={styles.desktopAsideCard}>
              <Text style={styles.desktopPanelTitle}>
                Informations
              </Text>

              <View style={styles.desktopInfoList}>
                <InfoRow
                  icon="wallet-outline"
                  label="Budget estimé"
                  value={
                    tripProject.estimatedBudget
                      ? `${tripProject.estimatedBudget}`
                      : 'À définir'
                  }
                />

                <InfoRow
                  icon="time-outline"
                  label="Projet créé le"
                  value={formatLongDate(
                    tripProject.createdAt,
                  )}
                />

                <InfoRow
                  icon="location-outline"
                  label="Destination retenue"
                  value={
                    tripProject.selectedDestination
                      ? `${tripProject.selectedDestination.city}, ${tripProject.selectedDestination.country}`
                      : 'À définir'
                  }
                />
              </View>
            </View>

            {tripProject.description?.trim() && (
              <View style={styles.desktopAsideCard}>
                <Text style={styles.desktopPanelTitle}>
                  À propos
                </Text>

                <Text style={styles.desktopDescription}>
                  {tripProject.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );

  const mobileDetailContent = tripProject && (
    <MobileTripProjectDetail
      project={tripProject}
      onBack={handleBack}
      onParticipantsPress={() =>
        router.push(`/trip-projects/${tripProject.id}/participants`)
      }
      onAvailabilitiesPress={() =>
        router.push(`/trip-projects/${tripProject.id}/availabilities`)
      }
      onDestinationsPress={() =>
        router.push(`/trip-projects/${tripProject.id}/destinations`)
      }
    />
  );

  const feedbackContent = isLoading ? (
    <DetailFeedback mode="loading" />
  ) : errorMessage || !tripProject ? (
    <DetailFeedback
      mode="error"
      message={errorMessage ?? 'Projet introuvable.'}
      onRetry={projectId ? () => void loadTripProject() : undefined}
      onBack={() => router.replace('/')}
    />
  ) : null;

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />
        <ScrollView
          style={styles.desktopContent}
          contentContainerStyle={styles.desktopContentInner}
          showsVerticalScrollIndicator={false}
        >
          {feedbackContent ?? desktopDetailContent}
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
        {feedbackContent ?? mobileDetailContent}
      </ScrollView>
      {tripProject && (
      <TripProjectDetailBottomNavigation
        projectId={tripProject.id}
        activeItem="overview"
      />
    )}
    </View>
  );
}

type MobileTripProjectDetailProps = {
  project: TripProjectDetail;
  onBack: () => void;
  onParticipantsPress: () => void;
  onAvailabilitiesPress: () => void;
  onDestinationsPress: () => void;
};

function MobileTripProjectDetail({
  project,
  onBack,
  onParticipantsPress,
  onAvailabilitiesPress,
  onDestinationsPress,
}: MobileTripProjectDetailProps) {
  const destination = project.selectedDestination
    ? `${project.selectedDestination.city}, ${project.selectedDestination.country}`
    : 'Destination à définir';

  const participantsDone = project.participantsStepCompleted;
  const availabilitiesDone = project.availabilitiesStepCompleted;

  const completedSteps =
    Number(participantsDone) +
    Number(availabilitiesDone);

  const progressPercentage = Math.round(
    (completedSteps / 7) * 100,
  );

  return (
    <View style={styles.mobileDetail}>
      <View style={styles.mobileHero}>
        <View style={styles.mobileHeroActions}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            style={styles.mobileHeroButton}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.mobileHeroButton}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.mobileHeroIcon}>
          <Ionicons name="airplane" size={30} color="#FFFFFF" />
        </View>

        <View style={styles.mobileHeroCopy}>
          <Text style={styles.mobileHeroTitle}>{project.title}</Text>

          <View style={styles.mobileDestinationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color="rgba(255,255,255,0.84)"
            />
            <Text style={styles.mobileHeroDestination}>
              {destination}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mobileBody}>
        <View style={styles.mobileDateCard}>
          <View style={styles.mobileInfoIcon}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color={colors.primary}
            />
          </View>

          <View style={styles.mobileDateCopy}>
            <Text style={styles.mobileInfoLabel}>DATES DU VOYAGE</Text>
            <Text style={styles.mobileInfoValue}>
              {formatProjectDates(project.startDate, project.endDate)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textMuted}
          />
        </View>

        <View style={styles.mobileSectionHeader}>
          <Text style={styles.mobileSectionTitle}>Participants</Text>

          <Pressable onPress={onParticipantsPress}>
            <Text style={styles.mobileSectionLink}>Voir tout</Text>
          </Pressable>
        </View>

        <View style={styles.mobileParticipants}>
          {project.participantsPreview.slice(0, 5).map((participant) => {
            const initial = (
              participant.firstname ||
              participant.username ||
              '?'
            )
              .charAt(0)
              .toUpperCase();

            return (
              <View
                key={participant.id}
                style={styles.mobileParticipantAvatar}
              >
                <Text style={styles.mobileParticipantInitial}>
                  {initial}
                </Text>
              </View>
            );
          })}

          {project.participantCount > 5 && (
            <View style={styles.mobileParticipantMore}>
              <Text style={styles.mobileParticipantMoreText}>
                +{project.participantCount - 5}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mobileProgressCard}>
          <View style={styles.mobileProgressHeading}>
            <View>
              <Text style={styles.mobileSectionTitle}>
                Avancement du projet
              </Text>

              <Text style={styles.mobileProgressSubtitle}>
                {completedSteps} / 7 étapes complétées
              </Text>
            </View>

            <Text style={styles.mobileProgressPercentage}>
              {progressPercentage} %
            </Text>
          </View>

          <View style={styles.mobileProgressTrack}>
            <View
              style={[
                styles.mobileProgressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.mobileSteps}>
          <MobileProjectStep
            icon="people-outline"
            title="Participants"
            subtitle={`${project.participantCount} participant${project.participantCount > 1 ? 's' : ''}`}
            status={participantsDone ? 'done' : 'current'}
            onPress={onParticipantsPress}
          />

          <MobileProjectStep
            icon="calendar-outline"
            title="Disponibilités"
            subtitle="Renseignez les dates du groupe"
            status={
              availabilitiesDone
                ? 'done'
                : participantsDone
                  ? 'current'
                  : 'todo'
            }
            onPress={onAvailabilitiesPress}
          />

          <MobileProjectStep
            icon="git-compare-outline"
            title="Périodes communes"
            subtitle="Trouvez les dates qui conviennent à tous"
            status={availabilitiesDone ? 'current' : 'todo'}
          />

          <MobileProjectStep
            icon="location-outline"
            title="Destinations"
            subtitle={
              project.selectedDestination
                ? destination
                : 'Choisissez où partir'
            }
            status="todo"
            onPress={onDestinationsPress}
          />

          <MobileProjectStep
            icon="heart-outline"
            title="Vote"
            subtitle="Votez pour votre destination préférée"
            status="todo"
          />

          <MobileProjectStep
            icon="flag-outline"
            title="Destination finale"
            subtitle="Validez le choix du groupe"
            status="todo"
          />

          <MobileProjectStep
            icon="briefcase-outline"
            title="Organisation"
            subtitle="Préparez votre voyage"
            status="todo"
          />
        </View>
      </View>
    </View>
  );
}

type MobileProjectStepProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  status: 'done' | 'current' | 'todo';
  onPress?: () => void;
};

function MobileProjectStep({
  icon,
  title,
  subtitle,
  status,
  onPress,
}: MobileProjectStepProps) {
  const isDone = status === 'done';
  const isCurrent = status === 'current';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.mobileStep,
        isCurrent && styles.mobileStepCurrent,
        pressed && onPress && styles.buttonPressed,
      ]}
    >
      <View
        style={[
          styles.mobileStepIcon,
          isDone && styles.mobileStepIconDone,
          isCurrent && styles.mobileStepIconCurrent,
        ]}
      >
        <Ionicons
          name={isDone ? 'checkmark' : icon}
          size={18}
          color={
            isDone
              ? '#FFFFFF'
              : isCurrent
                ? colors.primary
                : colors.textMuted
          }
        />
      </View>

      <View style={styles.mobileStepCopy}>
        <Text
          style={[
            styles.mobileStepTitle,
            status === 'todo' && styles.mobileStepTitleMuted,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.mobileStepSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
        />
      )}
    </Pressable>
  );
}

type DesktopProjectStepProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  status: 'done' | 'current' | 'todo';
  onPress?: () => void;
};

function DesktopProjectStep({
  icon,
  title,
  subtitle,
  status,
  onPress,
}: DesktopProjectStepProps) {
  const isDone = status === 'done';
  const isCurrent = status === 'current';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.desktopStep,
        isCurrent && styles.desktopStepCurrent,
        pressed && onPress && styles.buttonPressed,
      ]}
    >
      <View
        style={[
          styles.desktopStepIcon,
          isDone && styles.desktopStepIconDone,
          isCurrent && styles.desktopStepIconCurrent,
        ]}
      >
        <Ionicons
          name={isDone ? 'checkmark' : icon}
          size={18}
          color={
            isDone
              ? '#FFFFFF'
              : isCurrent
                ? colors.primary
                : colors.textMuted
          }
        />
      </View>

      <View style={styles.desktopStepCopy}>
        <Text style={styles.desktopStepTitle}>
          {title}
        </Text>

        <Text style={styles.desktopStepSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.desktopStepStatus,
          isDone && styles.desktopStepStatusDone,
          isCurrent && styles.desktopStepStatusCurrent,
        ]}
      >
        <Text
          style={[
            styles.desktopStepStatusText,
            isDone &&
              styles.desktopStepStatusTextDone,
            isCurrent &&
              styles.desktopStepStatusTextCurrent,
          ]}
        >
          {isDone
            ? 'Terminé'
            : isCurrent
              ? 'En cours'
              : 'À venir'}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
        />
      )}
    </Pressable>
  );
}

function IncompleteProjectHeader({ project }: { project: TripProjectDetail }) {
  const destination = project.selectedDestination
    ? `${project.selectedDestination.city}, ${project.selectedDestination.country}`
    : 'Destination à définir';

  return (
    <View style={styles.incompleteHeader}>
      <View style={styles.incompleteHeaderIcon}>
        <Ionicons name="airplane-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.incompleteHeaderContent}>
        <Text style={styles.incompleteHeaderTitle}>{project.title}</Text>
        <Text style={styles.incompleteHeaderDestination}>{destination}</Text>
        <View style={styles.headerMetaRow}>
          <Text style={styles.headerMetaText}>
            {formatProjectDates(project.startDate, project.endDate)}
          </Text>
          <View style={styles.metaDot} />
          <Text style={styles.headerMetaText}>
            {formatParticipantCount(project.participantCount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ProjectStatusCard({ status }: { status: string }) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusIcon}>
        <Ionicons name="compass-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.statusContent}>
        <Text style={styles.cardEyebrow}>ÉTAT DU PROJET</Text>
        <Text style={styles.statusTitle}>{formatProjectStatus(status)}</Text>
        <Text style={styles.cardText}>
          Continuez la préparation avec votre groupe depuis les étapes du projet.
        </Text>
      </View>
    </View>
  );
}

type ProjectSummaryCardProps = {
  description: string | null;
  selectedDestination: TripProjectDetail['selectedDestination'];
};

function ProjectSummaryCard({
  description,
  selectedDestination,
}: ProjectSummaryCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoCardIcon}>
          <Ionicons name="document-text-outline" size={19} color={colors.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Résumé</Text>
      </View>
      <Text style={styles.cardText}>
        {description?.trim() || 'Aucune description n’a encore été ajoutée.'}
      </Text>
      <View style={styles.infoDivider} />
      <InfoRow
        icon="location-outline"
        label="Destination retenue"
        value={
          selectedDestination
            ? `${selectedDestination.city}, ${selectedDestination.country}`
            : 'À définir'
        }
      />
    </View>
  );
}

type ProjectKeyInfoCardProps = {
  startDate: string | null;
  endDate: string | null;
  estimatedBudget: string | null;
  createdAt: string;
};

function ProjectKeyInfoCard({
  startDate,
  endDate,
  estimatedBudget,
  createdAt,
}: ProjectKeyInfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoCardIcon}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.infoCardTitle}>Informations clés</Text>
      </View>
      <View style={styles.infoRows}>
        <InfoRow
          icon="calendar-outline"
          label="Dates"
          value={formatProjectDates(startDate, endDate)}
        />
        <InfoRow
          icon="wallet-outline"
          label="Budget estimé"
          value={estimatedBudget ? `${estimatedBudget} — devise à préciser` : 'À définir'}
        />
        <InfoRow
          icon="time-outline"
          label="Projet créé le"
          value={formatLongDate(createdAt)}
        />
      </View>
    </View>
  );
}

type InfoRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowIcon}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
      </View>
      <View style={styles.infoRowContent}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
      </View>
    </View>
  );
}

type DetailFeedbackProps = {
  mode: 'loading' | 'error';
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
};

function DetailFeedback({ mode, message, onRetry, onBack }: DetailFeedbackProps) {
  return (
    <View style={styles.feedbackCard}>
      {mode === 'loading' ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.feedbackTitle}>Chargement du voyage…</Text>
        </>
      ) : (
        <>
          <View style={styles.feedbackIcon}>
            <Ionicons name="alert-circle-outline" size={26} color={colors.error} />
          </View>
          <Text style={styles.feedbackTitle}>Impossible d’afficher ce voyage</Text>
          <Text style={styles.feedbackText}>{message}</Text>
          <View style={styles.feedbackActions}>
            {onRetry && (
              <Pressable
                onPress={onRetry}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryActionText}>Réessayer</Text>
              </Pressable>
            )}
            {onBack && (
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryActionText}>Retour à l’accueil</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

function getDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Vous ne participez pas à ce projet.';
    if (error.status === 404) return 'Ce projet n’existe pas ou n’est plus disponible.';
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Le serveur est injoignable. Vérifiez votre connexion puis réessayez.';
  }

  return 'Une erreur inattendue est survenue.';
}

function formatProjectStatus(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'draft') return 'Projet en préparation';
  if (normalized === 'active' || normalized === 'in_progress') return 'Projet en cours';
  if (normalized === 'completed' || normalized === 'closed') return 'Projet terminé';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Projet annulé';

  return status || 'Statut non renseigné';
}

function formatProjectDates(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return 'Dates à définir';
  return `${formatLongDate(startDate)} – ${formatLongDate(endDate)}`;
}

function formatLongDate(date: string): string {
  const parsedDate = new Date(date.length === 10 ? `${date}T00:00:00` : date);

  if (Number.isNaN(parsedDate.getTime())) return 'Non renseignée';

  return parsedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatParticipantCount(count: number): string {
  return `${count} participant${count > 1 ? 's' : ''}`;
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7F9FC',
  },

  desktopContent: {
    flex: 1,
  },

  desktopContentInner: {
    width: '100%',
    maxWidth: 1360,
    alignSelf: 'center',
    paddingHorizontal: 44,
    paddingTop: 34,
    paddingBottom: 56,
  },
  
  mobilePage: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  mobileScrollView: {
    flex: 1,
  },
  mobileContent: {
    flexGrow: 1,
    paddingBottom: 88,
  },
  mobileDetail: {
    width: '100%',
  },

  mobileHero: {
    minHeight: 210,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    justifyContent: 'space-between',
    backgroundColor: '#1E88E5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  mobileHeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mobileHeroButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(15,23,42,0.16)',
  },

  mobileHeroIcon: {
    alignSelf: 'center',
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  mobileHeroCopy: {
    gap: 4,
  },

  mobileHeroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 29,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.45,
  },

  mobileHeroDestination: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },

  mobileDestinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  mobileBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 15,
  },

  mobileDateCard: {
    minHeight: 66,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { 
      width: 0, height: 3 
    },
    elevation: 2,
  },

  mobileInfoIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#EAF4FE',
  },

  mobileDateCopy: {
    flex: 1,
    minWidth: 0,
  },

  mobileInfoLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.6,
  },

  mobileInfoValue: {
    marginTop: 3,
    color: '#1A1C23',
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  mobileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mobileSectionTitle: {
    color: '#1A1C23',
    fontSize: 16,
    fontFamily: typography.fontFamily.displayBold,
  },

  mobileSectionLink: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: typography.fontFamily.semibold,
  },

  mobileParticipants: {
    marginTop: -6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  mobileParticipantAvatar: {
    width: 38,
    height: 38,
    marginRight: -7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: radius.full,
    backgroundColor: '#DCEEFF',
  },

  mobileParticipantInitial: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },

  mobileParticipantMore: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: radius.full,
    backgroundColor: '#EEF2F7',
  },

  mobileParticipantMoreText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
  },

  mobileProgressCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  mobileProgressHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  mobileProgressSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },

  mobileProgressPercentage: {
    color: '#00A990',
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },

  mobileProgressTrack: {
    height: 6,
    marginTop: 13,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: '#E7EDF3',
  },

  mobileProgressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#00BFA6',
  },

  mobileSteps: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EBF2',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  mobileStep: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  mobileStepCurrent: {
    backgroundColor: '#F2F8FE',
  },

  mobileStepIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F2F5F8',
  },

  mobileStepIconDone: {
    backgroundColor: '#00BFA6',
  },

  mobileStepIconCurrent: {
    backgroundColor: '#E5F2FE',
  },

  mobileStepCopy: {
    flex: 1,
    minWidth: 0,
  },

  statusContent : {
    flex: 1,
  },

  mobileStepTitle: {
    color: '#1A1C23',
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  mobileStepTitleMuted: {
    color: '#64748B',
  },

  mobileStepSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9.5,
    fontFamily: typography.fontFamily.regular,
  },

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8F0',
    borderRadius: radius.full,

    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  backLabel: {
    color: '#1A1C23',
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },

  buttonPressed: { 
    opacity: 0.7 
  },

  content: {
    marginTop: 24,
    gap: 20,
  },

  incompleteHeader: {
    width: '100%',
    minHeight: 190,
    paddingHorizontal: 28,
    paddingVertical: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 20,

    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  incompleteHeaderIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FE',
    borderRadius: 18,
  },

  incompleteHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  incompleteHeaderTitle: {
    color: '#1A1C23',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.6,
  },

  incompleteHeaderDestination: {
    marginTop: 5,
    color: '#52657B',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: typography.fontFamily.medium,
  },

  headerMetaRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  headerMetaText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },

  detailsGrid: {
    width: '100%',
    gap: 18,
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
    minWidth: 0,
  },

  metaDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: radius.full,
  },
  
  statusCard: {
    width: '100%',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 18,
  },

  statusIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FE',
    borderRadius: 14,
  },

  cardEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.9,
  },

  statusTitle: {
    marginTop: 3,
    color: '#1A1C23',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: typography.fontFamily.semibold,
  },

  cardText: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: typography.fontFamily.regular,
  },

  infoCard: {
    flex: 1,
    minHeight: 270,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 18,

    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoCardIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FE',
    borderRadius: 11,
  },

  infoCardTitle: {
    color: '#1A1C23',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: typography.fontFamily.semibold,
  },

  infoDivider: {
    marginVertical: spacing.lg,
    height: 1,
    backgroundColor: colors.border,
  },

  infoRows: {
    marginTop: 20,
    gap: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  infoRowIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F6FA',
    borderRadius: radius.full,
  },

  infoRowLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },

  infoRowValue: {
    marginTop: 3,
    color: '#1A1C23',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: typography.fontFamily.medium,
  },
  infoRowContent: { 
    flex: 1, minWidth: 0 
  },

  feedbackCard: {
    width: '100%',
    maxWidth: 520,
    minHeight: 260,
    marginHorizontal: 'auto',
    marginVertical: spacing.xxxl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  feedbackIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.full,
  },
  feedbackTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    textAlign: 'center',
  },
  feedbackText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  feedbackActions: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryAction: {
    minHeight: 42,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  secondaryAction: {
    minHeight: 42,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopDetailLayout: {
    marginTop: 24,
    gap: 20,
  },

  desktopProjectHeader: {
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 20,

    shadowColor: '#0F172A',
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  desktopProjectHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  desktopProjectIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EAF4FE',
  },

  desktopProjectHeading: {
    flex: 1,
    minWidth: 0,
  },

  desktopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  desktopProjectTitle: {
    color: '#1A1C23',
    fontSize: 32,
    lineHeight: 39,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.7,
  },

  desktopStatusBadge: {
    minHeight: 30,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    backgroundColor: '#EEF7FF',
  },

  desktopStatusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: '#1E88E5',
  },

  desktopStatusText: {
    color: '#2563A6',
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopProjectDestination: {
    marginTop: 4,
    color: '#52657B',
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
  },

  desktopProjectMeta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  desktopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  desktopMetaText: {
    color: '#475569',
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },

  desktopMetaSeparator: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#B7C2CE',
  },

  desktopMainGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },

  desktopProgressPanel: {
    flex: 1,
    minWidth: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 20,

    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  desktopPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },

  desktopPanelTitle: {
    color: '#1A1C23',
    fontSize: 18,
    lineHeight: 23,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopPanelSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },

  desktopProgressPercent: {
    color: '#00A990',
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
  },

  desktopProgressTrack: {
    height: 7,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: '#E7EDF3',
  },

  desktopProgressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#00BFA6',
  },

  desktopStepsList: {
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    borderRadius: 16,
  },

  desktopStep: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F5',
    backgroundColor: '#FFFFFF',
  },

  desktopStepCurrent: {
    backgroundColor: '#F4F9FF',
  },

  desktopStepIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#F1F4F7',
  },

  desktopStepIconDone: {
    backgroundColor: '#00BFA6',
  },

  desktopStepIconCurrent: {
    backgroundColor: '#E5F2FE',
  },

  desktopStepCopy: {
    flex: 1,
    minWidth: 0,
  },

  desktopStepTitle: {
    color: '#1A1C23',
    fontSize: 14,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopStepSubtitle: {
    marginTop: 3,
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },

  desktopStepStatus: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: '#F1F4F7',
  },

  desktopStepStatusDone: {
    backgroundColor: '#E7F8F3',
  },

  desktopStepStatusCurrent: {
    backgroundColor: '#EAF4FE',
  },

  desktopStepStatusText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
  },

  desktopStepStatusTextDone: {
    color: '#059669',
  },

  desktopStepStatusTextCurrent: {
    color: '#1E88E5',
  },

  desktopAside: {
    width: 360,
    gap: 16,
  },

  desktopAsideCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 18,

    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  desktopAsideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  desktopLink: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopParticipantsList: {
    marginTop: 18,
    gap: 13,
  },

  desktopParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  desktopParticipantAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#DCEEFF',
  },

  desktopParticipantInitial: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },

  desktopParticipantName: {
    color: '#1A1C23',
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopParticipantRole: {
    marginTop: 2,
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
  },

  desktopInfoList: {
    marginTop: 18,
    gap: 15,
  },

  desktopDescription: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: typography.fontFamily.regular,
  },
});
