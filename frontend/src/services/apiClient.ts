import { getStoredToken } from '@/storage/authStorage';
import type { ApiErrorPayload } from '@/types/auth';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL doit être configurée.');
}

const API_URL = configuredApiUrl.replace(/\/+$/, '');

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    body,
    headers: customHeaders,
    ...requestOptions
  } = options;

  const token = authenticated ? await getStoredToken() : null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText !== '') {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null;

    throw new ApiError(
      response.status,
      errorPayload?.message ?? 'Une erreur inattendue est survenue.',
      errorPayload?.errors,
    );
  }

  return payload as T;
}