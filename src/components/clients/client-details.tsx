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
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import { getFolioPdf, getSignedUrl } from "@/data/clients";
import { useState } from "react";

interface DetailsProps {
  order: IOrder;
}

type ListItem = {
  label: string;
  value: string;
};

const ImageDialog = ({
  src,
  alt,
  listItems = [],
}: {
  src: string;
  alt: string;
  listItems?: ListItem[];
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isPdf = src.endsWith(".pdf");

  const handleDialogOpen = async () => {
    if (signedUrl || loading) return;
    setLoading(true);
    try {
      const signedUrl = await getSignedUrl(src);
      if (isPdf) window.open(signedUrl, "_blank");
      setSignedUrl(signedUrl);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error getting signed URL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          onClick={handleDialogOpen}
        >
          <ImageIcon className="h-4 w-4" />
          {isPdf ? (
            !loading ? (
              <a
                href={signedUrl as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={loading || !signedUrl}
              >
                {alt}
              </a>
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )
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
          <div className="relative w-full max-h-[80vh] h-full mb-4 flex flex-col gap-4">
            {listItems.length > 0 && (
              <div className="overflow-y-auto max-h-40">
                <ul className="list-disc pl-5">
                  {listItems.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      <strong>{item.label}:</strong> {item.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex-1 flex justify-center items-center overflow-hidden">
              {signedUrl && !loading ? (
                <img
                  src={signedUrl}
                  alt={alt}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

const ClientDetails = ({ order }: DetailsProps) => {
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [folioUrl, setFolioUrl] = useState<string | null>(null);
  const [folioLoading, setFolioLoading] = useState(false);

  const handleOpenExcelImei = async () => {
    if (signedUrl || loading) return;
    setLoading(true);
    try {
      const signedUrl = await getSignedUrl(order.imei_excel_url);
      window.open(signedUrl, "_blank");
      setSignedUrl(signedUrl);
    } catch (error) {
      console.error("Error getting signed URL:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolioPdf = async () => {
    if (folioUrl || folioLoading) return;
    setFolioLoading(true);
    try {
      const pdfUrl = await getFolioPdf(
        order.folio,
        order.Account?.is_business || false,
      );
      window.open(pdfUrl, "_blank");
      setFolioUrl(pdfUrl);
    } catch (error) {
      console.error("Error getting folio URL:", error);
    } finally {
      setFolioLoading(false);
    }
  };

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
              {order.Account?.rut ? (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">RUT</span>
                  <p className="text-sm">{order.Account.rut}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Pasaporte
                  </span>
                  <p className="text-sm">{order.Account?.passport_number}</p>
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
                  {format(
                    new Date(`${order.created_at.split("T")[0]}T00:00:00`),
                    "PPP",
                    { locale: es },
                  )}
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
                  {order.Imei.slice(0, 2).map((imei, index) => (
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
                              listItems={[
                                {
                                  label: "IMEI",
                                  value: imei.imei_number,
                                },
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                  {order.Imei.length > 2 && (
                    <CarouselItem>
                      <div className="p-4 border border-border rounded-md space-y-2">
                        <div className="flex items-center justify-center h-full">
                          <span className="text-muted-foreground">
                            +{order.Imei.length - 2} dispositivos más
                          </span>
                        </div>
                      </div>
                    </CarouselItem>
                  )}
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
                {order.folio && (
                  <button
                    onClick={
                      !folioUrl
                        ? handleOpenFolioPdf
                        : () => window.open(folioUrl as string, "_blank")
                    }
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {folioLoading ? (
                      <>
                        <File className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <File className="h-4 w-4" />
                        <span>
                          {order.Account?.is_business ? "Factura" : "Boleta"}
                        </span>
                      </>
                    )}
                  </button>
                )}
                {order.imei_excel_url && (
                  <button
                    onClick={
                      !signedUrl
                        ? handleOpenExcelImei
                        : () => window.open(signedUrl as string, "_blank")
                    }
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {loading ? (
                      <>
                        <FileSpreadsheet className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Excel IMEI</span>
                      </>
                    )}
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
                    {...(order.purchase_number && {
                      listItems: [
                        {
                          label: "Número de pedido",
                          value: order.purchase_number,
                        },
                      ],
                    })}
                  />
                )}
                {order.Account?.Personal?.id_card_url &&
                  !order.Account.is_business && (
                    <ImageDialog
                      src={order.Account.Personal.id_card_url}
                      alt="Cédula de Identidad"
                      listItems={[
                        {
                          label: order.Account.rut ? "RUT" : "Pasaporte",
                          value: order.Account.rut
                            ? order.Account.rut
                            : order.Account.passport_number,
                        },
                        {
                          label: "Nombres",
                          value: order.Account.Personal.first_name,
                        },
                        {
                          label: "Apellidos",
                          value: order.Account.Personal.last_name,
                        },
                      ]}
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
