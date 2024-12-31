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

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ban } from "lucide-react";
import { useState } from "react";

const rejectFormSchema = z.object({
  reason: z.string().min(1, "La razón es requerida"),
});

type RejectFormData = z.infer<typeof rejectFormSchema>;

interface RejectFormProps {
  order: IOrder;
}

export default function RejectForm({ order }: RejectFormProps) {
  const [open, setOpen] = useState(false);
  const rejectClient = useClientStore((state) => state.rejectClient);

  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: RejectFormData) => {
    toast.promise(
      rejectClient(order, data.reason),
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-1 text-destructive/70 hover:text-destructive hover:bg-transparent transition-colors"
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
