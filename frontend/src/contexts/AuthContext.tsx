import { ApiError } from '@/services/apiClient';
import { getCurrentUser, login } from '@/services/authService';
import {
  getStoredToken,
  removeStoredToken,
  storeToken,
} from '@/storage/authStorage';
import type { AuthUser, LoginRequest } from '@/types/auth';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  sessionError: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  retrySession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [sessionError, setSessionError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    setStatus('loading');
    setSessionError(null);

    try {
      const token = await getStoredToken();

      if (!token) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      const currentUser = await getCurrentUser();

      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await removeStoredToken();
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      setUser(null);
      setSessionError(
        'Impossible de vérifier votre session. Vérifiez votre connexion.',
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const signIn = useCallback(async (credentials: LoginRequest) => {
    const response = await login(credentials);

    await storeToken(response.token);

    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);
      setSessionError(null);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await removeStoredToken();
      }

      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await removeStoredToken();
    setUser(null);
    setSessionError(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      sessionError,
      isAuthenticated: status === 'authenticated',
      signIn,
      signOut,
      retrySession: restoreSession,
    }),
    [restoreSession, sessionError, signIn, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }

  return context;
}