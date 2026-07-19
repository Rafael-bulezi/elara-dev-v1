import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { DiscoveryFilters } from '../../types/discovery';
import { ProductCondition } from '../../types';

interface FiltersPanelProps {
  filters: DiscoveryFilters;
  onChange: (filters: DiscoveryFilters) => void;
  isMobile?: boolean;
  onClose?: () => void;
  maxPrice?: number;
}

const CONDITIONS: ProductCondition[] = ['Novo', 'Usado'];

const formatKz = (value: number) => `Kz ${value.toLocaleString('pt-AO')}`;

const FiltersPanel = ({ filters, onChange, isMobile, onClose, maxPrice = 1000000 }: FiltersPanelProps) => {
  const update = (partial: Partial<DiscoveryFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.condition !== null ||
    filters.verified ||
    filters.localOnly ||
    filters.importOnly;

  const clearAll = () => {
    onChange({
      ...filters,
      minPrice: null,
      maxPrice: null,
      condition: null,
      verified: false,
      localOnly: false,
      importOnly: false
    });
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Intervalo de Preço</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ''}
              onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-purple-500/50"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ''}
              onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-purple-500/50"
            />
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={10000}
            value={filters.maxPrice ?? maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="w-full accent-purple-600"
          />
          <p className="text-xs font-bold text-zinc-500">
            Até {formatKz(filters.maxPrice || maxPrice)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Condição</h3>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((condition) => (
            <button
              key={condition}
              onClick={() => update({ condition: filters.condition === condition ? null : condition })}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                filters.condition === condition
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Vendedor</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-zinc-700">Vendedores Verificados</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => update({ verified: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 rounded-full peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-zinc-700">Produtos Locais</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.localOnly}
                onChange={(e) => update({ localOnly: e.target.checked, importOnly: false })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 rounded-full peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-zinc-700">Produtos Importados</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.importOnly}
                onChange={(e) => update({ importOnly: e.target.checked, localOnly: false })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 rounded-full peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-200 text-sm font-black text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <RotateCcw size={16} />
          Limpar Filtros
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[110] flex flex-col">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-purple-600" />
              <h2 className="text-lg font-black">Filtros</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
              <X size={20} className="text-zinc-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {content}
          </div>
          <div className="p-4 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-all"
            >
              Ver Resultados
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-purple-600" />
          <h2 className="text-base font-black">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs font-black text-purple-600 hover:text-purple-700 transition-colors">
            Limpar
          </button>
        )}
      </div>
      {content}
    </div>
  );
};

export default FiltersPanel;
