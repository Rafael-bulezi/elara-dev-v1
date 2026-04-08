import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { BeforeInstallPromptEvent } from '../types';
import { CLOUD_LOGO } from '../constants/logo';

interface InstallPromptProps {
  deferredPrompt: BeforeInstallPromptEvent | null;
  clearPrompt: () => void;
  forceShow?: boolean;
  appLogo?: string | null;
}

const InstallPrompt = ({ deferredPrompt, clearPrompt, forceShow, appLogo }: InstallPromptProps) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandAlone = window.matchMedia('(display-mode: standalone)').matches || 
                         ('standalone' in window.navigator && !!window.navigator.standalone);
    setIsStandalone(isStandAlone);

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Show prompt if we have a deferred prompt OR if it's iOS and not standalone OR if forced
    if (!isStandAlone && (deferredPrompt || isIosDevice || forceShow)) {
      // Small delay so it doesn't pop up instantly on load
      const timer = setTimeout(() => setShowPrompt(true), forceShow ? 0 : 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, forceShow]);

  if (!showPrompt || isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        setShowPrompt(false);
        clearPrompt();
      }
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-10">
      <button 
        onClick={() => setShowPrompt(false)}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4 pr-6">
        <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-3xl overflow-hidden">
          <img 
            src={appLogo || CLOUD_LOGO} 
            alt="Elara" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
            onError={(e) => { 
              const target = e.currentTarget;
              const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='128' fill='%239333ea'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='300' font-weight='bold' fill='%23ffffff' text-anchor='middle' dominant-baseline='central'%3EE%3C/text%3E%3C/svg%3E";
              if (target.src !== fallbackSvg) {
                target.src = fallbackSvg;
              }
            }} 
          />
        </div>
        
        <div className="flex-1">
          <h4 className="font-black text-lg dark:text-white leading-tight mb-1">
            Instalar o App Elara <span className="text-purple-600 text-sm">Beta</span>
          </h4>
          
          {isIOS ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 mt-2">
              <p>Para instalar no seu iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-1 font-medium">
                <li className="flex items-center gap-2">Toque em <Share size={16} className="inline text-blue-500" /> Compartilhar</li>
                <li className="flex items-center gap-2">Selecione <PlusSquare size={16} className="inline text-zinc-500" /> Adicionar à Tela de Início</li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Tenha uma experiência mais rápida, segura e sem gastar dados do navegador.
              </p>
              
              {!deferredPrompt && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-white">Como instalar:</p>
                  <ol className="list-decimal list-inside space-y-1 font-medium">
                    <li>Toque nos <strong>3 pontinhos</strong> no menu do navegador</li>
                    <li>Selecione <strong>Adicionar à tela inicial</strong> ou <strong>Instalar aplicativo</strong></li>
                  </ol>
                </div>
              )}

              <button 
                onClick={() => {
                  if (deferredPrompt) {
                    handleInstallClick();
                  } else {
                    alert('Para instalar, toque nos 3 pontinhos no menu do seu navegador e selecione "Adicionar à tela inicial" ou "Instalar aplicativo".');
                    clearPrompt();
                    setShowPrompt(false);
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Instalar o App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
