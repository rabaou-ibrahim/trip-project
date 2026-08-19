import { useState } from 'react';
import { router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthTextInput } from '@/components/auth/AuthTextInput';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/services/apiClient';
import { createTripProject } from '@/services/tripProjectService';
import { colors, radius, spacing, typography } from '@/theme';

type CreateTripErrors = {
  title?: string;
  general?: string;
};

export default function CreateTripProjectScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<CreateTripErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setErrors({
        title: 'Le titre est obligatoire.',
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await createTripProject({
        title: normalizedTitle,
        description:
          normalizedDescription !== ''
            ? normalizedDescription
            : undefined,
      });

      router.replace({
        pathname: '/trip-projects/[id]',
        params: {
          id: String(response.tripProject.id),
        },
      });
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
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>NOUVEAU VOYAGE</Text>

        <Text style={styles.title}>Créer un voyage</Text>

        <Text style={styles.subtitle}>
          Donnez un nom à votre projet. Vous pourrez compléter son organisation
          ensuite.
        </Text>

        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.generalErrorText}>
              {errors.general}
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <AuthTextInput
            label="Titre du voyage"
            value={title}
            onChangeText={setTitle}
            placeholder="Vacances été 2027"
            autoCapitalize="sentences"
            maxLength={150}
            error={errors.title}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Description (facultative)</Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Quelques mots sur votre projet…"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>

          <View style={styles.actions}>
            <Button
              label={submitting ? 'Création…' : 'Créer le voyage'}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            />

            <Button
              label="Annuler"
              onPress={() => router.back()}
              disabled={submitting}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  card: {
    width: '100%',
    maxWidth: 640,
    padding: spacing.xxl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E0D3C1',
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1.2,
  },

  title: {
    color: colors.brandDark,
    fontSize: 30,
    fontFamily: typography.fontFamily.displayBold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
    fontFamily: typography.fontFamily.regular,
  },

  form: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },

  field: {
    gap: spacing.sm,
  },

  label: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  descriptionInput: {
    minHeight: 130,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D8CCBC',
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },

  actions: {
    gap: spacing.md,
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
});