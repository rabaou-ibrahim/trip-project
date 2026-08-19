import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { colors, radius, typography } from '@/theme';
import { usePendingInvitationCount } from '@/hooks/usePendingInvitationCount';

type MobileNavigationItemId =
  | 'trips'
  | 'invitations'
  | 'profile';

type MobileBottomNavigationProps = {
  activeItem: MobileNavigationItemId;
};

type NavigationItemProps = {
  id: MobileNavigationItemId;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  badge?: number;
  onPress: () => void;
};

export function MobileBottomNavigation({
  activeItem,
}: MobileBottomNavigationProps) {
  const router = useRouter();
  const invitationCount = usePendingInvitationCount()

  function handleNavigation(item: MobileNavigationItemId) {
    if (item === 'trips') {
      router.push('/');
      return;
    }

    if (item === 'invitations') {
      router.push('/invitations');
      return;
    }

    if (item === 'profile') {
      router.push('/profile');
    }
  }

  return (
    <View style={styles.navigation}>
      <NavigationItem
        id="trips"
        label="Voyages"
        icon={activeItem === 'trips' ? 'airplane' : 'airplane-outline'}
        active={activeItem === 'trips'}
        onPress={() => handleNavigation('trips')}
      />

      <NavigationItem
        id="invitations"
        label="Invitations"
        icon={
          activeItem === 'invitations'
            ? 'notifications'
            : 'notifications-outline'
        }
        active={activeItem === 'invitations'}
        badge={invitationCount}
        onPress={() => handleNavigation('invitations')}
      />

      <NavigationItem
        id="profile"
        label="Profil"
        icon={
          activeItem === 'profile'
            ? 'person-circle'
            : 'person-circle-outline'
        }
        active={activeItem === 'profile'}
        onPress={() => handleNavigation('profile')}
      />
    </View>
  );
}

function NavigationItem({
  label,
  icon,
  active,
  badge,
  onPress,
}: NavigationItemProps) {
  const color = active ? colors.primary : '#52657B';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.navigationItem,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={color} />

        {typeof badge === 'number' && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.label,
          active && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navigation: {
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

  navigationItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    color: '#52657B',
    fontSize: 10.5,
    fontFamily: typography.fontFamily.medium,
  },

  labelActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },

  badge: {
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

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
  },

  itemPressed: {
    opacity: 0.72,
  },
});