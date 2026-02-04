import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUserPublic, Role } from '@orixa/shared';

interface AuthState {
  accessToken: string | null;
  user: IUserPublic | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: IUserPublic | null) => void;
  login: (token: string, user: IUserPublic) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (token, user) =>
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        }),

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'orixa-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
