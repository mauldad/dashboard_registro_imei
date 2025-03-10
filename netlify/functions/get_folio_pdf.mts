import type { Context } from "@netlify/functions";

const { OPEN_FACTURA_URL, OPEN_FACTURA_API_KEY } = process.env;

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const { folio, documentType } = body;

    const pdfBuffer = await getPdf(folio, documentType);

    return new Response(JSON.stringify({ pdf: pdfBuffer }), {
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
