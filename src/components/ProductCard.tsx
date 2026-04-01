import React from 'react';
import { ShoppingCart, Star, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onProductClick }: ProductCardProps) => (
  <div 
    onClick={() => onProductClick(product)}
    className="group bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98]"
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
      <ImageWithFallback 
        src={product.image} 
        alt={product.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.verified && (
          <div className="bg-emerald-500/90 backdrop-blur-md text-white p-1.5 rounded-xl shadow-lg border border-white/20">
            <ShieldCheck size={16} />
          </div>
        )}
        {product.isImport && (
          <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
            Importação
          </div>
        )}
        {product.condition && (
          <div className={`${product.condition === 'Novo' ? 'bg-purple-600/90' : 'bg-amber-500/90'} backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20`}>
            {product.condition}
          </div>
        )}
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl text-purple-600 dark:text-purple-400 shadow-xl translate-y-12 group-hover:translate-y-0 transition-all duration-500 hover:bg-purple-600 hover:text-white active:scale-90 border border-white/20"
      >
        <ShoppingCart size={20} />
      </button>
    </div>
    
    <div className="p-3 md:p-5 flex flex-col flex-1">
      <div className="flex items-center gap-1.5 mb-2 md:mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-amber-400 text-amber-400 md:w-3 md:h-3" />
          <span className="text-[10px] md:text-xs font-black text-zinc-900 dark:text-white">{product.productRating || 4.5}</span>
        </div>
        <span className="text-[10px] md:text-xs font-bold text-zinc-400">({product.productReviews || 0})</span>
        <div className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden md:block" />
        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 truncate max-w-[60px] md:max-w-none">{product.category}</span>
      </div>
      
      <h3 className="text-sm md:text-base font-black text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 md:mb-3">{product.title}</h3>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5 flex-wrap mb-3 md:mb-4">
          <span className="text-lg md:text-2xl font-black text-purple-600 dark:text-purple-400">
            Kz {product.price.toLocaleString('pt-AO')}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] md:text-sm text-zinc-400 line-through font-bold">
              Kz {product.originalPrice.toLocaleString('pt-AO')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
            <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-black text-zinc-900 dark:text-white truncate">{product.sellerName}</p>
            <div className="flex items-center gap-1 text-emerald-500">
              <Zap size={8} className="fill-current md:w-2.5 md:h-2.5" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Vendedor Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;
