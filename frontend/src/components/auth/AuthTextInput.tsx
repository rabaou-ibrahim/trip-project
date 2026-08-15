import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type AuthTextInputProps = Omit<
  TextInputProps,
  'style' | 'secureTextEntry'
> & {
  label: string;
  error?: string;
  password?: boolean;
};

export function AuthTextInput({
  label,
  error,
  password = false,
  ...inputProps
}: AuthTextInputProps) {
  const [passwordHidden, setPasswordHidden] = useState(password);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          {...inputProps}
          secureTextEntry={password && passwordHidden}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[
            styles.input,
            password && styles.passwordInput,
            error && styles.inputError,
          ]}
        />

        {password && (
          <Pressable
            onPress={() => setPasswordHidden((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={
              passwordHidden
                ? 'Afficher le mot de passe'
                : 'Masquer le mot de passe'
            }
            hitSlop={8}
            style={styles.passwordButton}
          >
            <Ionicons
              name={passwordHidden ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
  },
  passwordInput: {
    paddingRight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordButton: {
    position: 'absolute',
    top: 0,
    right: spacing.lg,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
});