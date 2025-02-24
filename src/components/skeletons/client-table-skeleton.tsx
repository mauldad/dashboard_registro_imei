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

const ClientsTableSkeleton = ({ rows = 10 }) => (
  <section className="flex-1 flex flex-col space-y-4">
    <ScrollArea className="flex-1 border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>RUT/Pasaporte</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Comprobante</TableHead>
            <TableHead>IMEIs</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado de Pago</TableHead>
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

export default ClientsTableSkeleton;
