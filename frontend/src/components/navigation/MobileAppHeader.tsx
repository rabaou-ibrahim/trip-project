import { Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, typography } from '@/theme';

type MobileAppHeaderProps = {
  avatarLabel: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
};

export function MobileAppHeader({
  avatarLabel,
  onMenuPress,
  onSearchPress,
  onProfilePress,
}: MobileAppHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le menu"
        style={({ pressed }) => [
          styles.action,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="menu"
          size={22}
          color={colors.textPrimary}
        />
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Rechercher"
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textPrimary}
          />
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le profil"
          style={({ pressed }) => [
            styles.avatar,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.avatarText}>
            {avatarLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  action: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },

  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },

  pressed: {
    opacity: 0.72,
  },
});