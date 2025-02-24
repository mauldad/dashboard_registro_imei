import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-28 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="w-28 h-6 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
  </TableRow>
);

const UsersTableSkeleton = ({ rows = 10 }) => (
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
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  </section>
);

export default UsersTableSkeleton;
