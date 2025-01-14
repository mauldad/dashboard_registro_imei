import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../data/supabase";

export interface UserPermissionsToken {
  channel: string;
  is_admin: boolean;
  is_operator: boolean;
  exp: number;
}

interface AuthStore {
  token?: UserPermissionsToken;
  rememberUser: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  setToken: (token: string) => void;
  removeToken: () => void;
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
      setToken: (token: string) => {
        const decodeToken = JSON.parse(atob(token.split(".")[1]));
        const userPermissions = {
          channel: decodeToken.channel,
          is_admin: decodeToken.is_admin,
          is_operator: decodeToken.is_operator,
          exp: decodeToken.exp,
        };
        set({ token: userPermissions });
        scheduleTokenRemoval(userPermissions);
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

function scheduleTokenRemoval(token: UserPermissionsToken) {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const expTime = token.exp;

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
