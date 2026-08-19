import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type TripProjectDetailBottomNavigationProps = {
  projectId: number;
  activeItem?: 'overview' | 'participants' | 'planning' | 'expenses' | 'more';
};

export function TripProjectDetailBottomNavigation({
  projectId,
  activeItem = 'overview',
}: TripProjectDetailBottomNavigationProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NavItem
        label="Aperçu"
        icon="home-outline"
        active={activeItem === 'overview'}
        onPress={() =>
          router.replace(`/trip-projects/${projectId}`)
        }
      />

      <NavItem
        label="Participants"
        icon="people-outline"
        active={activeItem === 'participants'}
        onPress={() =>
          router.push(`/trip-projects/${projectId}/participants`)
        }
      />

      <NavItem
        label="Planning"
        icon="calendar-outline"
        active={activeItem === 'planning'}
        onPress={() =>
          router.push(`/trip-projects/${projectId}/availabilities`)
        }
      />

      <NavItem
        label="Dépenses"
        icon="wallet-outline"
        active={activeItem === 'expenses'}
        onPress={() => {
          // écran dépenses pas encore branché
        }}
      />

      <NavItem
        label="Plus"
        icon="ellipsis-horizontal-circle-outline"
        active={activeItem === 'more'}
        onPress={() => {
          // futur menu du voyage
        }}
      />
    </View>
  );
}

type NavItemProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onPress: () => void;
};

function NavItem({
  label,
  icon,
  active,
  onPress,
}: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.item,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={19}
        color={active ? colors.primary : colors.textSecondary}
      />

      <Text
        style={[
          styles.label,
          active && styles.activeLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    paddingHorizontal: spacing.sm,
    paddingTop: 7,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5EBF2',
    backgroundColor: '#FFFFFF',
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontFamily: typography.fontFamily.medium,
  },

  activeLabel: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },

  pressed: {
    opacity: 0.65,
  },
});