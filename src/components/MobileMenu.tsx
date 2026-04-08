import React from 'react';
import { X, Home, ShoppingBag, MessageCircle, User, Globe, Shield, Zap, Download } from 'lucide-react';
import logo from '../assets/elara-logo.png';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onInstallClick?: () => void;
  appLogo?: string | null;
}

const MobileMenu = ({ isOpen, onClose, onNavigate, onInstallClick, appLogo }: MobileMenuProps) => (
  <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-zinc-950 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black shrink-0 overflow-hidden">
            <img 
              src={appLogo || logo} 
              alt="Elara" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + logo && target.src !== logo) {
                  target.src = logo;
                } else {
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = 'E';
                }
              }} 
            />
          </div>
          <span className="font-black dark:text-white">ELARA</span>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">BETA</span>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {onInstallClick && (
          <button 
            onClick={() => {
              onInstallClick();
              onClose();
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
          >
            <Download size={20} />
            Instalar Aplicativo
          </button>
        )}

        <nav className="space-y-2">
          {[
            { icon: Home, label: 'Início', view: 'home' },
            { icon: ShoppingBag, label: 'Meus Pedidos', view: 'orders' },
            { icon: MessageCircle, label: 'Mensagens', view: 'messages' },
            { icon: User, label: 'Perfil', view: 'settings' }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => {
                onNavigate(item.view);
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl font-bold transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-3">Serviços</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { icon: Globe, label: 'Importação Direta', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: Shield, label: 'Compra Segura', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: Zap, label: 'Ofertas Flash', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center gap-4 p-3 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold transition-colors">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <item.icon size={20} />
                </div>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 text-center">© 2026 ELARA Marketplace</p>
      </div>
    </div>
  </>
);

export default MobileMenu;
