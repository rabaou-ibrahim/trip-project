import { Href, Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthTextInput } from '@/components/auth/AuthTextInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/apiClient';
import { colors, spacing, typography } from '@/theme';

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    registered?: string;
  }>();

  const { signIn } = useAuth();

  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : '',
  );
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: LoginErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = 'L’adresse e-mail est obligatoire.';
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = 'L’adresse e-mail est invalide.';
    }

    if (!password) {
      nextErrors.password = 'Le mot de passe est obligatoire.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await signIn({
        email: normalizedEmail,
        password,
      });
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrors({
          general: 'L’adresse e-mail ou le mot de passe est incorrect.',
        });
      } else if (error instanceof ApiError) {
        setErrors({
          general: error.message,
        });
      } else {
        setErrors({
          general:
            'Impossible de joindre le serveur. Vérifiez votre connexion.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Retrouvez vos projets de voyage et les décisions de votre groupe."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>

          <Link href={'/register' as Href} asChild>
            <Pressable>
              <Text style={styles.link}>Créer un compte</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={styles.form}>
        {params.registered === '1' && (
          <View style={styles.success}>
            <Text style={styles.successText}>
              Votre compte a été créé. Vous pouvez maintenant vous connecter.
            </Text>
          </View>
        )}

        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        <AuthTextInput
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.fr"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          error={errors.email}
        />

        <AuthTextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="Votre mot de passe"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          error={errors.password}
        />

        <Button
          label={submitting ? 'Connexion…' : 'Se connecter'}
          onPress={() => void handleSubmit()}
          disabled={submitting}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  success: {
    padding: spacing.md,
    backgroundColor: `${colors.success}18`,
  },
  successText: {
    color: colors.success,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  generalError: {
    padding: spacing.md,
    backgroundColor: `${colors.error}12`,
  },
  generalErrorText: {
    color: colors.error,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  link: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },
});