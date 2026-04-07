import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('DEBUG - VITE_SUPABASE_URL:', supabaseUrl);
console.log('DEBUG - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);

// Inicializa o cliente apenas se as variáveis existirem e a URL for válida
const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

export const supabase = ((supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null) as any;

if (!supabase) {
  console.error('Supabase não inicializado corretamente. Verifique se VITE_SUPABASE_URL é uma URL válida.');
}

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
