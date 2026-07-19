import React from 'react';
import { Search, Clock, X } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (q: string) => void;
  suggestions: string[];
  recentSearches: string[];
}

const SearchSuggestions = ({
  query,
  onQueryChange,
  onSelect,
  suggestions,
  recentSearches
}: SearchSuggestionsProps) => {
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

  const showSuggestions = isOpen && (query.trim().length > 0 || recentSearches.length > 0);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Buscar produtos, marcas, vendedores..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSelect(query);
              setIsOpen(false);
            }
          }}
          className="w-full bg-zinc-100 border-2 border-transparent focus:border-purple-500/50 focus:bg-white rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium transition-all outline-none placeholder:text-zinc-400"
        />
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
          {query.trim().length > 0 && (
            <button
              onClick={() => { onSelect(query); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Search size={16} />
              Ver resultados para "{query}"
            </button>
          )}

          {suggestions.length > 0 && (
            <div className="border-t border-zinc-100">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(s); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Search size={14} className="text-zinc-400" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="border-t border-zinc-100">
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Pesquisas Recentes
              </div>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(s); setIsOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Clock size={14} className="text-zinc-400" />
                    {s}
                  </span>
                  <X
                    size={14}
                    className="text-zinc-400 hover:text-rose-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = recentSearches.filter((_, idx) => idx !== i);
                      localStorage.setItem('recentSearches', JSON.stringify(updated));
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
