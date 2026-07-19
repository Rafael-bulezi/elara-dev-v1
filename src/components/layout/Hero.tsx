import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import TrustBadges from './TrustBadges';

interface HeroProps {
  onCtaClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => (
  <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Text Content */}
        <div className="flex-1 space-y-5 md:space-y-6 text-center md:text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Novo em Angola
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
            Tudo o que precisa, <br className="hidden md:block" />
            <span className="text-purple-600 dark:text-purple-400">entregue em Luanda.</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto md:mx-0 font-medium">
            Milhares de produtos com pagamento seguro e entrega rápida em 24-48h. Compre local e importado num só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <button
              onClick={onCtaClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors"
            >
              <ShoppingBag size={18} />
              Comprar agora
            </button>
            <button
              onClick={onCtaClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:border-purple-500/50 px-6 py-3.5 rounded-xl font-bold text-sm transition-colors"
            >
              Ver ofertas
              <ArrowRight size={18} />
            </button>
          </div>

          <TrustBadges compact className="max-w-xl mx-auto md:mx-0 pt-2" />
        </div>

        {/* Hero Image */}
        <div className="flex-1 w-full max-w-md md:max-w-lg">
          <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop"
              alt="Produtos Elara"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute top-4 right-4 bg-white dark:bg-zinc-900 shadow-lg rounded-xl px-3 py-2 text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Até</p>
              <p className="text-2xl font-black text-purple-600">-50%</p>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">OFF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
