import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { User } from "@/types/user";
import UserForm from "./user-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useUserStore from "@/store/users";
import TablePagination from "../common/pagination";

interface UsersTableProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const UsersTable = ({
  users,
  totalUsers,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) => {
  const pageSize = useUserStore((state) => state.pageSize);

  const getUserRole = (user: User) => {
    return user.is_admin ? "Admin" : user.is_operator ? "Operador" : "Cliente";
  };

  return (
    <section className="flex-1 flex flex-col space-y-4">
      <ScrollArea className="flex-1 border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Reporte Semanal</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users &&
              users.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center text-sm ">
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {user.email}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{user.channel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{getUserRole(user)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.receive_weekly_reports ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserForm key={user.user_id} user={user} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <TablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </section>
  );
};

export default UsersTable;
