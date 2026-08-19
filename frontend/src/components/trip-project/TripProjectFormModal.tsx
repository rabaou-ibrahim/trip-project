import Ionicons from '@expo/vector-icons/Ionicons';
import { DateField } from '@/components/ui/DateField';
import { createElement, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { ApiError } from '@/services/apiClient';
import {
  createTripProject,
  type CreateTripProjectInput,
} from '@/services/tripProjectService';
import { colors, radius, spacing, typography } from '@/theme';

type TripProjectFormModalProps = {
  visible: boolean;
  mode: 'create';
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

type FormErrors = {
  title?: string;
  general?: string;
};

export function TripProjectFormModal({
  visible,
  mode,
  onClose,
  onSuccess,
}: TripProjectFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setEstimatedBudget('');
      setErrors({});
      setSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setErrors({
        title: 'Le titre est obligatoire.',
      });
      return;
    }

    const payload: CreateTripProjectInput = {
      title: normalizedTitle,
    };

    const normalizedDescription = description.trim();
    const normalizedStartDate = startDate.trim();
    const normalizedEndDate = endDate.trim();
    const normalizedBudget = estimatedBudget.trim();

    if (normalizedDescription) {
      payload.description = normalizedDescription;
    }

    if (normalizedStartDate) {
      payload.startDate = normalizedStartDate;
    }

    if (normalizedEndDate) {
      payload.endDate = normalizedEndDate;
    }

    if (normalizedBudget) {
      payload.estimatedBudget = normalizedBudget;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await createTripProject(payload);
      await onSuccess();
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

  if (mode !== 'create') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          isMobile && styles.mobileOverlay,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={submitting ? undefined : onClose}
        />

        <View
          style={[
            styles.modalCard,
            isMobile && styles.mobileModalCard,
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Créer un voyage</Text>
            </View>

            <Pressable
              onPress={onClose}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={22} color={colors.brandDark} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Commencez avec les informations déjà connues. Tout ce qui est
            facultatif pourra être complété plus tard.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {errors.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <FormField
              label="Titre du voyage *"
              value={title}
              onChangeText={setTitle}
              placeholder="Vacances été 2027"
              error={errors.title}
            />

            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Quelques mots sur le projet…"
              multiline
            />

            <View style={[styles.row, isMobile && styles.mobileRow]}>
              <View style={styles.rowField}>
                <DateField
                  label="Date de début"
                  value={startDate}
                  onChange={setStartDate}
                />
              </View>

              <View style={styles.rowField}>
                <DateField
                  label="Date de fin"
                  value={endDate}
                  onChange={setEndDate}
                />
              </View>
            </View>

            <FormField
              label="Budget estimé"
              value={estimatedBudget}
              onChangeText={setEstimatedBudget}
              placeholder="1500"
              keyboardType="decimal-pad"
            />

            <View
              style={[
                styles.actions,
                isMobile && styles.mobileActions,
              ]}
            >
              <View
                style={[
                  styles.action,
                  isMobile && styles.mobileAction,
                ]}
              >
                <Button
                  label="Annuler"
                  onPress={onClose}
                  disabled={submitting}
                />
              </View>

              <View
                style={[
                  styles.action,
                  isMobile && styles.mobileAction,
                ]}
              >
                <Button
                  label={submitting ? 'Création…' : 'Créer le voyage'}
                  onPress={() => void handleSubmit()}
                  disabled={submitting}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad';
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = 'default',
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.textarea,
          error && styles.inputError,
        ]}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.38)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '88%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4EAF1',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',

    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 10,
  },

  field: {
    gap: 7,
  },

  label: {
    color: '#1A1C23',
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#DDE5ED',
    borderRadius: 12,
    backgroundColor: '#FDFEFF',
    color: '#1A1C23',
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },

  header: {
  paddingHorizontal: 24,
  paddingTop: 22,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: spacing.lg,
},

eyebrow: {
  color: colors.primary,
  fontSize: 10,
  fontFamily: typography.fontFamily.bold,
  letterSpacing: 1,
},

title: {
  marginTop: 4,
  color: '#1A1C23',
  fontSize: 25,
  lineHeight: 30,
  fontFamily: typography.fontFamily.displayBold,
},

subtitle: {
  paddingHorizontal: 24,
  marginTop: 6,
  color: colors.textSecondary,
  fontSize: 12,
  lineHeight: 18,
  fontFamily: typography.fontFamily.regular,
},

form: {
  paddingHorizontal: 24,
  paddingTop: 20,
  paddingBottom: 22,
  gap: 16,
},

  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DED2C2',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceWarm,
  },

  actions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  textarea: {
    minHeight: 105,
    paddingTop: 12,
    paddingBottom: 12,
  },

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  generalError: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.error}12`,
  },

  generalErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  rowField: {
    flex: 1,
    minWidth: 200,
  },

  action: {
    minWidth: 150,
  },

  pressed: {
    opacity: 0.72,
  },

  mobileOverlay: {
    justifyContent: 'flex-end',
    padding: 0,
  },

  mobileModalCard: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '92%',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  mobileRow: {
    flexDirection: 'column',
  },

  mobileActions: {
    flexDirection: 'column-reverse',
    gap: 10,
  },

  mobileAction: {
    width: '100%',
  },
});