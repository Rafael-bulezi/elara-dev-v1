import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onCtaClick?: () => void;
}

const BANNERS = [
  {
    id: 1,
    img: '/banner-hero-main.jpg',
    tag: 'Novo em Angola',
    title: 'Tudo o que precisa,',
    highlight: 'entregue em Luanda.',
    sub: 'A Elara oferece acesso exclusivo a marcas premium, tecnologia de ponta e essenciais para o seu dia-a-dia.',
    cta1: 'Comprar agora',
    cta2: 'Ver ofertas',
    textSide: 'left' as const,
    overlay: 'from-black/60 via-black/30 to-transparent',
  },
  {
    id: 2,
    img: '/banner-tech.jpg',
    tag: 'Eletrónicos & Tech',
    title: 'Os gadgets que',
    highlight: 'você sempre quis.',
    sub: 'Scooters elétricos, headphones premium, mochilas e muito mais — tudo em um só lugar.',
    cta1: 'Ver Eletrónicos',
    cta2: 'Promoções',
    textSide: 'left' as const,
    overlay: 'from-black/70 via-black/20 to-transparent',
  },
  {
    id: 3,
    img: '/banner-sports.jpg',
    tag: 'Esportes & Fitness',
    title: 'Equipe-se para',
    highlight: 'o sucesso.',
    sub: 'Halteres, tapetes, shakers e equipamentos para elevar o seu treino ao próximo nível.',
    cta1: 'Explorar Esportes',
    cta2: 'Ver ofertas',
    textSide: 'left' as const,
    overlay: 'from-black/65 via-black/25 to-transparent',
  },
  {
    id: 4,
    img: '/banner-travel.jpg',
    tag: 'Viagens & Aventura',
    title: 'Descubra o mundo',
    highlight: 'com estilo.',
    sub: 'Malas de viagem, câmeras de ação, carteiras premium — tudo para as suas próximas aventuras.',
    cta1: 'Ver Coleção',
    cta2: 'Importar agora',
    textSide: 'left' as const,
    overlay: 'from-black/55 via-black/15 to-transparent',
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
        <div className="w-full aspect-[2.2/1] md:aspect-[3.2/1] lg:aspect-[3.8/1] relative overflow-hidden">
          {/* Background image */}
          <img
            src={banner.img}
            alt={banner.tag}
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.overlay}`} />

          {/* Text content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
              <div className="max-w-lg space-y-3 md:space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                  ✦ {banner.tag}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  {banner.title}<br />
                  <span className="text-purple-300">{banner.highlight}</span>
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-sm leading-relaxed">
                  {banner.sub}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onCtaClick}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors shadow-lg"
                  >
                    {banner.cta1} <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={onCtaClick}
                    className="border-2 border-white/70 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors hover:bg-white/10 backdrop-blur-sm"
                  >
                    {banner.cta2}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  {['Pagamento Seguro', 'Entrega Rápida', '100% Original'].map((t, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-purple-300" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % BANNERS.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-2 bg-white dark:bg-zinc-950">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-purple-600 w-6' : 'bg-zinc-300 dark:bg-zinc-700 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
