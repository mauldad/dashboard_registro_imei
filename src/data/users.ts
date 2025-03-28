import { User } from "@/types/user";
import supabase from "./supabase";
import { UserFormData } from "@/schemas/user";

export interface UsersFilters {
  channel?: string;
  role?: string;
}

export interface GetUsersParams {
  query?: string;
  filters?: UsersFilters;
  page?: number;
  limit?: number;
}

export async function getUsers({
  query,
  filters,
  page = 1,
  limit = 10,
}: GetUsersParams): Promise<
  | {
      data: User[];
      count: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  | undefined
> {
  try {
    const queryBuilder = supabase.from("user_details").select("*");

    // Apply search query if provided
    if (query) {
      queryBuilder.or(`email.ilike.%${query}%`);
    }

    // Apply filters if provided
    if (filters) {
      if (filters.channel) {
        queryBuilder.eq("channel", filters.channel);
      }
      if (filters.role === "admin") {
        queryBuilder.eq("is_admin", true);
      }
      if (filters.role === "operator") {
        queryBuilder.eq("is_operator", true);
      }
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  } catch (error) {
    console.error("Get Clients Error:", error);
    throw new Error("Get clients failed");
  }
}

export async function createUser(formData: UserFormData) {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        channel: formData.channel,
        is_admin: formData.is_admin,
        is_operator: formData.is_operator,
        is_client: formData.is_client,
        receive_weekly_reports: formData.receive_weekly_reports,
      },
    },
  });

  console.log(data);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateSupabaseUser(formData: User, userId: string) {
  const body = {
    p_id: userId,
    p_email: formData.email,
    p_channel: formData.channel,
    p_is_admin: formData.is_admin,
    p_is_operator: formData.is_operator,
    p_is_client: formData.is_client,
    p_receive_weekly_reports: formData.receive_weekly_reports,
  };
  const { data, error } = await supabase.rpc("update_auth_user", body);
  if (error) throw new Error(error.message);
  return data;
}
