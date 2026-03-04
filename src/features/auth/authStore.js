import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setUser: (user) => set({ user }),

      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "auth-storage" }
  )
);

export default useAuthStore;