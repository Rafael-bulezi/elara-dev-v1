import React from 'react';
import { Smartphone, Cpu, Shirt, Home, Wrench, LayoutGrid } from 'lucide-react';
import { categories } from '../constants';

const iconMap: { [key: string]: React.ElementType } = {
  Smartphone,
  Cpu,
  Shirt,
  Home,
  Wrench,
  LayoutGrid
};

interface CategoriesProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

const Categories = ({ activeCategory, onSelectCategory }: CategoriesProps) => (
  <section className="container mx-auto px-4 py-12 md:py-24">
    <div className="flex items-end justify-between mb-12 md:mb-16">
      <div>
        <h2 className="text-3xl md:text-6xl font-black dark:text-white tracking-tighter mb-4">Categorias Populares</h2>
        <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium">Explore o melhor de cada departamento</p>
      </div>
      <button className="hidden sm:flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest text-sm hover:gap-4 transition-all">
        Ver todas <LayoutGrid size={18} />
      </button>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon];
        return (
          <button 
            key={cat.id}
            onClick={() => onSelectCategory(activeCategory === cat.name ? '' : cat.name)}
            className={`group flex flex-col items-center gap-6 p-8 md:p-12 rounded-[48px] border-2 transition-all duration-500 ${activeCategory === cat.name ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 scale-95' : 'border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-900 hover:border-purple-500/30 text-zinc-600 dark:text-zinc-400 hover:-translate-y-2'}`}
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[24px] flex items-center justify-center transition-all duration-500 ${activeCategory === cat.name ? 'bg-purple-600 text-white shadow-2xl shadow-purple-500/40' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-purple-500/40'}`}>
              <Icon size={32} className="md:w-10 md:h-10" />
            </div>
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">{cat.name}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default Categories;
