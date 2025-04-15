import { create } from "zustand";
import {
  deleteClient,
  getAllClients,
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
import { exportToExcel } from "@/utils/export";

interface ClientState {
  clients: IOrder[];
  analitycsClients: OrderAnalitycs[];
  analitycsRejections: RejectionAnalitycs[];
  totalClients: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  loadingExport: boolean;
  error: string | null;
  errorExport: string | null;
  setError: (error: string | null) => void;
  setErrorExport: (errorExport: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingExport: (loadingExport: boolean) => void;
  fetchClients: (params: {
    channel?: string;
    query?: string;
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      channel?: string;
      status?: string;
      payment_status?: string;
      internal_form?: string;
    };
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAnalitycsClients: (
    channel: string,
    filters?: { month?: string; year?: string; rejection_channel?: string },
  ) => Promise<void>;
  updateRegisterStatus: (id: number) => Promise<boolean>;
  updateClient: (updatedClient: IOrder) => void;
  rejectClient: (
    rejectedClient: IOrder,
    formData: { reason: string; fields: string[] },
  ) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  exportClientsExcel: (
    filename: string,
    channel: string,
    isAdmin: boolean,
    params: {
      channel?: string;
      query?: string;
      filters?: {
        dateFrom?: string;
        dateTo?: string;
        status?: string;
        payment_status?: string;
        internal_form?: string;
      };
    },
  ) => Promise<void>;
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
  loadingExport: false,
  error: null,
  errorExport: null,
  setError: (error) => set({ error }),
  setErrorExport: (errorExport) => set({ errorExport }),
  setLoading: (loading) => set({ loading }),
  setLoadingExport: (loadingExport) => set({ loadingExport }),
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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.rpc("update_order_register", {
      p_order_id: id,
      p_registered_by: session?.user.id || null,
    });
    console.log(data, error);
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
  exportClientsExcel: async (filename, channel, isAdmin, params) => {
    try {
      set({ loadingExport: true, errorExport: null });
      const clients = await getAllClients(params);
      exportToExcel(clients, filename, channel, isAdmin);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loadingExport: false });
    }
  },
}));

export default useClientStore;
