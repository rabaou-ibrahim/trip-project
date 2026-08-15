import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'tripproject.authToken';

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}