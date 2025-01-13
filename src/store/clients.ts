import { create } from "zustand";
import { getClients, getClientsStats, sendEmailUser } from "../data/clients";
import { IOrder, PaymentStatus } from "../types/client";
import supabase from "../data/supabase";
import {
  rejectedRegister,
  rejectedRegisterBusiness,
  successRegister,
  successRegisterBusiness,
} from "../assets/mails";
import onboardingUrl from "@/utils/onboarding-url";

interface ClientState {
  clients: IOrder[];
  analitycsClients: {
    is_business: boolean;
    registered: boolean;
    total_paid: number;
    created_at: string;
  }[];
  totalClients: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchClients: (params: {
    channel?: string;
    query?: string;
    filters?: {
      month?: string;
      year?: string;
      status?: string;
      payment_status?: string;
    };
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAnalitycsClients: (channel: string) => Promise<void>;
  updateRegisterStatus: (id: number) => Promise<boolean>;
  updateClient: (updatedClient: IOrder) => void;
  rejectClient: (
    rejectedClient: IOrder,
    formData: { reason: string; fields: string[] },
    rejectedToken: string,
  ) => Promise<void>;
  deleteUser: (id: number, token: string) => Promise<void>;
}

const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  analitycsClients: [],
  totalClients: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  fetchClients: async (params) => {
    try {
      set({ loading: true, error: null });
      const result = await getClients({
        channel: params.channel || "base",
        ...params,
        limit: params.limit || 10,
        page: params.page || 1,
      });

      if (result) {
        set({
          clients: result.data,
          totalClients: result.count,
          currentPage: result.page,
          totalPages: result.totalPages,
          pageSize: result.limit,
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchAnalitycsClients: async (channel) => {
    try {
      set({ loading: true, error: null });
      const result = await getClientsStats(channel || "base");

      if (result) {
        set({
          analitycsClients: result,
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  updateRegisterStatus: async (id: number) => {
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
        `¡Tu registro se completó! Orden nº ${currentClient?.order_number}`,
        currentClient?.Account?.is_business
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
  rejectClient: async (
    rejectedClient: IOrder,
    formData: { reason: string; fields: string[] },
    rejectedToken: string,
  ) => {
    const { reason, fields } = formData;

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
          reject_reason: reason,
        };
      }
      return client;
    });
    set({ clients: newClients });

    const rejectedLink = `${onboardingUrl}/order?token=${rejectedToken}`;

    await sendEmailUser(
      rejectedClient.email as string,
      `Registro rechazado, Orden nº ${rejectedClient.order_number}`,
      rejectedClient.Account?.is_business
        ? rejectedRegisterBusiness(
            rejectedClient?.Account?.Business?.business_name as string,
            formData,
            rejectedLink,
          )
        : rejectedRegister(
            rejectedClient?.Account?.Personal?.first_name as string,
            rejectedClient?.Account?.Personal?.last_name as string,
            formData,
            rejectedLink,
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
