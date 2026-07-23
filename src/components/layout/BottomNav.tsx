import React from 'react';
import { Home, MessageCircle, ShoppingCart, User, PlusCircle } from 'lucide-react';
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
  visible?: boolean;
}

const BottomNav = ({ 
  activeTab, 
  setActiveTab, 
  cartCount, 
  onOpenCart, 
  onOpenProfile, 
  userProfile, 
  onOpenAuth, 
  onSellProduct,
  visible = true,
}: BottomNavProps) => (
  <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-zinc-200 md:hidden pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="flex items-center justify-around h-16 md:h-20 px-2 md:px-4">
      <button 
        onClick={() => setActiveTab('home')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-purple-600 scale-105' : 'text-zinc-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-purple-100' : ''}`}>
          <Home size={20} strokeWidth={activeTab === 'home' ? 3 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">Início</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('messages')} 
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'messages' ? 'text-purple-600 scale-105' : 'text-zinc-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'messages' ? 'bg-purple-100' : ''}`}>
          <MessageCircle size={20} strokeWidth={activeTab === 'messages' ? 3 : 2} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">Chat</span>
      </button>

      <div className="relative -translate-y-5">
        <button 
          onClick={onSellProduct} 
          className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all duration-500 border-4 border-white"
        >
          <PlusCircle size={28} />
        </button>
      </div>

      <button 
        onClick={onOpenCart} 
        className="flex flex-col items-center gap-1 text-zinc-400 relative transition-all duration-300 active:scale-105"
      >
        <div className="p-1.5 rounded-xl">
          <ShoppingCart size={20} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">Carrinho</span>
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
            {cartCount}
          </span>
        )}
      </button>

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
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">{userProfile ? (userProfile.name || 'Perfil').split(' ')[0] : 'Entrar'}</span>
      </button>
    </div>
  </nav>
);

export default BottomNav;

