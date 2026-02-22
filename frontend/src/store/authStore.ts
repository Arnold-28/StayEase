import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'GUEST' | 'OWNER';
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (accessToken, refreshToken) => {
    // Store tokens in sessionStorage (not localStorage) to limit exposure
    // Refresh token is also set as httpOnly cookie by the server
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, isAuthenticated: !!accessToken });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: () => {
    // Restore token from sessionStorage only — user info
    // should be fetched fresh from the server via /api/auth/me
    const accessToken = sessionStorage.getItem('accessToken');

    if (accessToken) {
      set({
        accessToken,
        isAuthenticated: true,
      });
    }
  },
}));
