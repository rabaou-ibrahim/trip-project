import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { radius, spacing, typography } from '@/theme';

type NavigationItemId =
  | 'home'
  | 'trips'
  | 'invitations'
  | 'profile'
  | 'settings';

type DesktopSidebarProps = {
  activeItem: NavigationItemId;
};

type NavigationItem = {
  id: NavigationItemId;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'home-outline',
  },
  {
    id: 'trips',
    label: 'Voyages',
    icon: 'airplane-outline',
  },
  {
    id: 'invitations',
    label: 'Invitations',
    icon: 'mail-outline',
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'person-circle-outline',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'settings-outline',
  },
];

export function DesktopSidebar({
  activeItem,
}: DesktopSidebarProps) {
  const router = useRouter();

  function handleNavigation(item: NavigationItemId) {
    if (item === 'home') {
      router.push('/');
      return;
    }

    console.log(`Open desktop navigation: ${item}`);
  }

  return (
    <View style={styles.sidebar}>
      <View>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="airplane" size={20} color="#FFFFFF" />
          </View>

          <Text style={styles.logo}>TripProject</Text>
        </View>

        <View style={styles.navigation}>
          {navigationItems.map((item) => {
            const isActive = item.id === activeItem;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleNavigation(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.navigationItem,
                  isActive && styles.navigationItemActive,
                  pressed && styles.itemPressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={19}
                  color={isActive ? '#FFFFFF' : '#AFC0D0'}
                />

                <Text
                  style={[
                    styles.navigationLabel,
                    isActive && styles.navigationLabelActive,
                  ]}
                >
                  {item.label}
                </Text>

                {item.id === 'invitations' && (
                  <View style={styles.invitationBadge}>
                    <Text style={styles.invitationBadgeText}>2</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => console.log('Logout')}
          style={({ pressed }) => [
            styles.logoutRow,
            pressed && styles.itemPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={19} color="#AFC0D0" />
          <Text style={styles.navigationLabel}>Déconnexion</Text>
        </Pressable>

        <Pressable
          onPress={() => handleNavigation('profile')}
          style={({ pressed }) => [
            styles.profile,
            pressed && styles.itemPressed,
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>I</Text>
          </View>

          <View>
            <Text style={styles.profileName}>Ibrahim</Text>
            <Text style={styles.profileHint}>Mon profil</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    height: '100%',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
    backgroundColor: '#0F2B46',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  brandIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F80ED',
    borderRadius: radius.md,
    transform: [{ rotate: '-8deg' }],
  },

  logo: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.5,
  },

  navigation: {
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },

  navigationItem: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
  },

  navigationItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },

  navigationLabel: {
    color: '#AFC0D0',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },

  navigationLabelActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
  },

  invitationBadge: {
    width: 21,
    height: 21,
    marginLeft: -5,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#E98A00',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: radius.full,
  },

  invitationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 13,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    transform: [{ translateY: -0.5 }],
  },

  bottom: {
    gap: spacing.lg,
  },

  logoutRow: {
    minHeight: 42,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  profile: {
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.11)',
  },

  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F80ED',
    borderRadius: radius.full,
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
    fontFamily: typography.fontFamily.regular,
  },

  itemPressed: {
    opacity: 0.72,
  },
});