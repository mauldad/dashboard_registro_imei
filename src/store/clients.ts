import { create } from "zustand";
import {
  deleteClient,
  getClients,
  getClientsStats,
  getRejectionsStats,
  rejectClient,
  sendEmailUser,
} from "@/data/clients";
import {
  IOrder,
  OrderAnalitycs,
  PaymentStatus,
  RejectionAnalitycs,
} from "@/types/client";
import supabase from "@/data/supabase";
import { successRegister, successRegisterBusiness } from "@/assets/mails";

interface ClientState {
  clients: IOrder[];
  analitycsClients: OrderAnalitycs[];
  analitycsRejections: RejectionAnalitycs[];
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
  fetchAnalitycsClients: (
    channel: string,
    filters?: { month?: string; year?: string },
  ) => Promise<void>;
  updateRegisterStatus: (id: number) => Promise<boolean>;
  updateClient: (updatedClient: IOrder) => void;
  rejectClient: (
    rejectedClient: IOrder,
    formData: { reason: string; fields: string[] },
  ) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
}

const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  analitycsClients: [],
  analitycsRejections: [],
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
  fetchAnalitycsClients: async (channel, filters) => {
    try {
      set({ loading: true, error: null });
      const clientsResult = await getClientsStats(channel || "base", filters);
      const rejectionsResult = await getRejectionsStats(filters);

      if (clientsResult) {
        set({
          analitycsClients: clientsResult,
        });
      }
      if (rejectionsResult) {
        set({
          analitycsRejections: rejectionsResult,
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
  ) => {
    const { reason, fields } = formData;

    const { error } = await rejectClient(rejectedClient, formData);

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
  },
  deleteClient: async (id: number) => {
    await deleteClient(id);
    const newClients = get().clients.filter((client) => {
      return client.id !== id;
    });
    set({ clients: newClients });
  },
}));

export default useClientStore;
