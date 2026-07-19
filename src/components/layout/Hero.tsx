import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onCtaClick?: () => void;
}

const BANNERS = [
  {
    id: 1,
    img: '/hero-banner.jpg',
    tag: 'Novo em Angola',
    title: 'Tudo o que precisa,',
    highlight: 'entregue em Luanda.',
    sub: 'A Elara oferece acesso exclusivo a marcas premium, tecnologia de ponta e essenciais para o seu dia-a-dia.',
    cta1: 'Comprar agora',
    cta2: 'Ver ofertas',
    bg: 'from-[#f3e8ff] to-[#ede9fe]',
    darkBg: 'dark:from-zinc-900 dark:to-zinc-900',
  },
  {
    id: 2,
    img: '/banner-urban.jpg',
    isFullBanner: true,
  },
  {
    id: 3,
    img: '/banner-beauty.jpg',
    isFullBanner: true,
  },
  {
    id: 4,
    img: '/banner-fitness.jpg',
    isFullBanner: true,
  },
];

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[current];

  return (
    <div className="relative overflow-hidden">
      {/* Slides */}
      <div className="relative">
        {banner.isFullBanner ? (
          <div className="w-full aspect-[2.5/1] md:aspect-[3.5/1] relative">
            <img src={banner.img} alt="Ofertas" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`bg-gradient-to-r ${banner.bg} ${banner.darkBg} min-h-[260px] md:min-h-[320px]`}>
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Text */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                    ✦ {banner.tag}
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                    {banner.title}<br />
                    <span className="text-purple-600">{banner.highlight}</span>
                  </h1>
                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto md:mx-0">
                    {banner.sub}
                  </p>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <button onClick={onCtaClick} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
                      {banner.cta1} <ArrowRight size={16} />
                    </button>
                    <button onClick={onCtaClick} className="border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900">
                      {banner.cta2}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 justify-center md:justify-start text-xs text-zinc-600 dark:text-zinc-400">
                    {['Pagamento Seguro', 'Entrega Rápida', '100% Original'].map((t, i) => (
                      <span key={i} className="flex items-center gap-1"><CheckCircle2 size={12} className="text-purple-600" />{t}</span>
                    ))}
                  </div>
                </div>
                {/* Image */}
                <div className="flex-1 flex justify-center md:justify-end">
                  <img src={banner.img} alt="Elara" className="max-h-56 md:max-h-72 object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <button onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-zinc-900/80 rounded-full flex items-center justify-center shadow text-zinc-700 dark:text-zinc-300 hover:bg-white">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setCurrent(c => (c + 1) % BANNERS.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-zinc-900/80 rounded-full flex items-center justify-center shadow text-zinc-700 dark:text-zinc-300 hover:bg-white">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-2 bg-white dark:bg-zinc-950">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
        ))}
      </div>
    </div>
  );
};

export default Hero;
