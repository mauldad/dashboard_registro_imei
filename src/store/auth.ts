import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../data/supabase";

interface AuthStore {
  token?: string;
  rememberUser: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  setToken: (token: string) => void;
  removeToken: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: undefined,
      rememberUser: false,
      signIn: async (email: string, password: string, remember: boolean) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw new Error("Error iniciando sesión");
        }
        set({ token: data.session?.access_token, rememberUser: remember });
      },
      setToken: (token: string) => set({ token }),
      removeToken: () => set({ token: undefined }),
    }),
    {
      name: "auth",
    },
  ),
);

export default useAuthStore;
