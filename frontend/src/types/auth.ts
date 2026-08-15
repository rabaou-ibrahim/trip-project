export type AuthUser = {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  user: Omit<AuthUser, 'avatar'>;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
};