import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { modalVariants } from '../../utils/animations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const dummyEmail = `${phone.replace(/\D/g, '')}@elara.ao`;
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: dummyEmail, 
          password,
          options: { 
            data: { 
              role,
              full_name: fullName,
              phone: phone
            } 
          }
        });
        if (error) throw error;
        alert('Conta criada com sucesso!');
      }
      onClose();
    } catch (error) {
      console.error("Auth error:", error);
      alert(error instanceof Error ? error.message : "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const adminWhatsApp = "2449XXXXXXXXX"; // Replace with your actual number
    const message = `Olá, esqueci minha senha da conta Elara. Meu número é ${phone}.`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // Note: Supabase OAuth uses redirects. The actual profile creation 
      // will happen in the App.tsx auth listener after the redirect back.
      
    } catch (error) {
      console.error("Auth error:", error);
      alert("Erro na autenticação. Verifique se o domínio está autorizado no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 z-[100] flex items-start justify-center p-4 backdrop-blur-md overflow-y-auto">
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-[40px] w-full max-w-md overflow-hidden border border-zinc-200 my-auto max-h-[90vh] flex flex-col"
      >
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-2">
                {isLogin ? 'Bem-vindo' : 'Criar Conta'}
              </h2>
              <p className="text-zinc-500 font-medium">
                {isLogin ? 'Entre na sua conta ELARA' : 'Junte-se à nossa comunidade'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
            <p className="text-sm text-purple-800 font-medium">
              <strong className="font-black uppercase tracking-wider">Fase de Testes:</strong> Você não precisa confirmar seu e-mail ou número agora. Basta inserir seus dados e acessar!
            </p>
          </div>

          {!isLogin && (
            <div className="mb-10">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                Eu quero:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setRole('buyer')}
                  className={`py-4 rounded-2xl border-2 font-black uppercase tracking-wider text-xs transition-all ${role === 'buyer' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-400'}`}
                >
                  Comprar
                </button>
                <button 
                  onClick={() => setRole('seller')}
                  className={`py-4 rounded-2xl border-2 font-black uppercase tracking-wider text-xs transition-all ${role === 'seller' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-400'}`}
                >
                  Vender
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handlePhoneAuth} className="space-y-4 mb-6">
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Nome Completo" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50"
                required
              />
            )}
            <input 
              type="tel" 
              placeholder="Número de Telefone" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50"
              required
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50"
              required
            />
            <input 
              type="password" 
              placeholder="Confirmar Senha" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Autenticando...
                </>
              ) : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button 
                onClick={handleForgotPassword}
                className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
              >
                Esqueceu a senha? Contacte o Admin via WhatsApp
              </button>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">Ou</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-zinc-100 hover:border-zinc-900 text-zinc-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Processando...' : 'Entrar com Google'}
          </button>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

