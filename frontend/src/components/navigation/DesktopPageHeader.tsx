import { Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { colors, radius, typography } from '@/theme';

type DesktopPageHeaderProps = {
  title: string;
  subtitle?: string;
  avatarLabel: string;
};

export function DesktopPageHeader({
  title,
  subtitle,
  avatarLabel,
}: DesktopPageHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.searchButton}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textPrimary}
          />
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile')}
          style={styles.avatar}
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
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: '#1A1C23',
    fontSize: 36,
    lineHeight: 42,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: typography.fontFamily.regular,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7EF',
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
  },

  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
});