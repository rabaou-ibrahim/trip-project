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

const MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Ibrahim',
    initials: 'IB',
    role: 'Propriétaire',
    color: '#2563EB',
  },
  {
    id: 2,
    name: 'Alice',
    initials: 'AL',
    role: 'Membre',
    color: '#0F766E',
  },
  {
    id: 3,
    name: 'Mehdi',
    initials: 'ME',
    role: 'Membre',
    color: '#D97706',
  },
  {
    id: 4,
    name: 'Lucas',
    initials: 'LU',
    role: 'Membre',
    color: '#7C3AED',
  },
  {
    id: 5,
    name: 'Chloé',
    initials: 'CH',
    role: 'Membre',
    color: '#DB2777',
  },
];

const INVITATIONS: Invitation[] = [
  {
    id: 1,
    email: 'sarah@example.com',
    sentAt: 'Envoyée aujourd’hui',
  },
  {
    id: 2,
    email: 'yassine@example.com',
    sentAt: 'Envoyée hier',
  },
];

export default function TripProjectParticipantsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const handleBack = () => {
    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id },
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

      <View style={[styles.header, !isDesktop && styles.mobileHeader]}>
        <View style={styles.headerText}>
          <View style={styles.tripLabelRow}>
            <View style={styles.flag}>
              <View style={styles.flagCircle} />
            </View>
            <Text style={styles.eyebrow}>JAPON ÉTÉ 2027</Text>
          </View>

          <Text style={[styles.title, !isDesktop && styles.mobileTitle]}>
            Participants
          </Text>
          <Text style={styles.description}>
            Gérez les membres et les invitations de ce voyage.
          </Text>
        </View>

        <Pressable
          onPress={() => console.log('Inviter un participant')}
          accessibilityRole="button"
          accessibilityLabel="Inviter un participant"
          style={({ pressed }) => [
            styles.inviteButton,
            !isDesktop && styles.mobileInviteButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
          <Text style={styles.inviteButtonText}>Inviter un proche</Text>
        </Pressable>
      </View>

      <View style={[styles.stats, !isDesktop && styles.mobileStats]}>
        <Stat
          icon="people-outline"
          value={`${MEMBERS.length}`}
          label="participants"
          tone="blue"
        />
        <View style={[styles.statDivider, !isDesktop && styles.mobileStatDivider]} />
        <Stat
          icon="shield-checkmark-outline"
          value="1"
          label="propriétaire"
          tone="green"
        />
        <View style={[styles.statDivider, !isDesktop && styles.mobileStatDivider]} />
        <Stat
          icon="mail-unread-outline"
          value={`${INVITATIONS.length}`}
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
              <Text style={styles.countPillText}>{MEMBERS.length}</Text>
            </View>
          </View>

          <View style={styles.memberList}>
            {MEMBERS.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                isLast={index === MEMBERS.length - 1}
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
            {INVITATIONS.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} />
            ))}
          </View>

          <Pressable
            onPress={() => console.log('Inviter une autre personne')}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryInviteButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.secondaryInviteText}>Nouvelle invitation</Text>
          </Pressable>
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

      <View style={styles.activeBadge}>
        <View style={styles.activeDot} />
        <Text style={styles.activeText}>Actif</Text>
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

function InvitationRow({ invitation }: { invitation: Invitation }) {
  return (
    <View style={styles.invitationRow}>
      <View style={styles.pendingAvatar}>
        <Ionicons name="mail-outline" size={18} color={colors.warning} />
      </View>
      <View style={styles.invitationIdentity}>
        <Text style={styles.invitationEmail} numberOfLines={1}>
          {invitation.email}
        </Text>
        <Text style={styles.invitationDate}>{invitation.sentAt}</Text>
      </View>
      <Pressable
        onPress={() => console.log(`Renvoyer à ${invitation.email}`)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.resendButton, pressed && styles.pressed]}
      >
        <Ionicons name="refresh" size={15} color={colors.primary} />
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
  desktopScroll: { flex: 1 },
  desktopContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  mobilePage: { flex: 1, backgroundColor: colors.background },
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
  header: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  mobileHeader: { alignItems: 'stretch', flexDirection: 'column' },
  headerText: { flex: 1 },
  tripLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flag: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
  },
  flagCircle: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: '#E32636' },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
  title: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.semibold,
  },
  mobileTitle: { 
    fontSize: typography.fontSize.xl 
  },
  description: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 20,
  },
  inviteButton: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  mobileInviteButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
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
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  statIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  blueTone: { backgroundColor: '#EAF1FF' },
  greenTone: { backgroundColor: '#E6F6F1' },
  orangeTone: { backgroundColor: '#FFF3DD' },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
    },
  
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#CAD7E7',
  },
  mobileStatDivider: { marginHorizontal: spacing.xs },
  mainGrid: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  mobileMainGrid: { flexDirection: 'column' },
  membersCard: { flex: 1.55, width: '100%', padding: spacing.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  invitationsCard: { flex: 1, width: '100%', padding: spacing.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.semibold },
  sectionSubtitle: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.regular },
  countPill: { minWidth: 30, height: 30, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF', borderRadius: radius.full },
  countPillText: { color: colors.primary, fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.bold },
  memberList: { marginTop: spacing.lg },
  memberRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 42, height: 42, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  avatarText: { color: '#FFFFFF', fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.bold },
  memberIdentity: { flex: 1, minWidth: 0 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  memberName: { color: colors.textPrimary, fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semibold },
  memberRole: { marginTop: 2, color: colors.textMuted, fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.regular },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: '#E6F6F1', borderRadius: radius.full },
  activeDot: { width: 6, height: 6, backgroundColor: colors.secondary, borderRadius: radius.full },
  activeText: { color: colors.secondary, fontSize: 10, fontFamily: typography.fontFamily.medium },
  moreButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  invitationHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  invitationIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF', borderRadius: radius.md },
  invitationHeadingText: { flex: 1 },
  invitationList: { marginTop: spacing.lg, gap: spacing.sm },
  invitationRow: { minHeight: 60, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background, borderRadius: radius.md },
  pendingAvatar: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3DD', borderRadius: radius.full },
  invitationIdentity: { flex: 1, minWidth: 0 },
  invitationEmail: { color: colors.textPrimary, fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.medium },
  invitationDate: { marginTop: 2, color: colors.textMuted, fontSize: 10, fontFamily: typography.fontFamily.regular },
  resendButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF', borderRadius: radius.full },
  secondaryInviteButton: { minHeight: 42, marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: '#BFD0F7', borderRadius: radius.md },
  secondaryInviteText: { color: colors.primary, fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semibold },
  pressed: { opacity: 0.72 },
});