import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  completeParticipantsStep,
  getTripProject,
  inviteTripParticipant
} from '@/services/tripProjectService';
import { ApiError } from '@/services/apiClient';
import type { TripProjectDetail, TripProjectPendingInvitation } from '@/types/tripProject';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { colors, radius, spacing, typography } from '@/theme';

type Member = {
  id: number;
  name: string;
  initials: string;
  role: 'Propriétaire' | 'Membre';
  color: string;
};

type Invitation = {
  id: number;
  email: string;
  sentAt: string;
};

export default function TripProjectParticipantsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const [project, setProject] = useState<TripProjectDetail | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  const members: Member[] =
  project?.participantsPreview.map((participant) => {
    const name =
      participant.firstname ||
      participant.username ||
      'Utilisateur';

    const initials = name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      id: participant.id,
      name,
      initials,
      role:
        participant.role === 'OWNER'
          ? 'Propriétaire'
          : 'Membre',
      color: participant.isCurrentUser
        ? '#2563EB'
        : '#0F766E',
    };
  }) ?? [];
  
  const invitations: Invitation[] =
  project?.pendingInvitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    sentAt: formatInvitationDate(invitation.createdAt),
  })) ?? [];

  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      return;
    }

    void getTripProject(Number(id))
      .then(setProject)
      .catch(() => {
        setProject(null);
      });
  }, [id]);

  const handleBack = () => {
    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id },
    });
  };

  const handleCompleteParticipantsStep = async () => {
    if (!id || !/^\d+$/.test(id) || isCompletingStep) {
      return;
    }

    setIsCompletingStep(true);
    setStepError(null);

    try {
      await completeParticipantsStep(Number(id));

      setProject((currentProject) =>
        currentProject
          ? {
              ...currentProject,
              participantsStepCompleted: true,
            }
          : currentProject,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setStepError(error.message);
      } else {
        setStepError(
          'Impossible de terminer l’étape pour le moment.',
        );
      }
    } finally {
      setIsCompletingStep(false);
    }
  };

  const handleInviteParticipant = async () => {
    if (!id || !/^\d+$/.test(id) || isInviting) {
      return;
    }

    const email = inviteEmail.trim();

    if (!email) {
      setInviteError('Saisissez une adresse e-mail.');
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    try {
      await inviteTripParticipant(Number(id), email);

      const refreshedProject = await getTripProject(Number(id));
      setProject(refreshedProject);

      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setInviteError(error.message);
      } else {
        setInviteError(
          'Impossible d’envoyer l’invitation pour le moment.',
        );
      }
    } finally {
      setIsInviting(false);
    }
  };

  function formatInvitationDate(createdAt: string): string {
    const createdDate = new Date(createdAt);
    const now = new Date();

    const createdDay = new Date(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      createdDate.getDate(),
    );

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const diffDays = Math.round(
      (today.getTime() - createdDay.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return 'Envoyée aujourd’hui';
    }

    if (diffDays === 1) {
      return 'Envoyée hier';
    }

    return `Envoyée le ${createdDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  }

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

      <View style={[styles.header, !isDesktop && styles.mobileHeader]}>
        <View style={styles.headerText}>
          <View style={styles.tripLabelRow}>
          <View style={styles.tripIcon}>
            <Ionicons
              name="airplane-outline"
              size={15}
              color={colors.primary}
            />
          </View>

          <Text style={styles.eyebrow}>
            {project?.title ?? 'Voyage'}
          </Text>
        </View>

          <Text style={[styles.title, !isDesktop && styles.mobileTitle]}>
            Participants
          </Text>
          <Text style={styles.description}>
            Gérez les membres et les invitations de ce voyage.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            setInviteError(null);
            setIsInviteModalOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Inviter un participant"
          style={({ pressed }) => [
            styles.inviteButton,
            !isDesktop && styles.mobileInviteButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
          <Text style={styles.inviteButtonText}>Nouvelle invitation</Text>
        </Pressable>
      </View>

      <View style={[styles.stats, !isDesktop && styles.mobileStats]}>
  <Stat
    icon="people-outline"
    value={`${members.length}`}
    label="participants"
    tone="blue"
  />

  <View
      style={[
        styles.statDivider,
        !isDesktop && styles.mobileStatDivider,
      ]}
    />

    <Stat
      icon="shield-checkmark-outline"
      value={`${members.filter(
        (member) => member.role === 'Propriétaire'
      ).length}`}
      label="propriétaire"
      tone="green"
    />

    <View
      style={[
        styles.statDivider,
        !isDesktop && styles.mobileStatDivider,
      ]}
    />

    <Stat
      icon="mail-unread-outline"
      value={`${invitations.length}`}
      label="en attente"
      tone="orange"
    />
  </View>

      <View style={[styles.mainGrid, !isDesktop && styles.mobileMainGrid]}>
        <View style={styles.membersCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Membres du voyage</Text>
              <Text style={styles.sectionSubtitle}>
                Les personnes qui participent déjà au projet
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{members.length}</Text>
            </View>
          </View>

          <View style={styles.memberList}>
            {members.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                isLast={index === members.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={styles.invitationsCard}>
          <View style={styles.invitationHeading}>
            <View style={styles.invitationIcon}>
              <Ionicons name="paper-plane-outline" size={19} color={colors.primary} />
            </View>
            <View style={styles.invitationHeadingText}>
              <Text style={styles.sectionTitle}>Invitations en attente</Text>
              <Text style={styles.sectionSubtitle}>
                Elles pourront rejoindre le voyage depuis leur invitation.
              </Text>
            </View>
          </View>

          <View style={styles.invitationList}>
            {invitations.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} />
            ))}
          </View>
        </View>
      </View>

      {project?.role === 'OWNER' && (
        <View style={styles.completeStepCard}>
          <View style={styles.completeStepCopy}>
            <Text style={styles.completeStepTitle}>
              {project.participantsStepCompleted
                ? 'Invitations terminées'
                : 'Vous avez invité tout le monde ?'}
            </Text>

            <Text style={styles.completeStepDescription}>
              {project.participantsStepCompleted
                ? 'Cette étape est terminée. Vous pouvez maintenant passer aux disponibilités.'
                : 'Lorsque vous estimez avoir terminé les invitations, validez cette étape pour poursuivre la préparation.'}
            </Text>
          </View>

          {project.participantsStepCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#00A990"
              />
              <Text style={styles.completedBadgeText}>Terminé</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => void handleCompleteParticipantsStep()}
              disabled={isCompletingStep}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.completeStepButton,
                pressed && styles.pressed,
                isCompletingStep && styles.disabledButton,
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />

              <Text style={styles.completeStepButtonText}>
                {isCompletingStep
                  ? 'Validation…'
                  : 'Terminer les invitations'}
              </Text>
            </Pressable>
          )}

          {stepError && (
            <Text style={styles.stepError}>{stepError}</Text>
          )}
        </View>
      )}
      <Modal
        visible={isInviteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteModalOpen(false)}
      >
        <View style={styles.inviteModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsInviteModalOpen(false)}
          />

          <View
            style={[
              styles.inviteModalCard,
              !isDesktop && styles.mobileInviteModalCard,
            ]}
          >
            <View style={styles.inviteModalHeader}>
              <View>
                <Text style={styles.inviteModalEyebrow}>
                  NOUVEAU PARTICIPANT
                </Text>

                <Text style={styles.inviteModalTitle}>
                  Nouvelle invitation
                </Text>

                <Text style={styles.inviteModalDescription}>
                  Entrez l’adresse e-mail de la personne à inviter.
                </Text>
              </View>

              <Pressable
                onPress={() => setIsInviteModalOpen(false)}
                style={styles.inviteModalClose}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.textPrimary}
                />
              </Pressable>
            </View>

            <View style={styles.inviteModalForm}>
              <Text style={styles.inviteModalLabel}>
                Adresse e-mail
              </Text>

              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="exemple@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inviteModalInput}
              />

              {inviteError && (
                <Text style={styles.inviteModalError}>
                  {inviteError}
                </Text>
              )}

              <View
                style={[
                  styles.inviteModalActions,
                  !isDesktop && styles.mobileInviteModalActions,
                ]}
              >
                <Pressable
                  onPress={() => setIsInviteModalOpen(false)}
                  style={styles.inviteModalSecondary}
                >
                  <Text style={styles.inviteModalSecondaryText}>
                    Annuler
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => void handleInviteParticipant()}
                  disabled={isInviting}
                  style={[
                    styles.inviteModalPrimary,
                    isInviting && styles.disabledButton,
                  ]}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.inviteModalPrimaryText}>
                    {isInviting
                      ? 'Envoi…'
                      : 'Envoyer l’invitation'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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

type StatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone: 'blue' | 'green' | 'orange';
};

function Stat({ icon, value, label, tone }: StatProps) {
  const toneStyle = {
    blue: styles.blueTone,
    green: styles.greenTone,
    orange: styles.orangeTone,
  }[tone];

  const iconColor = {
    blue: colors.primary,
    green: colors.secondary,
    orange: colors.warning,
  }[tone];

  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, toneStyle]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function MemberRow({ member, isLast }: { member: Member; isLast: boolean }) {
  return (
    <View style={[styles.memberRow, !isLast && styles.rowBorder]}>
      <View style={[styles.avatar, { backgroundColor: member.color }]}>
        <Text style={styles.avatarText}>{member.initials}</Text>
      </View>

      <View style={styles.memberIdentity}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          {member.role === 'Propriétaire' && (
            <Ionicons name="key" size={13} color={colors.warning} />
          )}
        </View>
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>

      <Pressable
        onPress={() => console.log(`Options de ${member.name}`)}
        accessibilityRole="button"
        accessibilityLabel={`Options de ${member.name}`}
        style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
      >
        <Ionicons name="ellipsis-horizontal" size={19} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

function InvitationRow({
  invitation,
}: {
  invitation: Invitation;
}) {
  return (
    <View style={styles.invitationRow}>
      <View style={styles.pendingAvatar}>
        <Ionicons
          name="mail-outline"
          size={18}
          color={colors.warning}
        />
      </View>

      <View style={styles.invitationIdentity}>
        <Text
          style={styles.invitationEmail}
          numberOfLines={1}
        >
          {invitation.email}
        </Text>

        <Text style={styles.invitationDate}>
          {invitation.sentAt}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          console.log(`Renvoyer à ${invitation.email}`)
        }
        accessibilityRole="button"
        accessibilityLabel={`Renvoyer l'invitation à ${invitation.email}`}
        style={({ pressed }) => [
          styles.resendButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="refresh"
          size={15}
          color={colors.primary}
        />
      </Pressable>
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
    flex: 1 
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: typography.fontFamily.semibold,
  },

  inviteModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },

  inviteModalCard: {
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAF2',
    borderRadius: 20,

    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.18)',
        }
      : {}),
  },

  mobileInviteModalCard: {
    maxWidth: '100%',
  },

  inviteModalHeader: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },

  inviteModalEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.9,
  },

  inviteModalTitle: {
    marginTop: 4,
    color: '#1A1C23',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: typography.fontFamily.bold,
  },

  inviteModalDescription: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: typography.fontFamily.regular,
  },

  inviteModalClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  inviteModalForm: {
    paddingHorizontal: 22,
    paddingBottom: 22,
  },

  inviteModalLabel: {
    marginBottom: 7,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  inviteModalInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DCE5EE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: colors.textPrimary,
    fontSize: 14,
  },

  inviteModalError: {
    marginTop: 8,
    color: colors.error,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },

  inviteModalActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  mobileInviteModalActions: {
    flexDirection: 'column-reverse',
  },

  inviteModalSecondary: {
    minHeight: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCE5EE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  inviteModalSecondaryText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  inviteModalPrimary: {
    minHeight: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },

  inviteModalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  sectionSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: typography.fontFamily.regular,
  },

  countPill: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.full,
  },

  countPillText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },

  memberList: {
    marginTop: spacing.xl,
  },

  memberRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  avatar: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },

  memberName: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: typography.fontFamily.semibold,
  },

  memberRole: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },

  activeText: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
  },

  desktopContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: 64,
  },

  mobilePage: { 
    flex: 1, backgroundColor: colors.background 
  },

  mobileScroll: { 
    flex: 1 
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

  backLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
 
  mobileHeader: { 
    alignItems: 'stretch', flexDirection: 'column' 
  },

  headerText: { 
    flex: 1 
  },

  tripLabelRow: { 
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm 
  },

  tripIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EAF4FE',
  },

  header: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },

  title: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: typography.fontFamily.bold,
  },

  mobileTitle: {
    marginTop: spacing.sm,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.4,
  },

  description: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.fontFamily.regular,
  },

  eyebrow: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  inviteButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.fontFamily.semibold,
  },

  mobileInviteButton: {
    width: '100%',
    marginTop: spacing.xs,
  },

  stats: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FC',
    borderWidth: 1,
    borderColor: '#D8E3F0',
    borderRadius: radius.lg,
  },

  mobileStats: { 
    paddingHorizontal: spacing.md 
  },

  stat: { 
    flex: 1, 
    flexDirection: 
    'row', alignItems: 'center', 
    justifyContent: 'center', 
    gap: spacing.sm 
  },

  statIcon: { 
    width: 38, height: 38, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: radius.md 
  },

  blueTone: { 
    backgroundColor: '#EAF1FF' 
  },

  greenTone: { 
    backgroundColor: '#E6F6F1' 
  },

  orangeTone: { 
    backgroundColor: '#FFF3DD' 
  },

  statValue: {
    color: colors.textPrimary,
    fontSize: 19,
    lineHeight: 23,
    fontFamily: typography.fontFamily.bold,
  },

  statLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },

statDivider: {
  width: 1,
  height: 46,
  backgroundColor: '#D6E0EC',
},

  mobileStatDivider: { 
    marginHorizontal: spacing.xs 
  },

  mobileMainGrid: { 
    flexDirection: 'column' 
  },

  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    gap: spacing.md 
  },
  
  rowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },

  memberIdentity: { 
    flex: 1, 
    minWidth: 0 
  },
  memberNameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs 
  },
  
  activeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.xs, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    backgroundColor: '#E6F6F1', 
    borderRadius: radius.full 
  },
  activeDot: { 
    width: 6, 
    height: 6, 
    backgroundColor: colors.secondary, 
    borderRadius: radius.full 
  },
  
  moreButton: { 
    width: 32, height: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: radius.full 
  },
  invitationHeading: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: spacing.md 
  },
  invitationIcon: { 
    width: 40, height: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#EAF1FF', 
    borderRadius: radius.md 
  },
  invitationHeadingText: { 
    flex: 1 
  },
  invitationList: { 
    marginTop: spacing.lg, 
    gap: spacing.sm 
  },
  invitationRow: { 
    minHeight: 60, 
    padding: spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.sm, 
    backgroundColor: colors.background, 
    borderRadius: radius.md 
  },
  mainGrid: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },

  membersCard: {
    flex: 1.55,
    width: '100%',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,

    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
        }
      : {}),
  },

  invitationsCard: {
    flex: 1,
    width: '100%',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,

    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
        }
      : {}),
  },
  pendingAvatar: { 
    width: 34, 
    height: 34, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF3DD', 
    borderRadius: radius.full 
  },
  invitationIdentity: { 
    flex: 1, 
    minWidth: 0 
  },
  invitationEmail: { 
    color: colors.textPrimary, 
    fontSize: typography.fontSize.xs, 
    fontFamily: typography.fontFamily.medium 
  },
  invitationDate: { 
    marginTop: 2, color: colors.textMuted, 
    fontSize: 10, fontFamily: typography.fontFamily.regular 
  },
  resendButton: { 
    width: 30, 
    height: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#EAF1FF', 
    borderRadius: radius.full 
  },
  secondaryInviteButton: { 
    minHeight: 42, 
    marginTop: spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: spacing.sm, 
    borderWidth: 1, 
    borderColor: '#BFD0F7', 
    borderRadius: radius.md 
  },
  secondaryInviteText: { 
    color: colors.primary, 
    fontSize: typography.fontSize.sm, 
    fontFamily: typography.fontFamily.semibold 
  },
  pressed: { 
    opacity: 0.72 
  },
  completeStepCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#D9E7F5',
    borderRadius: radius.lg,
    backgroundColor: '#F7FBFF',
  },

  completeStepCopy: {
    gap: spacing.xs,
  },

  completeStepTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },

  completeStepDescription: {
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
    borderRadius: radius.md,
    backgroundColor: colors.primary,
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
});