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
import { Check, Clock, Copy, Dot } from "lucide-react";
import toast from "react-hot-toast";
import ClientDetails from "./client-details";
import { IOrder } from "@/types/client";
import ClientForm from "./client-form";
import RejectForm from "./reject-form";
import { copyBusinessOrder, copyPersonalOrder, exportImeisToCSV } from "@/utils/copy";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ClientsTableProps {
    orders: IOrder[];
    totalClients: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onStatusChange: (orderId: string, status: string) => void;
    onPageSizeChange?: (size: number) => void;
}

const ClientsTable = ({ 
    orders,
    totalClients,
    currentPage,
    totalPages,
    onPageChange,
    onStatusChange,
    onPageSizeChange 
}: ClientsTableProps) => {
    const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

    const handleCopy = async (order: IOrder) => {
        try {
            setCopiedOrderId(order.id.toString());
            
            if (order.Account?.is_business) {
                await copyBusinessOrder(order);
                const csvLink = exportImeisToCSV(order.Imei);
                window.location.href = csvLink;
            } else {
                await copyPersonalOrder(order);
            }
            
            toast.success("Datos copiados al portapapeles");
            setTimeout(() => setCopiedOrderId(null), 2000);
        } catch {
            toast.error("Error al copiar los datos");
            setCopiedOrderId(null);
        }
    };

    const ImageDialog = ({ src, alt }: { src: string; alt: string }) => (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-primary hover:underline underline-offset-2 transition-colors">
                    {alt}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg w-[90vw]">
                <DialogHeader>
                    <DialogTitle>{alt}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full max-h-[80vh] h-full">
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-contain"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <section className="flex-1 flex flex-col space-y-4">
            <ScrollArea className="flex-1 border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Orden</TableHead>
                            <TableHead>RUT</TableHead>
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
                        {orders && orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <ClientDetails order={order} />
                                </TableCell>
                                <TableCell>
                                    {order.Account?.rut || "-"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="truncate max-w-[270px]">
                                            {order.Account?.is_business
                                                ? order.Account.Business?.business_name
                                                : `${order.Account?.Personal?.first_name} ${order.Account?.Personal?.last_name}`}
                                        </span>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <a
                                                href={`mailto:${order.email}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {order.email}
                                            </a>
                                            {order.phone_number && (
                                                <>
                                                    <Dot />
                                                    <span>{order.phone_number}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {order.import_receipt_url && (
                                            <ImageDialog
                                                src={order.import_receipt_url}
                                                alt="Exportación"
                                            />
                                        )}
                                        {order.purchase_receipt_url && (
                                            <ImageDialog
                                                src={order.purchase_receipt_url}
                                                alt="Compra"
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {order.Imei.length} IMEI{order.Imei.length !== 1 ? 's' : ''}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={order.registered ? "approved" : "pending"}
                                        onValueChange={(value) => onStatusChange(order.id.toString(), value)}
                                    >
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approved">
                                                <div className="flex items-center gap-1 pr-1">
                                                    <Check className="h-4 w-4" />
                                                    <span>Registrado</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                <div className="flex text-[13px] items-center gap-1 pr-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>En Espera</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    ${order.total_paid.toLocaleString('es-CL')}
                                </TableCell>
                                <TableCell className="pl-4">
                                    <Badge
                                        variant={
                                            order.paid === "approved"
                                                ? "outline-success"
                                                : order.paid === "pending"
                                                    ? "outline-warning"
                                                    : "outline-destructive"
                                        }
                                        className="select-none"
                                    >
                                        {order.paid === "approved"
                                            ? "Aprobado"
                                            : order.paid === "pending"
                                                ? "Pendiente"
                                                : "Rechazado"
                                        }
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 p-1 transition-colors ${
                                                copiedOrderId === order.id.toString()
                                                  ? "text-green-500"
                                                  : "text-muted-foreground hover:text-primary"
                                              } hover:bg-transparent`}
                                            onClick={() => handleCopy(order)}
                                        >
                                            {copiedOrderId === order.id.toString() ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <ClientForm order={order} />
                                        <RejectForm order={order} />
                                        <span className="hidden" id={`details-trigger-${order.id}`}>
                                            <ClientDetails order={order} />
                                        </span>
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
                        defaultValue="10"
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
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
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
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </section>
    );
};

export default ClientsTable;
