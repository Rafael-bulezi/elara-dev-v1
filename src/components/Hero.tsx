import React from 'react';
import { Zap, ShieldCheck, Truck, Globe } from 'lucide-react';
import { evangelisticVerses } from '../constants/verses';

const Hero = () => (
  <section className="relative overflow-hidden pt-12 pb-12 md:pt-24 md:pb-24 transition-colors duration-500">
    {/* Light and Dark mode specific Hero gradients */}
    <div className="absolute inset-0 transition-opacity duration-500 pointer-events-none">
      {/* Light Mode Gradient */}
      <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#f3e8ff_0%,transparent_60%)]" />
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px]" />
      </div>
      {/* Dark Mode Gradient */}
      <div className="absolute inset-0 opacity-0 dark:opacity-30 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#7c3aed_0%,transparent_60%)]" />
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px]" />
      </div>
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
        <div className="flex-1 text-center lg:text-left space-y-8 md:space-y-12">
          <div className="flex flex-col items-center lg:items-start gap-4 mb-6">
            <p className="text-purple-600 dark:text-purple-300/80 text-sm italic font-medium animate-in fade-in duration-1000">
              "{evangelisticVerses[0]}"
            </p>
            <div className="inline-flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-purple-500/20 dark:border-white/10 px-5 py-2.5 rounded-2xl text-purple-700 dark:text-purple-400 text-xs md:text-sm font-black uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap size={16} className="animate-pulse" />
              Marketplace #1 de Angola
            </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-[-0.04em] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            COMPRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 dark:from-purple-400 via-blue-600 dark:via-blue-400 to-purple-600 dark:to-purple-400 bg-[length:200%_auto] animate-gradient">TUDO</span><br />
            SEM LIMITES.
          </h1>
          
          <p className="text-zinc-600 dark:text-zinc-400 text-xl md:text-3xl font-medium max-w-2xl mx-auto lg:mx-0 leading-tight animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Conectamos você aos melhores produtos locais e internacionais com entrega relâmpago e segurança total.
          </p>


          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <button className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700 px-12 py-6 rounded-[24px] font-black text-xl active:scale-95 transition-all duration-500">
              Explorar Ofertas
            </button>
            <button className="w-full sm:w-auto bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 px-12 py-6 rounded-[24px] font-black text-xl backdrop-blur-xl active:scale-95 transition-all duration-500">
              Como Funciona
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 md:pt-16 animate-in fade-in duration-1000 delay-500">
            {[
              { icon: ShieldCheck, label: 'Compra Segura', color: 'text-emerald-600 dark:text-emerald-400' },
              { icon: Truck, label: 'Entrega Rápida', color: 'text-blue-600 dark:text-blue-400' },
              { icon: Globe, label: 'Global & Local', color: 'text-purple-600 dark:text-purple-400' },
              { icon: Zap, label: 'Suporte 24/7', color: 'text-amber-600 dark:text-amber-400' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start gap-3 group cursor-default">
                <div className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 group-hover:bg-white/80 dark:group-hover:bg-white/10 group-hover:border-zinc-300 dark:group-hover:border-white/10 transition-all duration-500">
                  <item.icon size={28} className={item.color} />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 relative w-full lg:block animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="relative z-10 bg-white/50 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-black p-4 md:p-5 rounded-[32px] md:rounded-[64px] border border-zinc-200/50 dark:border-white/10 group mx-auto max-w-lg lg:max-w-none transition-colors duration-500 backdrop-blur-sm">
            <div className="overflow-hidden rounded-[24px] md:rounded-[48px]">
              <img 
                src="https://picsum.photos/seed/ecommerce/1000/1000" 
                alt="Hero" 
                className="w-full h-auto object-cover grayscale-[0.2] dark:grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              />
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 bg-white dark:bg-zinc-900 p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-bounce duration-[4000ms]">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <ShieldCheck size={20} className="md:size-8" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5 md:mb-1">Proteção Total</p>
                  <p className="text-sm md:text-xl font-black text-zinc-900 dark:text-white">Pagamento Seguro</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 md:-bottom-12 md:-left-12 bg-purple-600 p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-2xl animate-pulse duration-[3000ms]">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                  <Zap size={20} className="md:size-8" />
                </div>
                <div className="text-white">
                  <p className="text-[8px] md:text-[10px] font-black opacity-70 uppercase tracking-widest mb-0.5 md:mb-1">Oferta Flash</p>
                  <p className="text-sm md:text-xl font-black">Até -50% OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
