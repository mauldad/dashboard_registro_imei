import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const { payload } = body;
    const secretKey = crypto.randomBytes(64).toString("hex");
    const token = jwt.sign(payload, secretKey);
    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Generate token failed" }), {
      status: 400,
    });
  }
};
