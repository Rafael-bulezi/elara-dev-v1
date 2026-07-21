import React from 'react';
import { X, Home, ShoppingBag, MessageCircle, User, Globe, Shield, Zap, Download, Shirt, Cpu, Home as HomeIcon, Sparkles, Dumbbell, Car, Gem } from 'lucide-react';
import { CLOUD_LOGO } from '../../constants/logo';

const catIconMap: Record<string, React.ReactNode> = {
  Tecnologia:          <Cpu size={18} />,
  Moda:                <Shirt size={18} />,
  Beleza:              <Sparkles size={18} />,
  Casa:                <HomeIcon size={18} />,
  Esportes:            <Dumbbell size={18} />,
  Veículos:            <Car size={18} />,
  'Jóias & Acessórios': <Gem size={18} />,
};

const catColors: Record<string, string> = {
  Tecnologia:          'text-blue-500 bg-blue-50',
  Moda:                'text-pink-500 bg-pink-50',
  Beleza:              'text-rose-500 bg-rose-50',
  Casa:                'text-amber-500 bg-amber-50',
  Esportes:            'text-emerald-500 bg-emerald-50',
  Veículos:            'text-indigo-500 bg-indigo-50',
  'Jóias & Acessórios': 'text-purple-500 bg-purple-50',
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onInstallClick?: () => void;
  onOpenImport: () => void;
  appLogo?: string | null;
  categories?: { id: string; name: string; icon: string }[];
  onSelectCategory?: (name: string, query?: string) => void;
}

const MobileMenu = ({ isOpen, onClose, onNavigate, onInstallClick, onOpenImport, appLogo, categories, onSelectCategory }: MobileMenuProps) => (
  <>
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-white font-black shrink-0 overflow-hidden">
            <img 
              src={appLogo || CLOUD_LOGO} 
              alt="Elara" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-black">ELARA</span>
          <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">BETA</span>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {onInstallClick && (
          <button 
            onClick={() => { onInstallClick(); onClose(); }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-purple-500/20"
          >
            <Download size={20} />
            Instalar Aplicativo
          </button>
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {[
            { icon: Home, label: 'Início', view: 'home' },
            { icon: ShoppingBag, label: 'Meus Pedidos', view: 'orders' },
            { icon: MessageCircle, label: 'Mensagens', view: 'messages' },
            { icon: User, label: 'Perfil', view: 'settings' }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => { onNavigate(item.view); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-zinc-600 hover:bg-zinc-100 active:scale-95"
            >
              <item.icon size={19} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Categories strip */}
        {categories && categories.length > 0 && onSelectCategory && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Categorias</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.filter(cat => cat.name.length <= 20).map(cat => {
                const colorClass = catColors[cat.name] || 'text-zinc-500 bg-zinc-100';
                const icon = catIconMap[cat.name];
                return (
                  <button
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.name); onClose(); }}
                    className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-zinc-50 active:scale-95 transition-all text-left border border-zinc-100"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                      {icon}
                    </div>
                    <span className="text-xs font-bold text-zinc-700 leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Serviços</h4>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { icon: Globe, label: 'Importação Direta', color: 'text-blue-500', bg: 'bg-blue-50', action: onOpenImport },
              { icon: Shield, label: 'Compra Segura', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Zap, label: 'Ofertas Flash', color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => { if (item.action) { item.action(); onClose(); } }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold transition-colors text-left active:scale-95"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                  <item.icon size={17} />
                </div>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-zinc-200 bg-zinc-50 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
        <p className="text-xs font-bold text-zinc-500 text-center">© 2026 ELARA Marketplace</p>
      </div>
    </div>
  </>
);

export default MobileMenu;

