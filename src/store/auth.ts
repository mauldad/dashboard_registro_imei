import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../data/supabase";

interface AuthStore {
  token?: string;
  rememberUser: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  setToken: (token: string) => void;
  removeToken: () => void;
  getChannelToken: () => string;
  initialize: () => void;
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

        const token = data.session?.access_token;
        if (!token) {
          throw new Error("Error iniciando sesión");
        }
        get().setToken(token);
      },
      getChannelToken: () => {
        const token = get().token;
        if (!token) {
          throw new Error("No hay token");
        }

        const decodeToken = JSON.parse(atob(token.split(".")[1]));
        return decodeToken.channel;
      },
      setToken: (token: string) => {
        set({ token });
        scheduleTokenRemoval(token);
      },
      removeToken: () => set({ token: undefined }),
      initialize: () => {
        const token = get().token;
        if (token) {
          scheduleTokenRemoval(token);
        }
      },
    }),
    {
      name: "auth",
    },
  ),
);

function scheduleTokenRemoval(token: string) {
  try {
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const expTime = tokenPayload.exp;

    if (!expTime || currentTime >= expTime) {
      useAuthStore.getState().removeToken();
      return;
    }

    const timeUntilExpiration = (expTime - currentTime) * 1000;

    setTimeout(() => {
      useAuthStore.getState().removeToken();
    }, timeUntilExpiration);
  } catch (error) {
    console.error("Error procesando el token:", error);
  }
}

useAuthStore.getState().initialize();

export default useAuthStore;
