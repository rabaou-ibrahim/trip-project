import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable } from 'react-native';
import { DateField } from '@/components/ui/DateField';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing, typography } from '@/theme';
import { MobileAppHeader } from '@/components/navigation/MobileAppHeader';
import {
  getMe,
  updateMe,
  uploadAvatar,
  getAvatarUrl,
} from '@/services/userService';
import { ApiError } from '@/services/apiClient';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const { user, signOut, refreshUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const isDesktop = width >= 1024;

  const fullName =
    [user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
    user?.username ||
    'Utilisateur';

  const avatarInitial =
    (user?.firstname || user?.username || '?')
      .trim()
      .charAt(0)
      .toUpperCase() || '?';
    
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthdate, setBirthdate] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    getAvatarUrl(user?.avatar ?? null)
  );

  useEffect(() => {
    void getMe()
      .then((profile) => {
        setFirstname(profile.firstname ?? '');
        setLastname(profile.lastname ?? '');
        setUsername(profile.username ?? '');
        setPhoneNumber(profile.phoneNumber ?? '');
        setBirthdate(profile.birthdate ?? '');
        setAvatarUri(getAvatarUrl(profile.avatar));
      })
      .catch(() => {
        setProfileError('Impossible de charger votre profil.');
      });
  }, []);

  async function handleSaveProfile() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await updateMe({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim() || null,
        birthdate: birthdate.trim() || null,
      });

      await refreshUser();

      setProfileSuccess('Profil mis à jour.');
     } catch (error) {
    if (error instanceof ApiError) {
      setProfileError(error.message);
    } else {
      setProfileError('Une erreur inattendue est survenue.');
    }
  } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
        await signOut();
        router.replace('/welcome');
        } finally {
        setSigningOut(false);
    }
  }

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const uri = result.assets[0].uri;

    setAvatarUri(uri);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const response = await uploadAvatar(uri);
      setAvatarUri(getAvatarUrl(response.avatar));
      await refreshUser();
      setProfileSuccess('Photo de profil mise à jour.');
    } catch (error) {
      if (error instanceof ApiError) {
        setProfileError(error.message);
      } else {
        setProfileError(
          'Impossible de modifier la photo de profil.',
        );
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        {isDesktop && <DesktopSidebar activeItem="profile" />}

        <View style={styles.main}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isDesktop && styles.desktopScrollContent,
            ]}
          >
            <View style={styles.content}>
              {!isDesktop && (
                <MobileAppHeader
                  avatarLabel={avatarInitial}
                  onMenuPress={() => console.log('Ouvrir le menu')}
                  onSearchPress={() => console.log('Rechercher')}
                  onProfilePress={() => router.push('/profile')}
                />
              )}
              <View
                style={[
                  styles.heading,
                  !isDesktop && styles.mobileHeading,
                ]}
              >
                <Text
                  style={isDesktop ? styles.title : styles.mobileTitle}
                >
                  Mon profil
                </Text>

                <Text
                  style={isDesktop ? styles.subtitle : styles.mobileSubtitle}
                >
                  Retrouvez les informations associées à votre compte.
                </Text>
              </View>

              <Card>
                <View style={styles.cardContent}>
                  <View style={styles.identity}>
                    <Pressable
                      onPress={() => void handlePickAvatar()}
                      style={({ pressed }) => [
                        styles.avatarContainer,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {avatarInitial}
                          </Text>
                        </View>
                      )}
                      <View style={styles.avatarEditButton}>
                        <Ionicons
                          name="camera"
                          size={14}
                          color="#FFFFFF"
                        />
                      </View>
                    </Pressable>

                    <View style={styles.identityText}>
                      <Text style={styles.fullName}>
                        {fullName}
                      </Text>

                      <Text style={styles.username}>
                        @{user?.username}
                      </Text>

                      <Pressable
                        onPress={() => void handlePickAvatar()}
                      >
                        <Text style={styles.changeAvatarText}>
                          Modifier la photo
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.form}>
                    <View style={styles.formRow}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Prénom</Text>
                        <TextInput
                          value={firstname}
                          onChangeText={setFirstname}
                          style={styles.input}
                        />
                      </View>

                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Nom</Text>
                        <TextInput
                          value={lastname}
                          onChangeText={setLastname}
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.formRow}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Nom d’utilisateur</Text>
                        <TextInput
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                          style={styles.input}
                        />
                      </View>

                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Téléphone</Text>
                        <TextInput
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                          style={styles.input}
                        />
                      </View>
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>Date de naissance</Text>
                      <DateField
                        value={birthdate}
                        label=""
                        onChange={setBirthdate}
                      />
                    </View>
                  </View>

                  {profileError && (
                    <Text style={styles.errorText}>
                      {profileError}
                    </Text>
                  )}

                  {profileSuccess && (
                    <Text style={styles.successText}>
                      {profileSuccess}
                    </Text>
                  )}

                  <Button
                    label={
                      isSaving
                        ? 'Enregistrement…'
                        : 'Enregistrer'
                    }
                    onPress={() => void handleSaveProfile()}
                    disabled={isSaving}
                  />
                </View>
              </Card>
            </View>
          </ScrollView>

          {!isDesktop && (
            <MobileBottomNavigation activeItem="profile" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },


  form: {
    gap: 12,
  },

  formRow: {
    flexDirection: 'row',
    gap: 10,
  },

  formColumn: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },

  field: {
    gap: 5,
  },

  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
  },

  input: {
    minHeight: 40,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 12.5,
    fontFamily: typography.fontFamily.regular,
  },

  cardContent: {
    gap: 16,
  },

  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },

  successText: {
    color: colors.secondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 88,
  },

  heading: {
    marginBottom: 22,
  },

  mobileHeading: {
    marginBottom: 22,
  },

  title: {
    color: '#1A1C23',
    fontSize: 34,
    lineHeight: 40,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.7,
  },

  mobileTitle: {
    color: '#1A1C23',
    fontSize: 24,
    lineHeight: 29,
    fontFamily: typography.fontFamily.displayBold,
    letterSpacing: -0.4,
    },

  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },

  mobileSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: typography.fontFamily.regular,
  },
  page: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },

  desktopScrollContent: {
    padding: spacing.xxxl,
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  
  avatar: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
  },

  avatarContainer: {
    position: 'relative',
  },

  avatarEditButton: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  changeAvatarText: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },

  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  fullName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  username: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  information: {
    gap: spacing.lg,
  },
  informationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  informationIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  informationText: {
    flex: 1,
    gap: spacing.xs,
  },
  informationLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },
  informationValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
  },
});