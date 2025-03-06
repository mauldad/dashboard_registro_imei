import type { Context } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const { OPEN_FACTURA_URL, OPEN_FACTURA_API_KEY } = process.env;

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const { folio, email, is_business, order_number } = body;

    const documentType = is_business ? "33" : "39";
    const pdfBuffer = await getPdf(folio, documentType);

    const sendEmail = await resend.emails.send({
      from: "registrodeimei.cl <no-reply@correot.registrodeimei.cl>",
      to: email,
      subject: `Tu ${
        is_business ? "factura" : "boleta"
      } esta lista! #${order_number}`,
      html: `Adjuntamos tu ${
        is_business ? "factura" : "boleta"
      } de tu orden #${order_number}.`,
      attachments: [
        {
          filename: `order_${order_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
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

async function getPdf(folio: string, documentType: string) {
  const response = await fetch(
    `${OPEN_FACTURA_URL}/v2/dte/document/76630870-8/${documentType}/${folio}/pdf`,
    {
      headers: {
        apiKey: OPEN_FACTURA_API_KEY as string,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch pdf");
  }

  const data = await response.json();
  const { pdf } = data;

  return Buffer.from(pdf, "base64");
}
