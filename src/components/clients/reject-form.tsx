import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IOrder } from "@/types/client";
import useClientStore from "@/store/clients";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ban, XCircle } from "lucide-react";
import { useState } from "react";

const rejectFormSchema = z.object({
  reason: z.string().min(1, "La razón es requerida"),
  fields: z.array(z.string()).min(1, "Selecciona al menos un campo a cambiar"),
});

type RejectFormData = z.infer<typeof rejectFormSchema>;

interface RejectFormProps {
  order: IOrder;
}

const personalFields = [
  { label: "RUT", value: "rut" },
  { label: "Pasaporte", value: "passportNumber" },
  { label: "Carnet de identificación", value: "idCardUrl" },
  { label: "Nombres", value: "firstName" },
  { label: "Apellidos", value: "lastName" },
  { label: "Nacionalidad", value: "nationality" },
  { label: "Imeis", value: "imeis" },
  { label: "Comprobante de compra", value: "purchaseReceiptUrl" },
  { label: "Email", value: "email" },
  { label: "Teléfono", value: "phoneNumber" },
];

const businessFields = [
  { label: "RUT", value: "rut" },
  { label: "Nombre de la empresa", value: "businessName" },
  { label: "Nombre de quien registra", value: "registrantName" },
  { label: "Email", value: "email" },
  { label: "Excel de imeis", value: "excelImeisUrl" },
  { label: "Comprobante de importación", value: "importReceiptUrl" },
];

export default function RejectForm({ order }: RejectFormProps) {
  const fieldsOptions = order.Account?.is_business
    ? businessFields
    : personalFields;
  const [open, setOpen] = useState(false);
  const rejectClient = useClientStore((state) => state.rejectClient);

  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: "",
      fields: [],
    },
  });

  const onSubmit = async (data: RejectFormData) => {
    toast.promise(
      rejectClient(order, data),
      {
        loading: "Procesando el rechazo...",
        success: () => {
          setOpen(false);
          form.reset();
          return "Orden rechazada exitosamente";
        },
        error: "Error al rechazar la orden",
      },
      {
        style: {
          minWidth: "200px",
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-1 text-destructive/70 hover:text-destructive hover:bg-transparent transition-colors"
          disabled={order.paid === "rejected"}
        >
          <Ban className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex justify-between">
            <span>Rechazar Orden</span>
            <span className="text-muted-foreground">#{order.order_number}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Razón
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese la razón del rechazo"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fields"
              render={({ field }) => {
                const handleSelectChange = (value: string) => {
                  const currentValues = field.value || [];
                  const newValues = currentValues.includes(value)
                    ? currentValues.filter((v) => v !== value)
                    : [...currentValues, value];
                  field.onChange(newValues);
                };

                return (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Campo a corregir por el cliente
                    </FormLabel>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." {...field} />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldsOptions.map(
                          (option) =>
                            !field.value.includes(option.value) && (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((item, idx) => (
                        <Badge
                          key={idx}
                          variant="outline-primary"
                          className="flex items-center gap-1"
                        >
                          {fieldsOptions.find((f) => f.value === item)?.label}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedValues = field.value.filter(
                                (v) => v !== item,
                              );
                              field.onChange(updatedValues);
                            }}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <XCircle />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={form.formState.isSubmitting}
              >
                Rechazar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
