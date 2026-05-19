import { create } from 'zustand';

interface AuthState {
  token: string | null;
  session: any | null;
  setToken: (token: string | null) => void;
  setSession: (session: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  session: null,
  setToken: (token) => set({ token }),
  setSession: (session) => set({ session }),
  logout: () => set({ token: null, session: null }),
}));
