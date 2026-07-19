import React, { useState } from 'react';
import {
  ArrowLeft, ShoppingCart, Zap, MessageCircle, Heart, Star,
  ShieldCheck, Truck, Package, ChevronRight, Share2, RotateCcw, ChevronLeft
} from 'lucide-react';
import { Product } from '../types';
import { getAvatarUrl } from '../utils/avatar';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onContactSeller: (sellerId: string) => void;
  onViewSeller: (sellerId: string) => void;
  wishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product, onBack, onAddToCart, onBuyNow, onContactSeller, onViewSeller,
  wishlisted, onToggleWishlist,
}) => {
  const [mainImg, setMainImg] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const images = product.image ? [product.image, product.image, product.image] : [];
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const reviewCount = 418;
  const rating = product.sellerRating || 4.6;

  const whatsappLink = product.sellerPhone
    ? `https://wa.me/${product.sellerPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(product.sellerName)}%2C%20vi%20o%20produto%20"${encodeURIComponent(product.title)}"%20na%20Elara.`
    : null;

  const breadcrumbs = ['Início', product.category, product.title];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-purple-600 text-xs font-medium shrink-0">
            <ArrowLeft size={14} />
            Voltar
          </button>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700 shrink-0" />
              <span className={`text-xs shrink-0 ${i === breadcrumbs.length - 1 ? 'text-zinc-900 dark:text-white font-semibold truncate max-w-[200px]' : 'text-zinc-500 hover:text-purple-600 cursor-pointer font-medium'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Gallery ── */}
          <div className="lg:w-[44%] lg:sticky lg:top-24 lg:self-start">
            {/* Main image */}
            <div className="relative aspect-square bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden mb-3 border border-zinc-200 dark:border-zinc-800">
              {discount && (
                <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                  -{discount}%
                </span>
              )}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  wishlisted ? 'bg-rose-500 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-rose-500'
                }`}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className="absolute top-3 right-14 z-10 w-9 h-9 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg text-zinc-500 hover:text-zinc-800">
                <Share2 size={16} />
              </button>
              <img
                src={images[mainImg] || 'https://placehold.co/600x600?text=Elara'}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
              {/* Prev/next arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setMainImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow flex items-center justify-center text-zinc-600 hover:bg-white">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setMainImg(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow flex items-center justify-center text-zinc-600 hover:bg-white">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    mainImg === i ? 'border-purple-500' : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300'
                  }`}
                >
                  <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="flex-1 min-w-0">
            {/* Brand / badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg uppercase tracking-wide">
                {product.category}
              </span>
              {product.condition && (
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                  {product.condition}
                </span>
              )}
              {product.isImport && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                  Importado
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-3">
              {product.title}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'} />
                ))}
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">{Number(rating).toFixed(1)}</span>
              </div>
              <span className="text-sm text-zinc-500">({reviewCount} avaliações)</span>
              <span className="text-sm font-semibold text-emerald-600">• Em stock</span>
            </div>

            {/* Price */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 mb-5">
              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <span className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white">
                  {product.price.toLocaleString('pt-AO')} Kz
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-zinc-400 line-through">
                    {product.originalPrice.toLocaleString('pt-AO')} Kz
                  </span>
                )}
              </div>
              {discount && (
                <p className="text-sm text-emerald-600 font-bold">
                  Poupa {(product.originalPrice! - product.price).toLocaleString('pt-AO')} Kz ({discount}% de desconto)
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-1">Em até 3× de {Math.round(product.price / 3).toLocaleString('pt-AO')} Kz sem juros</p>
            </div>

            {/* Delivery */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Truck size={16} className="text-emerald-600 shrink-0" />
                <span className="font-semibold text-zinc-900 dark:text-white">Entrega rápida em Luanda (24-48h)</span>
                <span className="text-emerald-600 font-bold ml-auto">Kz 1.500</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-blue-500 shrink-0" />
                <span className="text-zinc-500">Províncias (1-5 dias úteis)</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold ml-auto">Kz 2.500</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw size={16} className="text-zinc-400 shrink-0" />
                <span className="text-zinc-500">7 dias para devolver</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                <ShoppingCart size={18} />
                Adicionar ao Carrinho
              </button>
              <button
                onClick={() => onBuyNow(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-3.5 rounded-xl text-sm transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                <Zap size={18} />
                Comprar Agora
              </button>
            </div>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold py-3 rounded-xl text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors mb-5"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            )}

            {/* Seller card */}
            <div
              onClick={() => onViewSeller(product.sellerId)}
              className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-purple-300 transition-colors mb-4"
            >
              <img
                src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
                alt={product.sellerName}
                className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{product.sellerName}</p>
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-xs text-zinc-500">Vendedor verificado · Ver loja</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onContactSeller(product.sellerId); }}
                className="shrink-0 flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <MessageCircle size={13} />
                Chat
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: ShieldCheck, label: 'Pagamento seguro', sub: '100% protegido' },
                { icon: Package, label: 'Suporte dedicado', sub: 'Estamos aqui para ajudar' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Icon size={18} className="text-purple-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">{label}</p>
                    <p className="text-[10px] text-zinc-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {[
              { key: 'desc', label: 'Descrição' },
              { key: 'specs', label: 'Especificações' },
              { key: 'reviews', label: `Avaliações (${reviewCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5 md:p-8">
            {activeTab === 'desc' && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
                <p>{product.description || `${product.title} — disponível na Elara com entrega rápida para toda Angola.`}</p>
                <p>Produto original com garantia de qualidade. Compre com confiança na maior marketplace angolana.</p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="space-y-2">
                {[
                  ['Categoria', product.category],
                  ['Condição', product.condition || 'Novo'],
                  ['Vendedor', product.sellerName],
                  ['Disponibilidade', 'Em stock'],
                  ['Importado', product.isImport ? 'Sim' : 'Não'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 w-32 shrink-0">{label}</span>
                    <span className="text-xs text-zinc-900 dark:text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-zinc-900 dark:text-white">{Number(rating).toFixed(1)}</div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={18} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'} />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-500">{reviewCount} avaliações</p>
                  </div>
                </div>
                <div className="text-sm text-zinc-500 italic">Em breve: ver todas as avaliações dos compradores</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
