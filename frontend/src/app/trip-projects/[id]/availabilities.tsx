import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import { colors, radius, spacing, typography } from '@/theme';

type AvailabilityTab = 'mine' | 'common';

export default function TripProjectAvailabilitiesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<AvailabilityTab>('mine');

  const isDesktop = width >= 1024;

  const handleBack = () => {
    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id },
    });
  };

  const content = (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir au détail du voyage"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backLabel}>Retour au voyage</Text>
      </Pressable>

      <View style={[styles.screenCard, !isDesktop && styles.mobileScreenCard]}>
        {isDesktop && <Text style={styles.desktopTitle}>Disponibilités</Text>}

        <View
          style={[
            styles.tabs,
            isDesktop ? styles.desktopTabs : styles.mobileTabs,
          ]}
          accessibilityRole="tablist"
        >
          <TabButton
            label="Mes disponibilités"
            selected={activeTab === 'mine'}
            isDesktop={isDesktop}
            onPress={() => setActiveTab('mine')}
          />
          <TabButton
            label="Périodes communes"
            selected={activeTab === 'common'}
            isDesktop={isDesktop}
            onPress={() => setActiveTab('common')}
          />
        </View>

        {!isDesktop && (
          <Text style={styles.mobileTitle}>
            {activeTab === 'mine' ? 'Mes disponibilités' : 'Périodes communes'}
          </Text>
        )}

        <View style={styles.calendarSection}>
        <AvailabilityCalendar
            mode={activeTab}
            isDesktop={isDesktop}
            onPrimaryAction={() => {
            if (activeTab === 'mine') {
                console.log('Enregistrer les disponibilités');
            } else {
                console.log('Proposer des destinations');
            }
            }}
        />
        </View>
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />
        <ScrollView
          style={styles.desktopScroll}
          contentContainerStyle={styles.desktopContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage}>
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
      <MobileBottomNavigation activeItem="trips" />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  isDesktop: boolean;
  onPress: () => void;
};

function TabButton({ label, selected, isDesktop, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tab,
        isDesktop ? styles.desktopTab : styles.mobileTab,
        selected && (isDesktop ? styles.desktopTabSelected : styles.mobileTabSelected),
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
        {label}
      </Text>
      {isDesktop && selected && <View style={styles.desktopIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  desktopScroll: { flex: 1 },
  desktopContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileScroll: { flex: 1 },
  mobileContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },
  backLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  screenCard: {
    marginTop: spacing.xl,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  mobileScreenCard: {
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  desktopTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.semibold,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  desktopTabs: {
    marginTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileTabs: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  tab: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopTab: {
    minWidth: 210,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  mobileTab: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  desktopTabSelected: {},
  mobileTabSelected: {
    backgroundColor: '#EAF1FF',
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  tabTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },
  desktopIndicator: {
    position: 'absolute',
    right: spacing.md,
    bottom: -1,
    left: spacing.md,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  mobileTitle: {
    marginTop: spacing.xl,
    marginLeft: spacing.lg,
    color: colors.textPrimary,
    fontSize: 25,
    fontFamily: typography.fontFamily.semibold,
  },
  panel: {
    minHeight: 300,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  panelIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.full,
  },
  panelText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  pressed: { 
    opacity: 0.72 
  },
  calendarSection: {
    marginTop: spacing.xl,},
});
