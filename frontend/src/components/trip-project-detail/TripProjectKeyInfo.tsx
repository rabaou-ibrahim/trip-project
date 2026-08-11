import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '@/theme';

type TripProjectKeyInfoProps = {
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  currency?: string;
  voteStatus: string;
  createdAt: string;
  isDesktop?: boolean;
};

type InformationRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function TripProjectKeyInfo({
  startDate,
  endDate,
  estimatedBudget,
  currency = 'EUR',
  voteStatus,
  createdAt,
  isDesktop = false,
}: TripProjectKeyInfoProps) {
  return (
    <View style={[styles.card, isDesktop && styles.desktopCard]}>
      <Text style={styles.title}>Informations clés</Text>

      <View style={styles.list}>
        <InformationRow
          icon="calendar-outline"
          label="Dates consolidées"
          value={formatDateRange(startDate, endDate)}
        />

        <InformationRow
          icon="wallet-outline"
          label="Budget estimé"
          value={`${formatCurrency(estimatedBudget, currency)} / personne`}
        />

        <InformationRow
          icon="checkmark-circle-outline"
          label="Statut"
          value={voteStatus}
        />

        <InformationRow
          icon="time-outline"
          label="Créé par"
          value={formatDate(createdAt)}
        />
      </View>
    </View>
  );
}

function InformationRow({ icon, label, value }: InformationRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const monthYear = end.toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    });

    return `${start.getDate()} – ${end.getDate()} ${monthYear}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const styles = StyleSheet.create({
  card: {
    height: '100%',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  desktopCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semibold,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  value: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
});