import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { IOrder } from "@/types/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Check,
  Clock,
  Dot,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";

interface DetailsProps {
  order: IOrder;
}

const ImageDialog = ({ src, alt }: { src: string; alt: string }) => {
  const isPdf = src.endsWith(".pdf");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <ImageIcon className="h-4 w-4" />
          {isPdf ? (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:text-primary/80"
            >
              {alt}
            </a>
          ) : (
            <span>{alt}</span>
          )}
        </button>
      </DialogTrigger>
      {!isPdf && (
        <DialogContent className="max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full max-h-[80vh] h-full">
            <img src={src} alt={alt} className="w-full h-full object-contain" />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

const ClientDetails = ({ order }: DetailsProps) => {
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;

  return (
    <Sheet>
      <SheetTrigger className="text-primary hover:underline underline-offset-2">
        #{order.order_number}
      </SheetTrigger>
      <SheetContent className="overflow-y-hidden flex flex-col gap-0">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-medium">
            #{order.order_number}
          </SheetTitle>
          <SheetDescription>Detalle de Cliente</SheetDescription>
        </SheetHeader>
        <Separator />
        <section className="mt-4 flex-1 overflow-y-auto">
          {/* Basic Info */}
          <div className="mx-6 flex justify-between items-center border border-border rounded-md p-4">
            <div className="flex flex-col space-y-1">
              <span className="text-lg font-medium">
                {order.Account?.is_business
                  ? order.Account.Business?.business_name
                  : `${order.Account?.Personal?.first_name} ${order.Account?.Personal?.last_name}`}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${order.email}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {order.email}
                  </a>
                </div>
                {order.phone_number && (
                  <>
                    <Dot className="h-4 w-4" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{order.phone_number}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant={order.registered ? "default" : "secondary"}
              className="gap-1.5"
            >
              {order.registered ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Registrado
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  En Espera
                </>
              )}
            </Badge>
          </div>
          {/* General Information */}
          <div className="py-4 px-6 space-y-2">
            <h3 className="font-medium">Información General</h3>
            <div className="grid grid-cols-2 gap-2">
              {order.Account?.rut && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">RUT</span>
                  <p className="text-sm">{order.Account.rut}</p>
                </div>
              )}
              {order.Account?.Personal?.nationality && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Nacionalidad
                  </span>
                  <p className="text-sm">
                    {order.Account.Personal.nationality}
                  </p>
                </div>
              )}
              {order.channel && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Canal</span>
                  <p className="text-sm uppercase">
                    {order.channel === "base"
                      ? "registrodeimei.cl"
                      : order.channel}
                  </p>
                </div>
              )}
              {order.purchase_number && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Número de Compra
                  </span>
                  <p className="text-sm">{order.purchase_number}</p>
                </div>
              )}
              {order.registrant_name && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Registrante
                  </span>
                  <p className="text-sm">{order.registrant_name}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Fecha de Creación
                </span>
                <p className="text-sm">
                  {format(new Date(order.created_at), "PPP", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Devices */}
          <div className="py-4 px-6 space-y-2">
            <h3 className="font-medium">Dispositivos</h3>
            <div className="px-12">
              <Carousel className="mx-auto select-none">
                <CarouselContent>
                  {order.Imei.map((imei, index) => (
                    <CarouselItem
                      key={imei.imei_number}
                      className="cursor-grab"
                    >
                      <div className="p-4 border border-border rounded-md space-y-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Dispositivo {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">IMEI:</span>
                            <span className="font-mono">
                              {imei.imei_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Marca:
                            </span>
                            <span>{imei.brand}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Modelo:
                            </span>
                            <span>{imei.model}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span>{imei.type}</span>
                          </div>
                        </div>
                        {imei.imei_image && (
                          <div className="pt-2">
                            <ImageDialog
                              src={imei.imei_image}
                              alt={`IMEI ${imei.imei_number}`}
                            />
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
          <Separator />
          {/* Services */}
          <div className="py-4 px-6 space-y-2">
            <h3 className="font-medium">Servicios</h3>
            <div className="grid grid-cols-3 gap-4 border border-border rounded-lg p-4">
              <div className="flex flex-col items-center gap-2 text-sm">
                <Box
                  className={`h-5 w-5 ${
                    order.has_registration
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                />
                <span className="flex items-center gap-1">
                  Registro IMEI
                  {order.has_registration ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-sm">
                <ShieldCheck
                  className={`h-5 w-5 ${
                    order.has_antivirus ? "text-green-500" : "text-destructive"
                  }`}
                />
                <span className="flex items-center gap-1">
                  Antivirus
                  {order.has_antivirus ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-sm">
                <FileText
                  className={`h-5 w-5 ${
                    order.has_insurance ? "text-green-500" : "text-destructive"
                  }`}
                />
                <span className="flex items-center gap-1">
                  Seguro
                  {order.has_insurance ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />
          {/* Payment */}
          <div className="py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Pago:</span>
              {token.channel === "base" && token.is_admin && (
                <span className="text-sm font-medium">
                  ${order.total_paid.toLocaleString("es-CL")}
                </span>
              )}
            </div>
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
                  : "Rechazado"}
            </Badge>
          </div>

          {order.reject_reason && (
            <>
              <Separator />
              {/* Rejected Reason */}
              <div className="py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Razón del rechazo:
                  </span>
                  <span className="text-sm font-medium">
                    {order.reject_reason}
                  </span>
                </div>
              </div>
            </>
          )}

          <Separator />
          {/* Documents */}
          {(order.imei_excel_url ||
            order.import_receipt_url ||
            order.purchase_receipt_url ||
            (order.Account?.Personal?.id_card_url &&
              !order.Account.is_business)) && (
            <div className="py-4 px-6 space-y-2">
              <h3 className="font-medium">Documentos</h3>
              <div className="grid gap-2">
                {order.imei_excel_url && (
                  <button
                    onClick={() => window.open(order.imei_excel_url, "_blank")}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel IMEI</span>
                  </button>
                )}
                {order.import_receipt_url && (
                  <ImageDialog
                    src={order.import_receipt_url}
                    alt="Recibo de Importación"
                  />
                )}
                {order.purchase_receipt_url && (
                  <ImageDialog
                    src={order.purchase_receipt_url}
                    alt="Recibo de Compra"
                  />
                )}
                {order.Account?.Personal?.id_card_url &&
                  !order.Account.is_business && (
                    <ImageDialog
                      src={order.Account.Personal.id_card_url}
                      alt="Cédula de Identidad"
                    />
                  )}
              </div>
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetails;
