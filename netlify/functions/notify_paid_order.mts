import type { Context } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const { orderNumber } = body;
    const sendEmail = await resend.emails.send({
      from: "registrodeimei.cl <no-reply@correot.registrodeimei.cl>",
      to: "dennis.maldonado@mbservices.cl",
      subject: `Nuevo registro de imei #${orderNumber}`,
      html: `Nueva orden registrada y pagada: ${orderNumber}`,
    });
    if (sendEmail.error) {
      throw new Error("Send email failed");
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Send email failed" }), {
      status: 400,
    });
  }
};
