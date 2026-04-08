import React from 'react';
import { Facebook, Instagram, Twitter, Globe, Shield } from 'lucide-react';
import { evangelisticVerses } from '../constants/verses';

const Footer = () => (
  <footer className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white pt-20 pb-10 transition-colors duration-500 border-t border-zinc-200 dark:border-zinc-800">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-2xl">E</span>
            </div>
            <span className="text-3xl font-black tracking-tighter">ELARA</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-medium">
            O maior marketplace de Angola, conectando compradores e vendedores com segurança e rapidez.
          </p>
          <p className="text-purple-600 dark:text-purple-400 text-sm italic font-medium">
            "{evangelisticVerses[1]}"
          </p>
          <div className="flex items-center gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <button key={i} className="w-12 h-12 bg-zinc-100 dark:bg-white/5 hover:bg-purple-600 hover:text-white text-zinc-600 dark:text-white rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 border border-zinc-200 dark:border-white/10">
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-purple-600 dark:text-purple-400">Categorias</h4>
          <ul className="space-y-4">
            {['Eletrónicos', 'Computadores', 'Moda', 'Casa', 'Ferramentas', 'Fotografia'].map((item, i) => (
              <li key={i}>
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-lg flex items-center gap-3 group">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-blue-600 dark:text-blue-400">Suporte</h4>
          <ul className="space-y-4">
            {['Como Comprar', 'Como Vender', 'Segurança', 'Termos de Uso', 'Privacidade', 'Contato'].map((item, i) => (
              <li key={i}>
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-lg flex items-center gap-3 group">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Newsletter</h4>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">Receba as melhores ofertas e novidades diretamente no seu e-mail.</p>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="seu@email.com" 
              className="w-full bg-zinc-100 dark:bg-white/5 border-2 border-zinc-200 dark:border-white/10 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl font-black text-sm transition-all active:scale-95">
              Assinar
            </button>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">250k+</span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Usuários Ativos</span>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">50k+</span>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vendedores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-zinc-500 font-bold text-sm">
          © 2026 ELARA Marketplace. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-zinc-500">
            <Globe size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Angola (PT)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Shield size={16} />
            <span className="text-sm font-bold uppercase tracking-widest">Pagamento Seguro</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
