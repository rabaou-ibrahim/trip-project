import { apiRequest } from '@/services/apiClient';
import { Platform } from 'react-native';

export type Me = {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  phoneNumber: string | null;
  birthdate: string | null;
  avatar: string | null;
};

export type UpdateMeInput = {
  firstname?: string;
  lastname?: string;
  username?: string;
  phoneNumber?: string | null;
  birthdate?: string | null;
  avatar?: string | null;
};

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL doit être configurée.');
}

const API_URL = configuredApiUrl.replace(/\/+$/, '');

export function getMe(): Promise<Me> {
  return apiRequest<Me>('/api/me');
}

export function updateMe(data: UpdateMeInput): Promise<Me> {
  return apiRequest<Me>('/api/me', {
    method: 'PATCH',
    body: data,
  });
}

export async function uploadAvatar(
  uri: string,
): Promise<{ avatar: string }> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blobResponse = await fetch(uri);
    const blob = await blobResponse.blob();

    const file = new File(
      [blob],
      'avatar.jpg',
      {
        type: blob.type || 'image/jpeg',
      },
    );

    formData.append('avatar', file);
  } else {
    formData.append(
      'avatar',
      {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any,
    );
  }

  return apiRequest<{ avatar: string }>(
    '/api/me/avatar',
    {
      method: 'POST',
      body: formData,
    },
  );
}

export function getAvatarUrl(avatar: string | null): string | null {
  if (!avatar) {
    return null;
  }

  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('blob:')
  ) {
    return avatar;
  }

  return `${API_URL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;
}

