import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import UsersTable from "@/components/users/users-table";
import useUserStore from "@/store/users";
import UsersTableSkeleton from "@/components/skeletons/user-table-skeleton";
import { UsersSearch } from "@/components/users/users-search";
import { UsersFilters } from "@/components/users/users-filters";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import UserForm from "@/components/users/user-form";

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { users, fetchUsers, currentPage, totalPages, pageSize } = useUserStore(
    (state) => state,
  );

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      await fetchUsers({
        query: searchParams.get("query") || undefined,
        filters: {
          channel: searchParams.get("channel") || undefined,
          role: searchParams.get("role") || undefined,
        },
      });
      setLoading(false);
    };
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onPageSizeChange = async (size: number) => {
    setLoading(true);
    await fetchUsers({
      query: searchParams.get("query") || undefined,
      filters: {
        channel: searchParams.get("channel") || undefined,
        role: searchParams.get("role") || undefined,
      },
      limit: size,
    });
    setLoading(false);
  };

  const onPageChange = async (page: number) => {
    setLoading(true);
    await fetchUsers({
      query: searchParams.get("query") || undefined,
      filters: {
        channel: searchParams.get("channel") || undefined,
        role: searchParams.get("role") || undefined,
      },
      limit: pageSize,
      page,
    });
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Usuarios
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <UserForm />
          <UsersSearch />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm p-6">
        <UsersFilters />
        {loading ? (
          <UsersTableSkeleton />
        ) : (
          <UsersTable
            users={users}
            totalUsers={users.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
