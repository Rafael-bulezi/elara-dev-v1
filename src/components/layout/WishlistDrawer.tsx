import React from 'react';
import { X, ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import ImageWithFallback from '../common/ImageWithFallback';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onAddToCart: (product: Product) => void;
  onRemove: (productId: string) => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen, onClose, items, onAddToCart, onRemove,
}) => (
  <>
    <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
          <h2 className="font-black text-zinc-900">Favoritos</h2>
          <span className="text-sm text-zinc-400">({items.length})</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100">
          <X size={20} className="text-zinc-500" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <Heart size={48} className="text-zinc-200" />
            <p className="font-bold text-zinc-500">A sua lista de favoritos está vazia</p>
            <p className="text-sm text-zinc-400">Clique no ❤ nos produtos para os guardar aqui</p>
            <button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
              Explorar produtos
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {items.map(item => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                  <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 line-clamp-2">{item.title}</p>
                  <p className="text-base font-black text-purple-600 mt-1">{item.price.toLocaleString('pt-AO')} Kz</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onAddToCart(item)}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      <ShoppingCart size={12} />
                      Adicionar
                    </button>
                    <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);

export default WishlistDrawer;
