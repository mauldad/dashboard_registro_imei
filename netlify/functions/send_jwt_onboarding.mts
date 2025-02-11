import jwt from "jsonwebtoken";
import type { Context } from "@netlify/functions";

const SECRET_KEY = process.env.JWT_SECRET as string;
const ONBOARDING_URL = process.env.VITE_ONBOARDING_URL as string;

export default async (req: Request, context: Context) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Token no proporcionado" }), {
        status: 401,
      });
    }

    const supabaseToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(supabaseToken) as { exp?: number };
    if (!decoded || !decoded.exp) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 400,
      });
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp <= now) {
      return new Response(JSON.stringify({ error: "Token expirado" }), {
        status: 401,
      });
    }

    const signedToken = jwt.sign(
      { supabase_token: supabaseToken },
      SECRET_KEY,
      { expiresIn: decoded.exp - now },
    );
    const cookie = `auth_jwt=${signedToken}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${
      decoded.exp - now
    }`;

    return new Response(JSON.stringify({ location: ONBOARDING_URL }), {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error generando token" }), {
      status: 500,
    });
  }
};
