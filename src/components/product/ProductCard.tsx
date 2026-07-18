import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import ImageWithFallback from '../common/ImageWithFallback';
import { getAvatarUrl } from '../../utils/avatar';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onProductClick }: ProductCardProps) => (
  <div 
    onClick={() => onProductClick(product)}
    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
      <ImageWithFallback 
        src={product.image} 
        alt={product.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {product.isImport && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          Import
        </div>
      )}
    </div>
    
    <div className="p-3 flex flex-col flex-1">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
        {product.title}
      </h3>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-black text-zinc-900 dark:text-white">
          Kz {product.price.toLocaleString('pt-AO')}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)} alt={product.sellerName} className="w-5 h-5 rounded-full object-cover" />
        <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate flex-1">{product.sellerName}</span>
        <div className="flex items-center gap-0.5 text-amber-500">
          <Star size={10} fill="currentColor" />
          <span className="text-[10px] font-bold">{product.sellerRating}</span>
        </div>
      </div>
      
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-[10px] font-medium text-zinc-500 uppercase">{product.condition}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="text-purple-600 hover:text-purple-700 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;

