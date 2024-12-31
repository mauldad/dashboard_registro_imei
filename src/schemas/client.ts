import * as z from "zod";

export const imei_schema = z.object({
    imei_number: z.string().min(1, "El número IMEI es requerido"),
    brand: z.string().min(1, "La marca es requerida"),
    model: z.string().min(1, "El modelo es requerido"),
    type: z.string().min(1, "El tipo es requerido"),
    imei_image: z.string().optional(),
});

export const client_schema = z.object({
    // Account Information
    is_business: z.boolean().default(false),
    rut: z.string().min(1, "El RUT es requerido"),
    email: z.string().email("Email inválido"),
    phone_number: z.string().nullable(),

    // Personal Information (conditional)
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    nationality: z.string().optional(),
    id_card_url: z.string().optional(),
    purchase_receipt_url: z.string().optional(),

    // Business Information (conditional)
    business_name: z.string().optional(),
    import_receipt_url: z.string().optional(),

    // IMEI Information
    imeis: z.array(imei_schema).min(1, "Debe agregar al menos un IMEI"),

    // Services
    has_registration: z.boolean().default(true),
    has_antivirus: z.boolean().default(false),
    has_insurance: z.boolean().default(false),

    // Payment Information
    total_paid: z.number().min(0, "El monto debe ser mayor a 0"),
    paid: z.enum(["approved", "pending", "rejected"]).default("pending"),
    purchase_number: z.string().optional(),

    // Additional Information
    registrant_name: z.string().nullable(),
    channel: z.string().default("base"),
});

export type ClientFormData = z.infer<typeof client_schema>;
export type ImeiFormData = z.infer<typeof imei_schema>;
