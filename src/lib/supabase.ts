import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.error('[Elara] Supabase não inicializado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

// Falls back to placeholder so the client never throws during construction,
// but all network calls will fail gracefully when credentials are missing.
export const supabase = createClient(
  (supabaseUrl && isValidUrl(supabaseUrl)) ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Automatically exchange PKCE code from redirect URLs (OAuth callback)
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Helper for Auth
export const getSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Import Requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createImportRequest = async (requestData: any) => {
  if (!supabase) throw new Error("Supabase is not initialized");
  
  // Ensure we don't send empty strings if the DB expects NULL
  const cleanData = { ...requestData };
  if (!cleanData.buyer_id) delete cleanData.buyer_id;

  const { data, error } = await supabase
    .from('import_requests')
    .insert([cleanData])
    .select();
  
  if (error) {
    console.error("Supabase Insert Error Detail:", error);
    throw error;
  }
  return data;
};
