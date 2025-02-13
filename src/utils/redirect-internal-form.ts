import supabase from "@/data/supabase";

export const redirectInternalForm = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const body = {
      next: window.location.href,
    };
    const response = await fetch("/.netlify/functions/send_jwt_onboarding", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al redirigir al formulario interno");
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    window.location.href = data.location;
  } catch (error) {
    console.warn(error);
  }
};
