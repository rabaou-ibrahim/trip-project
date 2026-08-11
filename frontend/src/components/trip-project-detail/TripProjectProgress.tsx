import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type TripProjectProgressProps = {
  currentStep?: number;
  activeEndStep?: number;
  isDesktop?: boolean;
};

type Step = {
  label: string;
  mobileLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STEPS: Step[] = [
  {
    label: 'Participants',
    mobileLabel: 'Participants',
    icon: 'people-outline',
  },
  {
    label: 'Disponibilités',
    mobileLabel: 'Disponibilités',
    icon: 'calendar-outline',
  },
  {
    label: 'Périodes communes',
    mobileLabel: 'Périodes\ncommunes',
    icon: 'link-outline',
  },
  {
    label: 'Destinations',
    mobileLabel: 'Destinations',
    icon: 'location-outline',
  },
  {
    label: 'Vote',
    mobileLabel: 'Vote',
    icon: 'checkbox-outline',
  },
  {
    label: 'Destination finale',
    mobileLabel: 'Finale',
    icon: 'flag-outline',
  },
  {
    label: 'Organisation',
    mobileLabel: 'Organisation',
    icon: 'briefcase-outline',
  },
];

export function TripProjectProgress({
  currentStep = 3,
  activeEndStep = 4,
  isDesktop = false,
}: TripProjectProgressProps) {
  const firstActiveStep = Math.max(
    0,
    Math.min(currentStep, STEPS.length - 1),
  );

  const lastActiveStep = Math.max(
    firstActiveStep,
    Math.min(activeEndStep, STEPS.length - 1),
  );

  // Mobile : 6 étapes. Desktop : 7 étapes.
  const displayedSteps = isDesktop
    ? STEPS
    : STEPS.slice(0, 6);

  return (
    <View
      style={[
        styles.card,
        isDesktop && styles.desktopCard,
      ]}
    >
      <Text
        style={[
          styles.heading,
          isDesktop && styles.desktopHeading,
        ]}
      >
        Progression du projet
      </Text>

      <View style={styles.stepsRow}>
        {displayedSteps.map((step, index) => {
          const isCompleted = index < firstActiveStep;

          const isActive =
            index >= firstActiveStep &&
            index <= lastActiveStep;

          return (
            <View
              key={step.label}
              style={styles.step}
            >
              {index < displayedSteps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isDesktop && styles.desktopConnector,

                    index < firstActiveStep &&
                      styles.completedConnector,

                    index >= firstActiveStep &&
                      index < lastActiveStep &&
                      styles.activeConnector,
                  ]}
                />
              )}

              <View
                style={[
                  styles.circle,
                  isDesktop && styles.desktopCircle,
                  isCompleted && styles.completedCircle,
                  isActive && styles.activeCircle,
                ]}
              >
                <Ionicons
                  name={
                    isCompleted
                      ? 'checkmark'
                      : step.icon
                  }
                  size={isDesktop ? 17 : 14}
                  color={
                    isCompleted || isActive
                      ? '#FFFFFF'
                      : colors.textMuted
                  }
                />
              </View>

              <Text
                style={[
                  styles.label,
                  isDesktop
                    ? styles.desktopLabel
                    : styles.mobileLabel,
                  isActive && styles.activeLabel,
                ]}
                numberOfLines={2}
              >
                {isDesktop
                  ? step.label
                  : step.mobileLabel}
              </Text>

              {isDesktop && (
                <Text
                  style={[
                    styles.status,
                    isCompleted &&
                      styles.completedStatus,
                    isActive &&
                      styles.activeStatus,
                  ]}
                >
                  {isCompleted
                    ? 'Terminé'
                    : isActive
                      ? 'En cours'
                      : 'À venir'}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  desktopCard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
  },

  heading: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  desktopHeading: {
    marginBottom: spacing.xxl,
    paddingHorizontal: 0,
    fontSize: typography.fontSize.md,
  },

  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  step: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },

  connector: {
    position: 'absolute',
    top: 13,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
  },

  desktopConnector: {
    top: 16,
  },

  completedConnector: {
    backgroundColor: colors.secondary,
  },

  activeConnector: {
    backgroundColor: colors.primary,
  },

  circle: {
    zIndex: 1,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  desktopCircle: {
    width: 34,
    height: 34,
  },

  completedCircle: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },

  activeCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  label: {
    width: '100%',
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },

  mobileLabel: {
    minHeight: 26,
    marginTop: spacing.sm,
    paddingHorizontal: 1,
    fontSize: 8,
    lineHeight: 11,
  },

  desktopLabel: {
    minHeight: 32,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    fontSize: typography.fontSize.xs,
    lineHeight: 16,
  },

  activeLabel: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
  },

  status: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },

  completedStatus: {
    color: colors.secondary,
  },

  activeStatus: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
});