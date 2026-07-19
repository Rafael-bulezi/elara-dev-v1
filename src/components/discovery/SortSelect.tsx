import React from 'react';
import { ChevronDown, ArrowDownAZ, ArrowUpAZ, Clock, Tag, Star, SlidersHorizontal } from 'lucide-react';
import { SortOption, SORT_LABELS } from '../../types/discovery';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; icon: React.ElementType }[] = [
  { value: 'relevance', icon: SlidersHorizontal },
  { value: 'price-asc', icon: ArrowDownAZ },
  { value: 'price-desc', icon: ArrowUpAZ },
  { value: 'newest', icon: Clock },
  { value: 'promo', icon: Tag },
  { value: 'rating', icon: Star }
];

const SortSelect = ({ value, onChange }: SortSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-zinc-200 hover:border-purple-500/50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
      >
        <selected.icon size={16} className="text-purple-600" />
        <span className="text-zinc-700">{SORT_LABELS[value]}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                value === option.value
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <option.icon size={16} />
              {SORT_LABELS[option.value]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortSelect;
