import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { UserProfile } from '../../types';

interface DevToolsProps {
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const DevTools = ({ setUserProfile }: DevToolsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Safety check: Never render in production
  if (import.meta.env.PROD) return null;

  const mockLogin = (role: 'buyer' | 'seller' | 'intermediary' | 'admin') => {
    setUserProfile({
      uid: `dev-${role}-123`,
      name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `dev-${role}@elara.ao`,
      role: role,
      phone: '+244900000000',
      avatar: `https://i.pravatar.cc/150?u=dev-${role}-123`
    });
    setIsOpen(false);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-4 md:right-4 z-[9999]">
      {isOpen ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden min-w-[200px] mb-2 animate-in slide-in-from-bottom-2 fade-in">
          <div className="flex justify-between items-center bg-zinc-950 p-3 border-b border-zinc-800">
            <span className="text-xs font-black text-purple-400 uppercase tracking-widest">DevTools</span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-2 flex flex-col gap-1">
            <button 
              onClick={() => mockLogin('buyer')}
              className="text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg hover:text-white transition-colors"
            >
              Login as Buyer
            </button>
            <button 
              onClick={() => mockLogin('seller')}
              className="text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg hover:text-white transition-colors"
            >
              Login as Seller
            </button>
            <button 
              onClick={() => mockLogin('intermediary')}
              className="text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg hover:text-white transition-colors"
            >
              Login as Micheiro
            </button>
            <div className="h-px w-full bg-zinc-800 my-1" />
            <button 
               onClick={handleLogout}
              className="text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 rounded-lg hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
        >
          <Settings size={20} className="animate-[spin_4s_linear_infinite]" />
        </button>
      )}
    </div>
  );
};

export default DevTools;
