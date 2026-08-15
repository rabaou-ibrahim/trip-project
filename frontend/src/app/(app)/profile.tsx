import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const isDesktop = width >= 1024;

  const fullName =
    [user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
    user?.username ||
    'Utilisateur';

  const avatarInitial =
    (user?.firstname || user?.username || '?')
      .trim()
      .charAt(0)
      .toUpperCase() || '?';

  async function handleLogout() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
        await signOut();
        router.replace('/welcome');
        } finally {
        setSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        {isDesktop && <DesktopSidebar activeItem="profile" />}

        <View style={styles.main}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isDesktop && styles.desktopScrollContent,
            ]}
          >
            <View style={styles.content}>
              <View style={styles.heading}>
                <Text style={styles.title}>Mon profil</Text>
                <Text style={styles.subtitle}>
                  Retrouvez les informations associées à votre compte.
                </Text>
              </View>

              <Card>
                <View style={styles.cardContent}>
                  <View style={styles.identity}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {avatarInitial}
                      </Text>
                    </View>

                    <View style={styles.identityText}>
                      <Text style={styles.fullName}>{fullName}</Text>
                      <Text style={styles.username}>
                        @{user?.username}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.information}>
                    <View style={styles.informationRow}>
                      <View style={styles.informationIcon}>
                        <Ionicons
                          name="mail-outline"
                          size={19}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.informationText}>
                        <Text style={styles.informationLabel}>
                          Adresse e-mail
                        </Text>
                        <Text style={styles.informationValue}>
                          {user?.email}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.informationRow}>
                      <View style={styles.informationIcon}>
                        <Ionicons
                          name="person-outline"
                          size={19}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.informationText}>
                        <Text style={styles.informationLabel}>
                          Nom d’utilisateur
                        </Text>
                        <Text style={styles.informationValue}>
                          {user?.username}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Button
                    label={
                      signingOut
                        ? 'Déconnexion…'
                        : 'Se déconnecter'
                    }
                    onPress={() => void handleLogout()}
                    disabled={signingOut}
                    variant="ghost"
                  />
                </View>
              </Card>
            </View>
          </ScrollView>

          {!isDesktop && (
            <MobileBottomNavigation activeItem="profile" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  desktopScrollContent: {
    padding: spacing.xxxl,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  cardContent: {
    gap: spacing.xl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  fullName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  username: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  information: {
    gap: spacing.lg,
  },
  informationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  informationIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  informationText: {
    flex: 1,
    gap: spacing.xs,
  },
  informationLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
  informationValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
});