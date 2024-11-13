import type { Context } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

console.log(process.env.RESEND_API_KEY);

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const { toEmail, subject, html } = body;
    console.log(body);
    const sendEmail = await resend.emails.send({
      from: "registrodeimei.cl <no-reply@correot.registrodeimei.cl>",
      to: toEmail,
      subject,
      html,
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
