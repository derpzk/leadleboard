import "server-only";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = () => {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.");
  }

  return createClient(url, secretKey, {
    // This client acts for our server, rather than a signed-in browser user.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
