import React from 'react';
import { ShoppingCart, Star, Heart, Truck, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import ImageWithFallback from '../common/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  wishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product, onAddToCart, onProductClick,
  wishlisted = false, onToggleWishlist,
}) => {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const reviewCount = Math.floor(Math.random() * 800) + 12;

  return (
    <div
      onClick={() => onProductClick(product)}
      className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-zinc-300 cursor-pointer flex flex-col h-full transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <ImageWithFallback
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && discount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px] font-black">-{discount}%</span>
          )}
          {product.emPromocao && !discount && (
            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] font-black">PROMO</span>
          )}
          {product.isImport && (
            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black">IMPORT</span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            wishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-zinc-500 hover:text-rose-500'
          }`}
        >
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {/* Verified */}
        {product.verified && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
            <ShieldCheck size={9} />
            Verificado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="text-xs font-semibold text-zinc-800 line-clamp-2 mb-1.5 leading-tight">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className={s <= Math.round(product.sellerRating || 4.5) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'} />
            ))}
          </div>
          <span className="text-[10px] text-zinc-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mb-1.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-black text-zinc-900">
              {product.price.toLocaleString('pt-AO')} Kz
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-zinc-400 line-through">
                {product.originalPrice.toLocaleString('pt-AO')} Kz
              </span>
            )}
          </div>
        </div>

        {/* Delivery */}
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mb-2">
          <Truck size={10} />
          {product.deliveryStatus || 'Rápida em Luanda (24-48h)'}
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart size={12} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
