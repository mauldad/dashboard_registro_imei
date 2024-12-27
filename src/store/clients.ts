import { create } from "zustand";
import { getClients, sendEmailUser } from "../data/clients";
import { IOrder, PaymentStatus } from "../types/client";
import supabase from "../data/supabase";
import {
  rejectedRegister,
  rejectedRegisterBusiness,
  successRegister,
  successRegisterBusiness,
} from "../assets/mails";
import { is } from "date-fns/locale";

interface ClientStore {
  clients: IOrder[];
  fetchClients: (channel: string) => Promise<void>;
  updatePaid: (
    id: number,
    isBusiness: boolean,
    orderNumber: string,
  ) => Promise<boolean>;
  updateClient: (updatedClient: IOrder) => void;
  rejectClient: (rejectedClient: IOrder, reason: string) => Promise<void>;
  deleteUser: (id: number, token: string) => Promise<void>;
}

const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  fetchClients: async (channel: string) => {
    const clients = await getClients(channel);
    if (!clients) {
      return;
    }
    set({ clients });
  },
  updatePaid: async (id: number, isBusiness: boolean, orderNumber: string) => {
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
    const currentClient = get().clients.find((client) => client.id === id);

    const email = get().clients.find((client) => client.id === id)?.email;

    if (data) {
      await sendEmailUser(
        email as string,
        `¡Tu registro se completó! Orden nº ${orderNumber}`,
        isBusiness
          ? successRegisterBusiness(
              currentClient?.Account?.Business?.business_name as string,
            )
          : successRegister(
              currentClient?.Account?.Personal?.first_name as string,
              currentClient?.Account?.Personal?.last_name as string,
            ),
      );
    }
    set({ clients: newClients });
    return data;
  },
  updateClient: (updatedClient: IOrder) => {
    const newClients = get().clients.map((client) => {
      if (client.id === updatedClient.id) {
        return updatedClient;
      }
      return client;
    });
    set({ clients: newClients });
  },
  rejectClient: async (rejectedClient: IOrder, reason: string) => {
    const { data, error } = await supabase
      .from("Order")
      .update({
        paid: "rejected",
        registered: false,
        reject_reason: reason,
      })
      .eq("id", rejectedClient.id);

    if (error) throw new Error(error.message);

    const newClients = get().clients.map((client) => {
      if (client.id === rejectedClient.id) {
        return {
          ...client,
          paid: "rejected" as PaymentStatus,
          registered: false,
          // reason: reason,
        };
      }
      return client;
    });
    set({ clients: newClients });

    await sendEmailUser(
      rejectedClient.email as string,
      `Registro rechazado, Orden nº ${rejectedClient.order_number}`,
      rejectedClient.Account?.is_business
        ? rejectedRegisterBusiness(
            rejectedClient?.Account?.Business?.business_name as string,
            reason,
          )
        : rejectedRegister(
            rejectedClient?.Account?.Personal?.first_name as string,
            rejectedClient?.Account?.Personal?.last_name as string,
            reason,
          ),
    );
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
