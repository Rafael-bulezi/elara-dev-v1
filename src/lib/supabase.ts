import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('DEBUG - VITE_SUPABASE_URL:', supabaseUrl);
console.log('DEBUG - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);

const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

// Inicializa o cliente com placeholders se as variáveis estiverem ausentes para evitar crashes
const placeholderUrl = 'https://placeholder-project.supabase.co';
const placeholderKey = 'placeholder-key';

export const supabase = createClient(
  (supabaseUrl && isValidUrl(supabaseUrl)) ? supabaseUrl : placeholderUrl,
  supabaseAnonKey || placeholderKey
);

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.error('Supabase não inicializado corretamente. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configurados.');
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
