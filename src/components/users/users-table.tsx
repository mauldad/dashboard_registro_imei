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

  return (
    <section className="flex-1 flex flex-col space-y-4">
      <ScrollArea className="flex-1 border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Admin</TableHead>
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
                    {user.is_operator ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserForm key={user.id} user={user} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar</span>
          <Select
            defaultValue={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Pagination className="w-fit mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => onPageChange(currentPage - 1)}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => onPageChange(currentPage + 1)}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
};

export default UsersTable;
