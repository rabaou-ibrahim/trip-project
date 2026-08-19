import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  acceptInvitation,
  declineInvitation,
  getReceivedInvitations,
  type ReceivedInvitation,
} from '@/services/tripProjectService';
import { colors, radius, spacing, typography } from '@/theme';
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext';
import { MobileAppHeader } from '@/components/navigation/MobileAppHeader';

export default function InvitationsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [invitations, setInvitations] = useState<ReceivedInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleAccept = async (invitationId: number) => {
    try {
        const response = await acceptInvitation(invitationId);

        router.push({
        pathname: '/trip-projects/[id]',
        params: {
            id: String(response.tripProjectId),
        },
        });
    } catch {
        setError('Impossible d’accepter cette invitation.');
    }
  };

  const handleDecline = async (invitationId: number) => {
    try {
        await declineInvitation(invitationId);

        setInvitations((current) =>
        current.filter((invitation) => invitation.participantId !== invitationId),
        );
    } catch {
        setError('Impossible de refuser cette invitation.');
    }
  };

  useEffect(() => {
    void getReceivedInvitations()
        .then((data) => {

        setInvitations(data);
        setError(null);
        })
        .catch(() => {
        setError('Impossible de charger les invitations.');
        })
        .finally(() => {
        setIsLoading(false);
        });
  }, []);
  

  const content = (
    <View style={styles.content}>
      {!isDesktop && (
        <MobileAppHeader
            avatarLabel={(user?.firstname || user?.username || 'U')
            .charAt(0)
            .toUpperCase()}
            onMenuPress={() => console.log('Ouvrir le menu')}
            onSearchPress={() => console.log('Rechercher')}
            onProfilePress={() => router.push('/profile')}
        />
        )}

        <View
        style={[
            styles.pageHeading,
            !isDesktop && styles.mobilePageHeading,
        ]}
        >
        <Text
            style={[
            styles.title,
            !isDesktop && styles.mobileTitle,
            ]}
        >
            Invitations
        </Text>

        <Text
            style={[
            styles.subtitle,
            !isDesktop && styles.mobileSubtitle,
            ]}
        >
            Retrouvez les voyages auxquels vous avez été invité.
        </Text>
        </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>
            Chargement des invitations…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : invitations.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="mail-open-outline"
              size={28}
              color={colors.textMuted}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Aucune invitation
          </Text>

          <Text style={styles.emptyDescription}>
            Les invitations reçues apparaîtront ici.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {invitations.map((invitation) => (
            <View
              key={invitation.participantId}
              style={styles.invitationCard}
            >
              <View style={styles.invitationMain}>
                <View style={styles.invitationIcon}>
                  <Ionicons
                    name="airplane-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.invitationCopy}>
                  <Text style={styles.invitationLabel}>
                    INVITATION À REJOINDRE
                  </Text>

                  <Text style={styles.invitationTitle}>
                    {invitation.title}
                  </Text>

                  <Text style={styles.invitationDate}>
                    Reçue le{' '}
                    {new Date(invitation.createdAt).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => void handleDecline(invitation.participantId)}
                  style={styles.declineButton}
                >
                  <Text style={styles.declineButtonText}>
                    Refuser
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => void handleAccept(invitation.participantId)}
                  style={styles.acceptButton}
                >
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color="#FFFFFF"
                  />

                  <Text style={styles.acceptButtonText}>
                    Accepter
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="invitations" />

        <ScrollView
          style={styles.scroll}
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
        style={styles.scroll}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>

      <MobileBottomNavigation activeItem="invitations" />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },

  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },

  mobileContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 88,
    },

    content: {
    width: '100%',
    },

    pageHeading: {
    marginBottom: 22,
    },

    mobilePageHeading: {
    marginBottom: 22,
    },

    title: {
    color: '#1A1C23',
    fontSize: 34,
    lineHeight: 40,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.7,
    },

    mobileTitle: {
    color: '#1A1C23',
    fontSize: 24,
    lineHeight: 29,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.4,
    },

    subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
    },

    mobileSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: typography.fontFamily.regular,
    },

  scroll: {
    flex: 1,
  },

  desktopContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 36,
    paddingTop: 42,
    paddingBottom: 60,
  },

  list: {
    marginTop: 28,
    gap: 16,
  },

  invitationIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#EAF4FE',
  },

  invitationCard: {
    width: '100%',
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    },

    invitationMain: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    },

    invitationCopy: {
    flex: 1,
    minWidth: 0,
    },

    actions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    },

  invitationLabel: {
    color: colors.primary,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.7,
    fontFamily: typography.fontFamily.bold,
    },

  invitationTitle: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: typography.fontFamily.semibold,
  },

  invitationDate: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },

  declineButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    },

    acceptButton: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        borderRadius: 12,
        backgroundColor: colors.primary,
    },

  declineButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },

  emptyCard: {
    marginTop: 28,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#F2F6FA',
  },

  emptyTitle: {
    marginTop: 14,
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.semibold,
  },

  emptyDescription: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },

  stateCard: {
    marginTop: 28,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});