import React from 'react';
import { ShoppingBag, Tag, CreditCard, Settings, LogOut, Shield, ArrowLeft, User, ChevronRight } from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { getAvatarUrl } from '../../utils/avatar';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onNavigate: (view: 'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote') => void;
}

const ProfileDrawer = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  onOpenAuth, 
  onNavigate
}: ProfileDrawerProps) => (
  <>
    <div className={`fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed top-0 right-0 bottom-0 w-[320px] sm:w-[400px] bg-white dark:bg-zinc-950 z-[70] shadow-[0_0_80px_rgba(0,0,0,0.3)] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 md:p-10 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-12">
          <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-all active:scale-90">
            <ArrowLeft size={24} className="text-zinc-900 dark:text-white" />
          </button>
          <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase italic">Menu</h2>
        </div>
        
        {userProfile ? (
          <div className="flex items-center gap-6 group cursor-pointer" onClick={() => onNavigate('settings')}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-[28px] blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="relative w-20 h-20 rounded-[24px] object-cover border-4 border-white dark:border-zinc-950 shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-zinc-950 rounded-full shadow-lg" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-2xl dark:text-white truncate tracking-tighter leading-none mb-2">{userProfile.name}</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest rounded-md border border-zinc-200 dark:border-zinc-800">
                  {userProfile.role === 'seller' ? 'Vendedor' : userProfile.role === 'intermediary' ? 'Intermediário' : 'Comprador'}
                </span>
                {userProfile.email === '7dark7cloud7@gmail.com' && (
                  <span className="px-2 py-0.5 bg-rose-500 text-[9px] font-black text-white uppercase tracking-widest rounded-md">Admin</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-zinc-400 border border-zinc-100 dark:border-zinc-800 shadow-inner">
              <User size={40} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-6 tracking-tight">Sua Conta ELARA</h3>
            <button 
              onClick={() => { onClose(); onOpenAuth(); }} 
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/20 dark:shadow-white/10 active:scale-95 transition-all"
            >
              Entrar ou Criar Conta
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        <nav className="px-6 space-y-3">
          <button onClick={() => onNavigate('orders')} className="w-full flex items-center justify-between p-4 rounded-[24px] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <ShoppingBag size={22} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest">Meus Pedidos</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {userProfile?.role === 'seller' && (
            <button onClick={() => onNavigate('products')} className="w-full flex items-center justify-between p-4 rounded-[24px] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                  <Tag size={22} />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">Meus Produtos</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          <button className="w-full flex items-center justify-between p-4 rounded-[24px] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <CreditCard size={22} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest">Pagamentos</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-6 mx-4"></div>

          <button onClick={() => onNavigate('settings')} className="w-full flex items-center justify-between p-4 rounded-[24px] text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <Settings size={22} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest">
                {userProfile?.role === 'seller' ? 'Configurações da Loja' : 'Editar Perfil'}
              </span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {userProfile?.email === '7dark7cloud7@gmail.com' && (
            <button onClick={() => onNavigate('admin')} className="w-full flex items-center justify-between p-4 rounded-[24px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/30 group-hover:scale-110 transition-transform">
                  <Shield size={22} />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">Painel Admin</span>
              </div>
              <ChevronRight size={18} className="text-rose-300 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          
          {userProfile && (
            <button onClick={() => { supabase.auth.signOut(); onClose(); }} className="w-full flex items-center gap-5 p-4 rounded-[24px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all mt-8 group">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 transition-all">
                <LogOut size={22} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest">Sair da Conta</span>
            </button>
          )}
        </nav>
      </div>
      
      <div className="p-10 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          <span>v2.5.0</span>
          <span>ELARA Angola</span>
        </div>
      </div>
    </div>
  </>
);

export default ProfileDrawer;

