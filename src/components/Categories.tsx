import React from 'react';
import { Smartphone, Cpu, Shirt, Home, Wrench, LayoutGrid, Laptop, Sparkles, Dumbbell } from 'lucide-react';
import { categories } from '../constants';

const iconMap: { [key: string]: React.ElementType } = {
  Smartphone,
  Cpu,
  Shirt,
  Home,
  Wrench,
  LayoutGrid,
  Laptop,
  Sparkles,
  Dumbbell
};

interface CategoriesProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

const Categories = ({ activeCategory, onSelectCategory }: CategoriesProps) => (
  <section className="container mx-auto px-4 py-8">
    <div className="flex flex-col gap-6">
      {/* Main Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <button 
              key={cat.id}
              onClick={() => onSelectCategory(activeCategory === cat.name ? '' : cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat.name 
                  ? 'border-purple-600 bg-purple-600 text-white' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-purple-500'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

export default Categories;
