import React from 'react';
import { Smartphone, Shirt, Cpu, Laptop, Home, Sparkles, Dumbbell, ArrowRight } from 'lucide-react';
import { categories } from '../../constants';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone size={28} />,
  Shirt: <Shirt size={28} />,
  Cpu: <Cpu size={28} />,
  Laptop: <Laptop size={28} />,
  Home: <Home size={28} />,
  Sparkles: <Sparkles size={28} />,
  Dumbbell: <Dumbbell size={28} />,
};

interface CategoryGridProps {
  onCategoryClick: (name: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryClick }) => (
  <section className="px-4">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">Comprar por categoria</h2>
        <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
          Ver todas <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.name)}
            className="group flex flex-col items-center text-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-purple-500/50 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              {iconMap[cat.icon] || <ArrowRight size={28} />}
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">{cat.name}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              Ver mais <ArrowRight size={12} />
            </span>
          </button>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
