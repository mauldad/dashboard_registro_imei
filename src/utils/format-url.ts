const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const formatUrl = (url: string) => {
  return url
    .replace("public", "sign")
    .replace(`${supabaseUrl}/storage/v1/object/sign/imeis/`, "");
};
