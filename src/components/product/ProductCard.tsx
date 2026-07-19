import React from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck, MapPin, Tag } from 'lucide-react';
import { Product } from '../../types';
import ImageWithFallback from '../common/ImageWithFallback';
import { getAvatarUrl } from '../../utils/avatar';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick }) => {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      onClick={() => onProductClick(product)}
      className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-purple-500/50 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <ImageWithFallback
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && discount > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
              -{discount}%
            </span>
          )}
          {product.emPromocao && !discount && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
              Promo
            </span>
          )}
          {product.isImport && (
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
              Import
            </span>
          )}
          {product.verified && (
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
              <ShieldCheck size={10} />
              Verif.
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-lg font-black text-zinc-900 dark:text-white">
            Kz {product.price.toLocaleString('pt-AO')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-zinc-400 line-through font-medium">
              Kz {product.originalPrice.toLocaleString('pt-AO')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          <Truck size={12} />
          <span>{product.deliveryStatus || '24-48h em Luanda'}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <img
            src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
            alt={product.sellerName}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate flex-1">
            {product.sellerName}
          </span>
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star size={10} fill="currentColor" />
            <span className="text-[10px] font-bold">{product.sellerRating || 4.8}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-medium text-zinc-500 uppercase flex items-center gap-1">
            <Tag size={10} />
            {product.condition}
          </span>
          <span className="text-[10px] font-medium text-zinc-500 uppercase flex items-center gap-1">
            <MapPin size={10} />
            {product.isImport ? 'Internacional' : 'Angola'}
          </span>
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
};

export default ProductCard;
