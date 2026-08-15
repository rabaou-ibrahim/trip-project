import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SplineSans_600SemiBold,
  SplineSans_700Bold,
} from '@expo-google-fonts/spline-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography } from '@/theme';

function RootNavigator() {
  const {
    status,
    isAuthenticated,
    sessionError,
    retrySession,
  } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingMark}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>TripProject</Text>
        <Text style={styles.loadingText}>Chargement de votre session…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Connexion impossible</Text>
        <Text style={styles.errorText}>{sessionError}</Text>

        <View style={styles.retryButton}>
          <Button
            label="Réessayer"
            onPress={() => void retrySession()}
          />
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.backgroundWarm,
  },
  loadingMark: {
    width: 70,
    height: 70,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: '#DDE8F2',
    transform: [{ rotate: '-2deg' }],
  },
  loadingTitle: {
    color: colors.brandDark,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
  },
  errorText: {
    maxWidth: 420,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    width: '100%',
    maxWidth: 240,
    marginTop: spacing.sm,
  },
});
