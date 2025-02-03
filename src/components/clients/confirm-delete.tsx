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

import { Form } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface DeleteFormProps {
  order: IOrder;
}

export default function DeleteForm({ order }: DeleteFormProps) {
  const [open, setOpen] = useState(false);
  const deleteClient = useClientStore((state) => state.deleteClient);
  const form = useForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      deleteClient(order.id),
      {
        loading: "Eliminando orden...",
        success: () => {
          setOpen(false);
          form.reset();
          return "Orden eliminada exitosamente";
        },
        error: "Error al eliminar el ",
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
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex justify-between">
            <span>Eliminar Orden</span>
            <span className="text-muted-foreground">#{order.order_number}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-red-600">
              <strong>Atención:</strong> Una vez eliminado, no habrá vuelta
              atrás. ¿Estás seguro de que deseas continuar?
            </p>
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
                Eliminar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
