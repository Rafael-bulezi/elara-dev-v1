import React from 'react';
import { Facebook, Instagram, Twitter, Globe, Shield } from 'lucide-react';

const Footer = () => (
  <footer className="bg-zinc-900 text-white pt-12 pb-8 border-t border-zinc-800">
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <img src="/elara-logo.jpg" alt="Elara" className="w-9 h-9 object-contain rounded" />
            <span className="text-xl font-black tracking-tight">Elara</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            O maior marketplace de Angola, conectando compradores e vendedores com segurança e rapidez.
          </p>
          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <button key={i} className="w-9 h-9 bg-zinc-800 hover:bg-purple-600 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Categorias</h4>
          <ul className="space-y-2.5">
            {['Eletrónicos', 'Computadores', 'Moda', 'Casa & Cozinha', 'Beleza', 'Esportes'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Suporte</h4>
          <ul className="space-y-2.5">
            {['Como Comprar', 'Como Vender', 'Segurança', 'Devoluções', 'Termos de Uso', 'Contacto'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagamentos */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Pagamentos</h4>
          <div className="space-y-2">
            {['Multicaixa Express', 'Referência Multicaixa', 'Pagamento na Entrega'].map((m) => (
              <div key={m} className="flex items-center gap-2 text-sm text-zinc-400">
                <Shield size={12} className="text-emerald-400 shrink-0" />
                {m}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">Entrega em 24-48h em Luanda</p>
            <p className="text-xs text-zinc-500 mt-1">Províncias: 2–5 dias úteis</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">© 2026 Elara Marketplace. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Globe size={12} />Angola (PT)</span>
          <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" />Pagamento 100% Seguro</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
