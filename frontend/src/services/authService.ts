import { apiRequest } from '@/services/apiClient';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth';

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/login_check', {
    method: 'POST',
    authenticated: false,
    body: credentials,
  });
}

export function register(
  information: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/api/register', {
    method: 'POST',
    authenticated: false,
    body: information,
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/me');
}