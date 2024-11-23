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
    const { data, error } = await supabase.rpc("update_order_register", {
      p_order_id: id,
    });
    const newClients = get().clients.map((client) => {
      if (client.id === id) {
        return {
          ...client,
          registered: data,
        };
      }
      return client;
    });

    const email = get().clients.find((client) => client.id === id)?.Account
      ?.email;

    if (data) {
      await sendEmailUser(
        email as string,
        `¡Tu registro se completó! Orden nº ${orderNumber}`,
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
