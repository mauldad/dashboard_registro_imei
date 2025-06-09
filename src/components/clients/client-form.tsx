"use client";

import { FC, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { client_schema, ClientFormData } from "@/schemas/client";
import { createExcelFromImeis, handleFileUpload } from "@/utils/file-handlers";

import {
  uploadBusinessImportReceipt,
  uploadExcelImeisFile,
  uploadImeiImage,
  uploadPersonalPurchaseReceipt,
  uploadPersonalUserIdCard,
} from "@/data/clients";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Pencil, Plus, Trash2 } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { IOrder } from "@/types/client";
import { Separator } from "../ui/separator";
import useClientStore from "@/store/clients";
import toast from "react-hot-toast";
import { updateBusinessUser, updatePersonalUser } from "@/data/clients";

interface ClientFormProps {
  order?: IOrder;
}

export const ClientForm: FC<ClientFormProps> = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  const updateClient = useClientStore((state) => state.updateClient);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(client_schema),
    defaultValues: {
      is_business: order?.Account?.is_business || false,
      rut: order?.Account?.rut || "",
      email: order?.email || "",
      phone_number: order?.phone_number || "",

      // Personal Information
      first_name: order?.Account?.Personal?.first_name || "",
      last_name: order?.Account?.Personal?.last_name || "",
      nationality: order?.Account?.Personal?.nationality || "",
      id_card_url: order?.Account?.Personal?.id_card_url || "",
      purchase_receipt_url: order?.purchase_receipt_url || "",

      // Business Information
      business_name: order?.Account?.Business?.business_name || "",
      business_type: order?.Account?.Business?.business_type || "",
      address: order?.Account?.Business?.address || "",
      city: order?.Account?.Business?.city || "",
      import_receipt_url: order?.import_receipt_url || "",

      // IMEI Information
      imeis: order?.Imei || [],

      // Services
      has_registration: order?.has_registration || true,
      has_antivirus: order?.has_antivirus || false,
      has_insurance: order?.has_insurance || false,

      // Payment Information
      total_paid: order?.total_paid || 0,
      paid: order?.paid || "pending",
      purchase_number: order?.purchase_number || "",

      // Additional Information
      channel: order?.channel || "base",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "imeis",
  });

  const handleSubmit = async (values: ClientFormData) => {
    setError("");
    const submitForm = async () => {
      try {
        if (!order) return;

        let xmlUrl: string | undefined = order.imei_excel_url;

        // Check if IMEIs have changed
        const haveImeisChanged =
          values.imeis.some((imei, index) => {
            const originalImei = order.Imei[index];
            return (
              !originalImei ||
              imei.imei_number !== originalImei.imei_number ||
              imei.brand !== originalImei.brand ||
              imei.model !== originalImei.model ||
              imei.type !== originalImei.type ||
              imei.serial_number != originalImei.serial_number
            );
          }) || values.imeis.length !== order.Imei.length;

        // Only create and upload new Excel if IMEIs have changed
        if (haveImeisChanged) {
          // Create and upload Excel file from IMEIs
          const excelFile = createExcelFromImeis(
            values.imeis.map((imei) => ({
              imei_number: imei.imei_number,
              serial_number: imei.serial_number || "",
              brand: imei.brand,
              model: imei.model,
              type: imei.type || "",
              imei_image: imei.imei_image || "",
            })),
          );
          xmlUrl = await handleFileUpload(excelFile, uploadExcelImeisFile);
        }

        // Create the order object
        const updatedOrder: IOrder = {
          ...order,
          Account: {
            id: order.Account?.id || 0,
            rut: values.rut,
            is_business: values.is_business,
            Personal: values.is_business
              ? null
              : {
                  first_name: values.first_name || "",
                  last_name: values.last_name || "",
                  nationality: values.nationality || "",
                  id_card_url: values.id_card_url || "",
                },
            Business: values.is_business
              ? {
                  business_name: values.business_name || "",
                  business_type: values.business_type || "",
                  address: values.address || "",
                  city: values.city || "",
                }
              : null,
          },
          email: values.email,
          phone_number: values.phone_number || "",
          total_paid: values.total_paid,
          paid: values.paid,
          purchase_number: values.purchase_number || "",
          has_registration: values.has_registration,
          has_antivirus: values.has_antivirus,
          has_insurance: values.has_insurance,
          purchase_receipt_url: values.purchase_receipt_url || "",
          import_receipt_url: values.is_business
            ? values.import_receipt_url || ""
            : "",
          imei_excel_url: xmlUrl || order.imei_excel_url || "",
          Imei: values.imeis.map((imei) => ({
            imei_number: imei.imei_number,
            brand: imei.brand,
            model: imei.model,
            type: imei.type || "",
            imei_image: imei.imei_image || "",
            serial_number: imei.serial_number || "",
          })),
        };

        // Update the client in the database
        if (values.is_business) {
          await updateBusinessUser(updatedOrder, order.id);
        } else {
          await updatePersonalUser(updatedOrder, order.id);
        }

        // Update the store
        updateClient(updatedOrder);

        toast.success("Cliente actualizado exitosamente");
        setOpen(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al procesar la solicitud",
        );
        toast.error("Error al actualizar el cliente");
      }
    };

    startTransition(() => {
      submitForm();
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    uploadFunction: (file: File) => Promise<string>,
    fieldName: keyof ClientFormData,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    try {
      const url = await handleFileUpload(file, uploadFunction);
      form.setValue(fieldName, url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al subir el archivo",
      );
    } finally {
      setFileUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {order ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-1 text-muted-foreground hover:text-primary hover:bg-transparent transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>
                {order ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
            </DialogHeader>

            {/* Client Type Section */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Seleccione el tipo de cliente:
              </p>

              <Tabs
                defaultValue={
                  order?.Account?.is_business ? "business" : "personal"
                }
                className="space-y-4"
                onValueChange={(value) =>
                  form.setValue("is_business", value === "business")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="business">Empresa</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-2">
                  <h3 className="text-normal font-medium">
                    Información General
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                    <FormField
                      control={form.control}
                      name="rut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            RUT
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="12.345.678-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="correo@ejemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Nombres
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Apellidos
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+56 9 1234 5678"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Nacionalidad
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Chilena" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Carnet de Identidad
                      </Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            uploadPersonalUserIdCard,
                            "id_card_url",
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Comprobante de Compra
                      </Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            uploadPersonalPurchaseReceipt,
                            "purchase_receipt_url",
                          )
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-2">
                  <h3 className="text-normal font-medium">
                    Información General
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="rut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            RUT
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="12.345.678-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Nombre de la Empresa
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Empresa S.A." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="business_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Giro de la Empresa
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Telecomunicaciones"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Dirección
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Calle X, número Y" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Ciudad
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Caricó" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="correo@ejemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+56 9 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Comprobante de Importación
                      </Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            uploadBusinessImportReceipt,
                            "import_receipt_url",
                          )
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* IMEI Section */}
            <div className="space-y-2">
              <h3 className="text-normal font-medium">Registro de IMEIs</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs text-muted-foreground">
                      Número IMEI
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Marca
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Modelo
                    </TableHead>
                    {form.getValues("is_business") && (
                      <TableHead className="text-xs text-muted-foreground">
                        Tipo
                      </TableHead>
                    )}
                    <TableHead className="text-xs text-muted-foreground">
                      Imagen
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    return (
                      <TableRow key={index} className="border-0">
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`imeis.${index}.imei_number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`imeis.${index}.brand`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`imeis.${index}.model`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        {form.getValues("is_business") && (
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`imeis.${index}.type`}
                              render={({ field: { onChange, ...field } }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        onChange(value || "");
                                      }}
                                      placeholder="Tipo"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileChange(e, uploadImeiImage, "imeis");
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    append({
                      imei_number: "",
                      brand: "",
                      model: "",
                      type: null,
                      imei_image: null,
                    })
                  }
                  className="p-1 hover:bg-transparent gap-1"
                  disabled={
                    !form.getValues("is_business") && fields.length >= 2
                  }
                >
                  <Plus className="h-4 w-4" />
                  Agregar IMEI
                </Button>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-2">
              <h3 className="text-normal font-medium">Información de Pago</h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <FormField
                  control={form.control}
                  name="total_paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Monto Total
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Estado de Pago
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Número de Compra
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <h3 className="text-normal font-medium">Servicios</h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <FormField
                  control={form.control}
                  name="has_registration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs text-muted-foreground">
                          Registro IMEI
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_antivirus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs text-muted-foreground">
                          Antivirus
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_insurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs text-muted-foreground">
                          Seguro
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || fileUploading}
                className="gap-2"
              >
                {(isPending || fileUploading) && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
                {order ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
