import { Href, Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthTextInput } from '@/components/auth/AuthTextInput';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/services/apiClient';
import { register } from '@/services/authService';
import { colors, spacing, typography } from '@/theme';

type RegisterErrors = {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
};

export default function RegisterScreen() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedFirstname = firstname.trim();
    const normalizedLastname = lastname.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: RegisterErrors = {};

    if (!normalizedFirstname) {
      nextErrors.firstname = 'Le prénom est obligatoire.';
    }

    if (!normalizedLastname) {
      nextErrors.lastname = 'Le nom est obligatoire.';
    }

    if (!normalizedUsername) {
      nextErrors.username = 'Le nom d’utilisateur est obligatoire.';
    }

    if (!normalizedEmail) {
      nextErrors.email = 'L’adresse e-mail est obligatoire.';
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = 'L’adresse e-mail est invalide.';
    }

    if (!password) {
      nextErrors.password = 'Le mot de passe est obligatoire.';
    } else if (password.length < 8) {
      nextErrors.password =
        'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (!passwordConfirmation) {
      nextErrors.passwordConfirmation =
        'Confirmez votre mot de passe.';
    } else if (passwordConfirmation !== password) {
      nextErrors.passwordConfirmation =
        'Les mots de passe ne correspondent pas.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await register({
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      });

      router.replace({
        pathname: '/login',
        params: {
          registered: '1',
          email: normalizedEmail,
        },
      } as Href);
    } catch (error) {
      if (error instanceof ApiError) {
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
      title="Créer un compte"
      subtitle="Rejoignez votre groupe et commencez à préparer votre prochain voyage."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>

          <Link href={'/login' as Href} asChild>
            <Pressable>
              <Text style={styles.link}>Se connecter</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={styles.form}>
        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <AuthTextInput
              label="Prénom"
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Ibrahim"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              maxLength={100}
              error={errors.firstname}
            />
          </View>

          <View style={styles.nameField}>
            <AuthTextInput
              label="Nom"
              value={lastname}
              onChangeText={setLastname}
              placeholder="Rabaou"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              maxLength={100}
              error={errors.lastname}
            />
          </View>
        </View>

        <AuthTextInput
          label="Nom d’utilisateur"
          value={username}
          onChangeText={setUsername}
          placeholder="ibrahim"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          maxLength={100}
          error={errors.username}
        />

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
          maxLength={180}
          error={errors.email}
        />

        <AuthTextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="8 caractères minimum"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={128}
          error={errors.password}
        />

        <AuthTextInput
          label="Confirmer le mot de passe"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          placeholder="Saisissez à nouveau le mot de passe"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          maxLength={128}
          error={errors.passwordConfirmation}
        />

        <Button
          label={submitting ? 'Création…' : 'Créer mon compte'}
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
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