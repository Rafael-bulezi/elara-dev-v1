import React from 'react';
import { X, ShoppingCart, Star, ShieldCheck, Zap, Package, Truck, MessageCircle, User } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
  onContactSeller?: (sellerId: string, sellerName: string, sellerAvatar: string) => void;
  onViewSeller?: (sellerId: string) => void;
}

const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart, 
  onContactSeller, 
  onViewSeller 
}: ProductDetailsModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] md:rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xl active:scale-90">
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full bg-zinc-100 dark:bg-zinc-900 relative flex-shrink-0">
          <img 
            src={product.image || 'https://picsum.photos/seed/placeholder/800/800'} 
            alt={product.title} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/800/800';
            }}
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 pr-6">
            {product.verified && (
              <div className="bg-emerald-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] md:text-sm shadow-xl shadow-emerald-500/20 backdrop-blur-md border border-white/20">
                <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" />
                Verificado
              </div>
            )}
            <div className="bg-purple-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] md:text-sm shadow-xl shadow-purple-500/20 backdrop-blur-md border border-white/20">
              <Zap size={16} className="md:w-[18px] md:h-[18px]" />
              Flash Delivery
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-5 md:p-12 flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] md:text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} className="fill-current" />
                <span className="text-xs md:text-sm font-black text-zinc-900 dark:text-white">{product.productRating || 4.5}</span>
                <span className="text-[10px] md:text-sm font-bold text-zinc-400">({product.productReviews || 0} avaliações)</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 md:mb-6 leading-tight tracking-tight">{product.title}</h2>
            
            <div className="flex items-baseline gap-3 md:gap-4 mb-6 md:mb-8">
              <span className="text-3xl md:text-4xl font-black text-purple-600 dark:text-purple-400">Kz {product.price.toLocaleString('pt-AO')}</span>
              {product.originalPrice && (
                <span className="text-lg md:text-xl text-zinc-400 line-through font-bold">Kz {product.originalPrice.toLocaleString('pt-AO')}</span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 md:gap-3 text-zinc-500 dark:text-zinc-400 mb-1">
                  <Package size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Condição</span>
                </div>
                <p className="text-xs md:text-base font-black dark:text-white">{product.condition || 'Novo'}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 md:gap-3 text-zinc-500 dark:text-zinc-400 mb-1">
                  <Truck size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Entrega</span>
                </div>
                <p className="text-xs md:text-base font-black dark:text-white">{product.deliveryStatus || '24-48h'}</p>
              </div>
            </div>

            <div 
              onClick={() => onViewSeller?.(product.sellerId)}
              className="group bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-zinc-100 dark:border-zinc-800 mb-6 md:mb-8 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <img src={product.sellerAvatar} alt={product.sellerName} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-5 md:h-5 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-black dark:text-white group-hover:text-purple-600 transition-colors">{product.sellerName}</h4>
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-zinc-500">
                    <Star size={12} className="fill-amber-400 text-amber-400 md:w-3.5 md:h-3.5" />
                    <span className="font-bold">{product.sellerRating || 4.8}</span>
                    <span className="opacity-50">•</span>
                    <span className="font-bold">{product.sellerReviews || 0} vendas</span>
                  </div>
                </div>
              </div>
              <button className="p-2 md:p-3 bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl text-zinc-400 group-hover:text-purple-600 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-all">
                <User size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          <div className="sticky bottom-0 p-4 md:p-12 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800 flex gap-3 md:gap-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-12 z-10">
            <button 
              onClick={() => onContactSeller?.(product.sellerId, product.sellerName, product.sellerAvatar)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
            >
              <MessageCircle size={20} className="md:w-[22px] md:h-[22px]" />
              <span className="text-sm md:text-base">Chat</span>
            </button>
            <button 
              onClick={() => onAddToCart(product)}
              className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
            >
              <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
              <span className="text-sm md:text-base">Adicionar ao Carrinho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
