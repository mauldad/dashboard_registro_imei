"use client";

import { FC, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { user_schema, UserFormData } from "@/schemas/user";

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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Pencil, Plus } from "lucide-react";
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

import { Separator } from "../ui/separator";
import useUserStore from "@/store/users";
import toast from "react-hot-toast";
import { createUser, updateSupabaseUser } from "@/data/users";
import { User } from "@/types/user";
import { useForm } from "react-hook-form";

interface UserFormProps {
  user?: User;
}

export const UserForm: FC<UserFormProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const { updateUser, insertUser } = useUserStore((state) => state);

  const form = useForm<UserFormData>({
    resolver: zodResolver(user_schema),
    defaultValues: {
      email: user?.email || "",
      password: user ? "******" : "",
      channel: (user?.channel as "base" | "falabella" | "walmart") || "base",
      is_admin: user?.is_admin ?? false,
      is_operator: user?.is_operator ?? true,
      is_client: user?.is_client ?? false,
      receive_weekly_reports: user?.receive_weekly_reports ?? false,
    },
  });

  const handleSubmit = async (values: UserFormData) => {
    setError("");
    const submitForm = async () => {
      try {
        // Define the user role
        const userRol = values.is_admin
          ? "admin"
          : values.is_operator
            ? "operator"
            : "client";
        const roles = {
          is_admin: userRol === "admin",
          is_operator: userRol === "operator",
          is_client: userRol === "client",
        };

        if (!user) {
          // Create the user in the database
          const { user } = await createUser({ ...values, ...roles });
          if (!user) throw new Error("Error al crear el usuario");

          // Create the user in the store
          insertUser({ user_id: user.id, ...values });

          toast.success("Usuario creado exitosamente");
          setOpen(false);
          return;
        }

        const updatedUser: User = {
          ...user,
          ...roles,
          email: values.email,
          channel: values.channel,
          receive_weekly_reports: values.receive_weekly_reports,
        };

        // Update the user in the database
        updateSupabaseUser(updatedUser, user.user_id);

        // Update the store
        updateUser(updatedUser);

        toast.success("Usuario actualizado exitosamente");
        setOpen(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al procesar la solicitud",
        );
        toast.error(
          user ? "Error al actualizar el usuario" : "Error al crear el usuario",
        );
      }
    };

    startTransition(() => {
      submitForm();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
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
            Nuevo Usuario
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
                {user ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <h3 className="text-normal font-medium">Información General</h3>
              <div className="grid grid-cols-3 gap-y-2 gap-x-4">
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={!!user}
                          type="password"
                          placeholder="*************"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Canal
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "base") {
                            form.setValue("is_admin", false);
                            form.setValue("is_operator", true);
                            form.setValue("is_client", false);
                          } else {
                            form.setValue("is_admin", false);
                            form.setValue("is_operator", false);
                            form.setValue("is_client", true);
                          }
                          form.trigger([
                            "is_admin",
                            "is_operator",
                            "is_client",
                          ]);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el canal..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="base">Registro de IMEI</SelectItem>
                          <SelectItem value="falabella">Falabella</SelectItem>
                          <SelectItem value="walmart">Walmart</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Roles Information */}
            <div className="space-y-2">
              <h3 className="text-normal font-medium">Roles</h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <FormField
                  control={form.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Rol
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          form.setValue("is_admin", value === "admin");
                          form.setValue("is_operator", value === "operator");
                          form.setValue("is_client", value === "client");
                        }}
                        defaultValue={
                          form.getValues("is_admin")
                            ? "admin"
                            : form.getValues("is_operator")
                              ? "operator"
                              : "client"
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el rol..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.getValues("channel") === "base" ? (
                            <>
                              <SelectItem value="admin">
                                Administrador
                              </SelectItem>
                              <SelectItem value="operator">Operador</SelectItem>
                            </>
                          ) : (
                            <SelectItem value="client">Cliente</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Weekly Report Information */}
            {(form.getValues("channel") === "falabella" ||
              form.getValues("channel") === "walmart") &&
              form.getValues("is_client") && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-normal font-medium">Reporte semanal</h3>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                      <FormField
                        control={form.control}
                        name="receive_weekly_reports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs text-muted-foreground">
                              Recibir reportes semanales
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

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
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader className="h-4 w-4 animate-spin" />}
                {user ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
