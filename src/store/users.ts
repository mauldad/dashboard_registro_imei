import { create } from "zustand";
import { getUsers, UsersFilters } from "../data/users";
import supabase from "../data/supabase";
import { User } from "@/types/user";

interface UserState {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: (params: {
    query?: string;
    filters?: UsersFilters;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  insertUser: (createdUser: User) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (id: number, token: string) => Promise<void>;
}

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  analitycsUsers: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  fetchUsers: async (params) => {
    try {
      set({ loading: true, error: null });
      const result = await getUsers({
        ...params,
        filters: params.filters || {},
        limit: params.limit || 10,
        page: params.page || 1,
      });

      if (result) {
        set({
          users: result.data,
          totalUsers: result.count,
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
  insertUser: (createdUser: User) => {
    set({ users: [...get().users, createdUser] });
  },
  updateUser: (updatedUser: User) => {
    const newUsers = get().users.map((user) => {
      if (user.user_id === updatedUser.user_id) {
        return updatedUser;
      }
      return user;
    });
    set({ users: newUsers });
  },
  deleteUser: async (id: number, token: string) => {
    const { data, error } = await supabase.rpc("delete_user", {
      p_account_id: id,
    });
    const newUsers = get().users.filter((user) => {
      return user.Account?.id !== id;
    });
    set({ users: newUsers });
  },
}));

export default useUserStore;
