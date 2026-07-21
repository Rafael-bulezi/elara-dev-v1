import React, { useState, useRef } from 'react';
import { ArrowRight, Home, Smartphone, Shirt, Cpu, Home as HomeIcon, Sparkles, Dumbbell, Car, Gem } from 'lucide-react';
import { Product } from '../../types';

/* ─── Icon map (only strip categories) ─── */
const catIconMap: Record<string, React.ReactNode> = {
  Tecnologia:          <Cpu size={15} />,
  Moda:                <Shirt size={15} />,
  Beleza:              <Sparkles size={15} />,
  Casa:                <HomeIcon size={15} />,
  Esportes:            <Dumbbell size={15} />,
  Veículos:            <Car size={15} />,
  'Jóias & Acessórios': <Gem size={15} />,
};

const catColors: Record<string, string> = {
  Tecnologia:          'text-blue-600',
  Moda:                'text-pink-600',
  Beleza:              'text-rose-600',
  Casa:                'text-amber-600',
  Esportes:            'text-emerald-600',
  Veículos:            'text-indigo-600',
  'Jóias & Acessórios': 'text-purple-600',
};

const catBanners: Record<string, string> = {
  Tecnologia:          '/banner-tech.jpg',
  Moda:                '/banner-beauty2.jpg',
  Beleza:              '/banner-beauty2.jpg',
  Casa:                '/banner-casa.jpg',
  Esportes:            '/banner-sports.jpg',
  Veículos:            '/banner-urban.jpg',
  'Jóias & Acessórios': '/banner-art.jpg',
};

const catTaglines: Record<string, string> = {
  Tecnologia:          'Smartphones, laptops, tablets e acessórios tech.',
  Moda:                'Tendências de moda para o dia a dia em Angola.',
  Beleza:              'Cuidados de pele, maquiagem e perfumes premium.',
  Casa:                'Tudo para a sua cozinha e casa dos sonhos.',
  Esportes:            'Equipe-se para o sucesso no seu treino.',
  Veículos:            'Carros, motos e veículos para todo o terreno.',
  'Jóias & Acessórios': 'Joias, relógios e acessórios que marcam estilo.',
};

const catSubs: Record<string, { popular: string[]; more: string[] }> = {
  Tecnologia: {
    popular: ['Smartphones', 'Laptops', 'Tablets', 'Auscultadores', 'Smart Watches', 'Acessórios'],
    more:    ['Capas & Películas', 'Carregadores', 'Power Banks', 'Monitores', 'Teclados', 'Webcams'],
  },
  Moda: {
    popular: ['Roupas Femininas', 'Roupas Masculinas', 'Calçados', 'Bolsas', 'Acessórios'],
    more:    ['Joias', 'Relógios', 'Óculos de sol', 'Cintos', 'Chapéus'],
  },
  Beleza: {
    popular: ['Cuidado da Pele', 'Maquiagem', 'Cabelos', 'Perfumes', 'Corpo & Banho', 'Unhas'],
    more:    ['Sérum', 'Protetor Solar', 'Máscaras Faciais', 'Esmalte', 'Depilação'],
  },
  Casa: {
    popular: ['Eletrodomésticos', 'Cozinha', 'Sala de Estar', 'Quarto', 'Decoração'],
    more:    ['Iluminação', 'Tapetes', 'Organização', 'Casa de Banho', 'Jardim'],
  },
  Esportes: {
    popular: ['Musculação', 'Corrida', 'Futebol', 'Basquete', 'Ciclismo', 'Yoga'],
    more:    ['Natação', 'Boxe', 'Ténis', 'Camping', 'Artes Marciais'],
  },
  Veículos: {
    popular: ['SUV', 'Carros Eléctricos', 'Sedans', 'Motos', 'Jipes', 'Carrinhas'],
    more:    ['Peças & Acessórios', 'Pneus', 'Som Automotivo', 'GPS', 'Seguro'],
  },
  'Jóias & Acessórios': {
    popular: ['Colares', 'Pulseiras', 'Brincos', 'Anéis', 'Relógios', 'Óculos de Sol'],
    more:    ['Carteiras', 'Cintos', 'Lenços', 'Chapéus', 'Semijoias'],
  },
};

interface CategoryMegaMenuProps {
  categories: { id: string; name: string; icon: string }[];
  products: Product[];
  onSelectCategory: (name: string, query?: string) => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (p: Product) => void;
  onNavigate: (view: 'home') => void;
}

const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  categories, onSelectCategory, onNavigate,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = (name: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(name);
  };
  const close = () => {
    hideTimer.current = setTimeout(() => setHovered(null), 160);
  };
  const keepOpen = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const subs = hovered ? catSubs[hovered] : null;

  return (
    <div
      className="bg-white border-b border-zinc-200 shadow-sm"
      onMouseLeave={close}
    >
      {/* ── Pill strip ── */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1.5 no-scrollbar">

          {/* Início pill — always hardcoded, never derived from props */}
          <button
            onClick={() => { setHovered(null); onNavigate('home'); }}
            onMouseEnter={() => open('')}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white whitespace-nowrap"
          >
            <Home size={13} />
            <span>Início</span>
          </button>

          {/* Category pills — only render known categories, skip any with very long names */}
          {categories
            .filter(cat => cat.name.length <= 30)
            .map(cat => (
              <button
                key={cat.id}
                onMouseEnter={() => open(cat.name)}
                onClick={() => { setHovered(null); onSelectCategory(cat.name); }}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap
                  ${hovered === cat.name
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-purple-400 hover:text-purple-600'
                  }`}
              >
                <span className={catColors[cat.name] || 'text-zinc-500'}>
                  {catIconMap[cat.name]}
                </span>
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* ── Dropdown (desktop hover only) ── */}
      {hovered && hovered !== '' && subs && (
        <div
          className="hidden md:block absolute left-0 right-0 top-full bg-white border-b border-zinc-200 shadow-2xl z-50"
          onMouseEnter={keepOpen}
          onMouseLeave={close}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex gap-6">
            {/* Subcategory columns */}
            <div className="flex gap-8 shrink-0">
              <div className="min-w-[160px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Mais populares</p>
                <ul className="space-y-2">
                  {subs.popular.map(sub => (
                    <li key={sub}>
                      <button onClick={() => { setHovered(null); onSelectCategory(hovered!, sub); }}
                        className="text-sm text-zinc-700 hover:text-purple-600 font-medium transition-colors text-left">
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-[160px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Mais categorias</p>
                <ul className="space-y-2">
                  {subs.more.map(sub => (
                    <li key={sub}>
                      <button onClick={() => { setHovered(null); onSelectCategory(hovered!, sub); }}
                        className="text-sm text-zinc-700 hover:text-purple-600 font-medium transition-colors text-left">
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="hidden md:block w-px bg-zinc-200 shrink-0" />

            {/* Banner card */}
            <div className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group min-h-[220px]"
              onClick={() => { setHovered(null); onSelectCategory(hovered!); }}>
              <img src={catBanners[hovered!] || '/banner-hero-main.jpg'} alt={hovered!}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-400" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
              <div className="relative z-10 p-7 flex flex-col justify-between h-full">
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-2xl font-black text-white leading-tight">{hovered}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">
                    {catTaglines[hovered!] || 'Explore os melhores produtos desta categoria.'}
                  </p>
                </div>
                <button className="mt-6 self-start flex items-center gap-2 bg-white text-zinc-900 text-xs font-black px-5 py-2.5 rounded-full hover:bg-purple-50 transition-colors shadow-md">
                  Explorar agora <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
