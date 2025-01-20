import * as z from "zod";

export const user_schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  channel: z
    .enum(["base", "falabella", "walmart"], {
      message: "Seleccione un canal",
    })
    .default("base"),
  is_admin: z.boolean().default(false),
  is_operator: z.boolean().default(true),
});

export type UserFormData = z.infer<typeof user_schema>;
