import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { colors, radius, typography } from '@/theme';

type MobileNavigationItemId =
  | 'home'
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

  function handleNavigation(item: MobileNavigationItemId) {
    if (item === 'home') {
      router.push('/');
      return;
    }
    if (item === 'profile') {
      router.push('/profile');
      return;
    }
    console.log(`Open mobile navigation: ${item}`);
  }

  return (
    <View style={styles.navigation}>
      <NavigationItem
        id="home"
        label="Accueil"
        icon={activeItem === 'home' ? 'home' : 'home-outline'}
        active={activeItem === 'home'}
        onPress={() => handleNavigation('home')}
      />

      <NavigationItem
        id="trips"
        label="Voyages"
        icon={activeItem === 'trips' ? 'people' : 'people-outline'}
        active={activeItem === 'trips'}
        onPress={() => handleNavigation('trips')}
      />

      <Pressable
        onPress={() => console.log('Create trip')}
        accessibilityRole="button"
        accessibilityLabel="Créer un voyage"
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.itemPressed,
        ]}
      >
        <Ionicons name="add" size={31} color="#FFFFFF" />
      </Pressable>

      <NavigationItem
        id="invitations"
        label="Invitations"
        icon={
          activeItem === 'invitations'
            ? 'notifications'
            : 'notifications-outline'
        }
        active={activeItem === 'invitations'}
        badge={2}
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

  createButton: {
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