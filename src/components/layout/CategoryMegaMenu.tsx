import React, { useState, useRef } from 'react';
import { ArrowRight, Home, Smartphone, Shirt, Cpu, Laptop, Home as HomeIcon, Sparkles, Dumbbell } from 'lucide-react';
import { Product } from '../../types';

/* ─── Icon map ─── */
const catIconMap: Record<string, React.ReactNode> = {
  Smartphones:   <Smartphone size={15} />,
  Moda:          <Shirt size={15} />,
  'Eletrónicos': <Cpu size={15} />,
  Computadores:  <Laptop size={15} />,
  Casa:          <HomeIcon size={15} />,
  Beleza:        <Sparkles size={15} />,
  Esportes:      <Dumbbell size={15} />,
};

const catColors: Record<string, string> = {
  Smartphones:   'text-blue-600',
  Moda:          'text-pink-600',
  'Eletrónicos': 'text-purple-600',
  Computadores:  'text-indigo-600',
  Casa:          'text-amber-600',
  Beleza:        'text-rose-600',
  Esportes:      'text-emerald-600',
};

const catBanners: Record<string, string> = {
  Smartphones:   '/banner-tech.jpg',
  Moda:          '/banner-beauty2.jpg',
  'Eletrónicos': '/banner-eletronicos.jpg',
  Computadores:  '/banner-tech.jpg',
  Casa:          '/banner-casa.jpg',
  Beleza:        '/banner-beauty2.jpg',
  Esportes:      '/banner-sports.jpg',
};

const catTaglines: Record<string, string> = {
  Smartphones:   'Os melhores smartphones e acessórios premium.',
  Moda:          'Tendências de moda para o dia a dia em Angola.',
  'Eletrónicos': 'Tecnologia criativa e gadgets inovadores.',
  Computadores:  'Laptops, desktops e periféricos para todos.',
  Casa:          'Tudo para a sua cozinha e casa dos sonhos.',
  Beleza:        'Cuidados de pele e beleza de marcas premium.',
  Esportes:      'Equipe-se para o sucesso no seu treino.',
};

const catSubs: Record<string, { popular: string[]; more: string[] }> = {
  Smartphones: {
    popular: ['iPhone', 'Samsung Galaxy', 'Xiaomi', 'Tecno', 'Infinix', 'Huawei'],
    more:    ['Capas & Proteção', 'Carregadores', 'Earbuds', 'Películas', 'Power Banks'],
  },
  Moda: {
    popular: ['Roupas Masculinas', 'Roupas Femininas', 'Calçados', 'Bolsas', 'Acessórios', 'Joias'],
    more:    ['Relógios', 'Óculos de sol', 'Cintos', 'Chapéus', 'Meias'],
  },
  'Eletrónicos': {
    popular: ['TVs & Monitores', 'Tablets', 'Câmeras', 'Headphones', 'Smart Speakers', 'Drones'],
    more:    ['GPS & Rastreadores', 'Projetores', 'Cabos & Adaptadores', 'Baterias', 'Microfones'],
  },
  Computadores: {
    popular: ['Laptops', 'Desktops', 'Monitores', 'Teclados & Ratos', 'Impressoras', 'Roteadores'],
    more:    ['Discos Rígidos', 'SSDs', 'Memória RAM', 'Placas Gráficas', 'Webcams'],
  },
  Casa: {
    popular: ['Cozinha', 'Sala de estar', 'Quarto', 'Casa de Banho', 'Ferramentas', 'Jardim'],
    more:    ['Decoração', 'Iluminação', 'Tapetes', 'Almofadas', 'Organização'],
  },
  Beleza: {
    popular: ['Cuidado da Pele', 'Maquiagem', 'Cabelos', 'Perfumes', 'Corpo & Banho', 'Unhas'],
    more:    ['Depilação', 'Máscaras Faciais', 'Protetor Solar', 'Sérum', 'Esfoliantes'],
  },
  Esportes: {
    popular: ['Musculação', 'Corrida', 'Futebol', 'Basquete', 'Ciclismo', 'Yoga'],
    more:    ['Natação', 'Boxe', 'Ténis', 'Camping', 'Artes Marciais'],
  },
};

interface CategoryMegaMenuProps {
  categories: { id: string; name: string; icon: string }[];
  products: Product[];
  onSelectCategory: (name: string) => void;
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
                      <button onClick={() => { setHovered(null); onSelectCategory(hovered!); }}
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
                      <button onClick={() => { setHovered(null); onSelectCategory(hovered!); }}
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
