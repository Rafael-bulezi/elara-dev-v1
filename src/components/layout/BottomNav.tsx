import React from 'react';
import { Home, MessageCircle, Tag, User, Plus } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onSellProduct: () => void;
  onOpenActions?: () => void;
  visible?: boolean;
  isProductView?: boolean;
}

const BottomNav = ({ 
  activeTab, 
  setActiveTab, 
  cartCount: _cartCount, 
  onOpenCart, 
  onOpenProfile, 
  userProfile, 
  onOpenAuth, 
  onSellProduct,
  onOpenActions,
  visible = true,
  isProductView = false,
}: BottomNavProps) => (
  <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-zinc-200 md:hidden pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="flex items-center justify-around h-16 relative px-2">
      {/* 1. Início */}
      <button 
        onClick={() => setActiveTab('home')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-purple-600 scale-105' : 'text-zinc-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-purple-100' : ''}`}>
          <Home size={20} strokeWidth={activeTab === 'home' ? 3 : 2} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider">Início</span>
      </button>
      
      {/* 2. Chat */}
      <button 
        onClick={() => setActiveTab('messages')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'messages' ? 'text-purple-600 scale-105' : 'text-zinc-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'messages' ? 'bg-purple-100' : ''}`}>
          <MessageCircle size={20} strokeWidth={activeTab === 'messages' ? 3 : 2} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider">Chat</span>
      </button>

      {/* 3. CENTER POPPED-UP CIRCLE (+) */}
      <div className="relative -translate-y-4">
        <button 
          onClick={onSellProduct} 
          className="w-13 h-13 bg-white text-zinc-900 border-2 border-zinc-200 shadow-xl rounded-full flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-300 group"
          title="Vender / Novo Produto"
        >
          <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-inner group-hover:bg-purple-700 transition-colors">
            <Plus size={24} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* 4. Comprar / Acções */}
      <button 
        onClick={onOpenActions || onOpenCart} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-105 ${isProductView ? 'text-purple-600 font-bold' : 'text-zinc-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${isProductView ? 'bg-purple-100' : ''}`}>
          <Tag size={20} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider">{isProductView ? 'Comprar' : 'Acções'}</span>
      </button>

      {/* 5. Conta / Entrar */}
      <button 
        onClick={userProfile ? onOpenProfile : onOpenAuth} 
        className="flex flex-col items-center gap-1 text-zinc-400 transition-all duration-300 active:scale-105"
      >
        <div className={`p-0.5 rounded-xl border-2 transition-colors ${userProfile ? 'border-purple-500 bg-purple-50' : 'p-1.5'}`}>
          {userProfile ? (
            userProfile.avatar && userProfile.avatar.trim() !== '' ? (
              <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-5 h-5 rounded-lg object-cover" />
            ) : (
              <div className="w-5 h-5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                {(userProfile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <User size={20} />
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700">{userProfile ? (userProfile.name || 'Perfil').split(' ')[0] : 'Entrar'}</span>
      </button>
    </div>
  </nav>
);

export default BottomNav;
