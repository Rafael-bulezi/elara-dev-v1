import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface AuthCallbackProps {
  onComplete: () => void;
}

const AuthCallback = ({ onComplete }: AuthCallbackProps) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for OAuth error params first (e.g. user denied Google access)
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const oauthErrorDescription = urlParams.get('error_description');

    if (oauthError) {
      setStatus('error');
      setErrorMessage(
        oauthErrorDescription?.replace(/\+/g, ' ') ||
        'Autenticação cancelada ou recusada.'
      );
      return;
    }

    // Supabase PKCE: the client auto-exchanges the code when detectSessionInUrl is true.
    // We listen for SIGNED_IN to know when it's done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        setTimeout(() => {
          window.history.replaceState({}, '', '/');
          onComplete();
        }, 900);
      }
    });

    // In case the session was already established before this component mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
        setTimeout(() => {
          window.history.replaceState({}, '', '/');
          onComplete();
        }, 400);
      }
    });

    return () => subscription.unsubscribe();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={28} className="text-purple-600" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 size={32} className="animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-zinc-900 mb-1">A autenticar…</h2>
            <p className="text-sm text-zinc-500">Por favor aguarde um momento.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-zinc-900 mb-1">Sessão iniciada!</h2>
            <p className="text-sm text-zinc-500">A redirecionar para a loja…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={32} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-zinc-900 mb-2">Erro na autenticação</h2>
            <p className="text-sm text-zinc-500 mb-5">{errorMessage}</p>
            <button
              onClick={() => {
                window.history.replaceState({}, '', '/');
                onComplete();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl text-sm transition-colors"
            >
              Voltar à loja
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
