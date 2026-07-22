import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, Phone, Lock, User, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const reset = () => { setError(''); setSuccess(''); };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (view === 'register' && password !== confirmPassword) {
      setError('As senhas não coincidem.'); return;
    }
    if (view === 'register' && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.'); return;
    }
    setLoading(true);
    try {
      const dummyEmail = `${phone.replace(/\D/g, '')}@elara.ao`;
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        if (error) throw error;
        onClose();
      } else {
        // Use server-side signup to auto-confirm the email, since the
        // dummy @elara.ao address cannot receive confirmation links.
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: dummyEmail,
            password,
            fullName,
            phone
          })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erro ao criar conta.');

        // Auto-login after successful signup
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        if (loginError) throw loginError;
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    reset(); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError('Erro ao iniciar sessão com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotWhatsApp = () => {
    const msg = `Olá, esqueci a minha senha da conta Elara. O meu número é ${phone}.`;
    window.open(`https://wa.me/244900000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[108px] md:pt-0 md:items-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 px-6 pt-8 pb-10">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <X size={16} className="text-white" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            {view === 'login' ? 'Bem-vindo de volta' : view === 'register' ? 'Criar conta' : 'Recuperar senha'}
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            {view === 'login' ? 'Entre na sua conta Elara' : view === 'register' ? 'Junte-se à nossa comunidade' : 'Enviaremos ajuda via WhatsApp'}
          </p>
        </div>

        {/* Card body — overlaps header */}
        <div className="relative -mt-5 bg-white rounded-t-3xl px-6 pt-6 pb-6">

          {/* Alerts */}
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-3 py-2.5 rounded-xl">{error}</div>
          )}
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-2.5 rounded-xl">{success}</div>
          )}

          {view !== 'forgot' ? (
            <>
              <form onSubmit={handleAuth} className="space-y-3">
                {view === 'register' && (
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" required />
                  </div>
                )}
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="tel" placeholder="Número de telefone (9XX XXX XXX)" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" required />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" required />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {view === 'register' && (
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type={showPass ? 'text' : 'password'} placeholder="Confirmar senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-400 focus:bg-white transition-colors" required />
                  </div>
                )}

                {view === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => { reset(); setView('forgot'); }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-1">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {loading ? 'Aguarde...' : view === 'login' ? 'Entrar' : 'Criar Conta'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Ou</span></div>
              </div>

              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-800 font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? 'Aguarde...' : 'Entrar com Google'}
              </button>

              <p className="text-center mt-4 text-xs text-zinc-500">
                {view === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                <button onClick={() => { reset(); setView(view === 'login' ? 'register' : 'login'); }}
                  className="font-black text-purple-600 hover:text-purple-800 transition-colors">
                  {view === 'login' ? 'Criar agora' : 'Entrar'}
                </button>
              </p>
            </>
          ) : (
            /* Forgot password view */
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Introduza o seu número de telefone e entraremos em contacto via WhatsApp para repor a sua senha.
              </p>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="tel" placeholder="Número de telefone" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors" />
              </div>
              <button onClick={handleForgotWhatsApp}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Contactar via WhatsApp
              </button>
              <button onClick={() => { reset(); setView('login'); }}
                className="w-full text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors py-2">
                ← Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
