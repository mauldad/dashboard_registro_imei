import { create } from "zustand";
import { getClients, sendEmailUser } from "../data/clients";
import { IOrder } from "../types/client";
import supabase from "../data/supabase";
import { successRegister } from "../assets/mails";

interface ClientStore {
  clients: IOrder[];
  fetchClients: () => Promise<void>;
  updatePaid: (
    id: number,
    firstName: string,
    lastName: string,
    orderNumber: string,
  ) => Promise<boolean>;
  deleteUser: (id: number, token: string) => Promise<void>;
}

const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  fetchClients: async () => {
    const clients = await getClients();
    if (!clients) {
      return;
    }
    set({ clients });
  },
  updatePaid: async (
    id: number,
    firstName: string,
    lastName: string,
    orderNumber: string,
  ) => {
    const { data, error } = await supabase.rpc("update_user_active", {
      p_account_id: id,
    });
    const newClients = get().clients.map((client) => {
      if (client.Account?.id === id) {
        return {
          ...client,
          Account: {
            ...client.Account,
            is_active: data,
          },
        };
      }
      return client;
    });

    if (data) {
      await sendEmailUser(
        id,
        `Tu cuenta ha sido activada, orden nº ${orderNumber}`,
        successRegister(firstName, lastName),
      );
    }
    set({ clients: newClients });
    return data;
  },
  deleteUser: async (id: number, token: string) => {
    const { data, error } = await supabase.rpc("delete_user", {
      p_account_id: id,
    });
    const newClients = get().clients.filter((client) => {
      return client.Account?.id !== id;
    });
    set({ clients: newClients });
  },
}));

export default useClientStore;
