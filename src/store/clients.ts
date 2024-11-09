import { create } from "zustand";
import { getClients } from "../data/clients";
import { IOrder } from "../types/client";

interface ClientStore {
  clients: IOrder[];
  fetchClients: () => Promise<void>;
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
}));

export default useClientStore;
