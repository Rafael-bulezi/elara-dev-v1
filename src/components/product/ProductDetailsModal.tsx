import React from 'react';
import { X, ShoppingCart, Star, ShieldCheck, Zap, Package, Truck, MessageCircle, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';
import ProductGallery from './ProductGallery';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onContactSeller?: (sellerId: string, sellerName: string, sellerAvatar: string) => void;
  onViewSeller?: (sellerId: string) => void;
}

const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onBuyNow,
  onContactSeller,
  onViewSeller
}: ProductDetailsModalProps) => {
  if (!isOpen || !product) return null;

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const images = product.image ? [product.image] : [];

  const whatsappLink = product.sellerPhone
    ? `https://wa.me/${product.sellerPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(product.sellerName)}%2C%20vi%20o%20produto%20"${encodeURIComponent(product.title)}"%20na%20Elara.`
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[92vh] md:rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col overflow-hidden my-auto border border-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-md rounded-full text-zinc-500 hover:text-zinc-900 transition-all shadow-xl active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-[45%] p-4 md:p-6 bg-zinc-50">
              <div className="lg:sticky lg:top-6">
                <ProductGallery images={images} title={product.title} />
              </div>
            </div>

            <div className="flex-1 p-5 md:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg">
                  {product.category}
                </span>
                {product.verified && (
                  <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Verificado
                  </span>
                )}
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} className="fill-current" />
                  <span className="text-xs md:text-sm font-black text-zinc-900">{product.productRating || 4.5}</span>
                  <span className="text-[10px] md:text-sm font-bold text-zinc-400">({product.productReviews || 0} avaliações)</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 mb-4 md:mb-6 leading-tight tracking-tight">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap">
                <span className="text-3xl md:text-4xl font-black text-purple-600">
                  Kz {product.price.toLocaleString('pt-AO')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg md:text-xl text-zinc-400 line-through font-bold">
                      Kz {product.originalPrice.toLocaleString('pt-AO')}
                    </span>
                    <span className="bg-rose-500 text-white px-2 py-1 rounded-lg text-xs font-black">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-zinc-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100">
                  <div className="flex items-center gap-2 md:gap-3 text-zinc-500 mb-1">
                    <Package size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Condição</span>
                  </div>
                  <p className="text-xs md:text-base font-black">{product.condition || 'Novo'}</p>
                </div>
                <div className="bg-zinc-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100">
                  <div className="flex items-center gap-2 md:gap-3 text-zinc-500 mb-1">
                    <Truck size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Entrega</span>
                  </div>
                  <p className="text-xs md:text-base font-black">{product.deliveryStatus || '24-48h'}</p>
                </div>
                <div className="bg-zinc-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-zinc-100">
                  <div className="flex items-center gap-2 md:gap-3 text-zinc-500 mb-1">
                    <Zap size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Stock</span>
                  </div>
                  <p className="text-xs md:text-base font-black">{product.stock ?? 1} unidade{product.stock !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100 p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-3">Descrição</h3>
                <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
                  {product.description || 'Produto disponível na Elara. Entre em contacto com o vendedor para mais detalhes.'}
                </p>
              </div>

              <div
                onClick={() => onViewSeller?.(product.sellerId)}
                className="group bg-zinc-50 p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-zinc-100 mb-6 md:mb-8 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
                      alt={product.sellerName}
                      className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border-2 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 md:w-5 md:h-5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-black group-hover:text-purple-600 transition-colors">
                      {product.sellerName}
                    </h4>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-zinc-500">
                      <Star size={12} className="fill-amber-400 text-amber-400 md:w-3.5 md:h-3.5" />
                      <span className="font-bold">{product.sellerRating || 4.8}</span>
                      <span className="opacity-50">•</span>
                      <span className="font-bold">{product.sellerReviews || 0} vendas</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl text-zinc-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-all">
                  <User size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => onContactSeller?.(product.sellerId, product.sellerName, product.sellerAvatar)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
                >
                  <MessageCircle size={20} className="md:w-[22px] md:h-[22px]" />
                  <span className="text-sm md:text-base">Chat</span>
                </button>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3"
                  >
                    <Phone size={20} className="md:w-[22px] md:h-[22px]" />
                    <span className="text-sm md:text-base">WhatsApp</span>
                  </a>
                )}
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
                >
                  <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
                  <span className="text-sm md:text-base">Adicionar ao Carrinho</span>
                </button>
              </div>

              {onBuyNow && (
                <button
                  onClick={() => onBuyNow(product)}
                  className="w-full mt-3 md:mt-4 bg-zinc-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
                >
                  <CheckCircle2 size={20} className="md:w-[22px] md:h-[22px]" />
                  <span className="text-sm md:text-base">Comprar Agora</span>
                  <ArrowRight size={20} className="md:w-[22px] md:h-[22px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
