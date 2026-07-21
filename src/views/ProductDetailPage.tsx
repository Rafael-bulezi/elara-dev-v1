import React, { useState } from 'react';
import {
  ArrowLeft, ShoppingCart, Zap, MessageCircle, Heart, Star,
  ShieldCheck, Truck, ChevronRight, Share2, RotateCcw,
  ChevronLeft, CheckCircle, MapPin, Clock,
} from 'lucide-react';
import { Product } from '../types';
import { getAvatarUrl } from '../utils/avatar';
import { mediumUrl, thumbUrl } from '../lib/imageUtils';

interface ProductDetailPageProps {
  product: Product;
  products?: Product[];
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onContactSeller: (sellerId: string) => void;
  onViewSeller: (sellerId: string) => void;
  wishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onProductClick?: (p: Product) => void;
  wishlist?: string[];
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product, products = [], onBack, onAddToCart, onBuyNow, onContactSeller, onViewSeller,
  wishlisted, onToggleWishlist, onProductClick, wishlist = [],
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [copied, setCopied] = useState(false);

  const images = [product.image, product.image, product.image, product.image].filter(Boolean);
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const rating = product.productRating || product.sellerRating || 4.6;
  const reviewCount = product.productReviews || 418;
  const installment = Math.round(product.price / 3);

  const whatsappLink = product.sellerPhone
    ? `https://wa.me/${product.sellerPhone.replace(/\D/g, '')}?text=Olá%20vi%20o%20produto%20"${encodeURIComponent(product.title)}"%20na%20Elara`
    : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sameCat = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 6);
  const trending = products.filter(p => p.id !== product.id && p.emPromocao).slice(0, 6);
  const recsA = sameCat.length >= 3 ? sameCat : products.filter(p => p.id !== product.id).slice(0, 6);
  const recsB = trending.length >= 3 ? trending : products.filter(p => p.id !== product.id && p.id !== recsA[0]?.id).slice(6, 12);

  return (
    /* Extra bottom padding so mobile sticky CTA doesn't overlap last content */
    <div className="min-h-screen bg-zinc-50 pb-24 md:pb-0">

      {/* ── Breadcrumb (desktop only — avoids mobile clutter) ── */}
      <div className="hidden md:block bg-white border-b border-zinc-100">
        <div className="max-w-[1400px] mx-auto px-8 py-2 flex items-center gap-1.5">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-400 hover:text-purple-600 text-xs font-medium shrink-0 transition-colors">
            <ArrowLeft size={13} /> Voltar
          </button>
          {[product.category, product.title].map((crumb, i, arr) => (
            <React.Fragment key={i}>
              <ChevronRight size={11} className="text-zinc-300 shrink-0" />
              <span className={`text-xs shrink-0 transition-colors ${i === arr.length - 1 ? 'text-zinc-800 font-semibold truncate max-w-[260px]' : 'text-zinc-400 hover:text-purple-600 cursor-pointer'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Mobile header bar ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100 sticky top-0 z-30">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200">
          <ArrowLeft size={18} />
        </button>
        <p className="text-sm font-bold text-zinc-800 truncate mx-3 flex-1 text-center">{product.category}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleWishlist(product)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${wishlisted ? 'bg-rose-100 text-rose-500' : 'bg-zinc-100 text-zinc-500'}`}>
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleShare} className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 active:bg-zinc-200">
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1400px] mx-auto px-0 md:px-8 py-0 md:py-5">
        <div className="flex flex-col lg:flex-row gap-0 md:gap-6 xl:gap-10">

          {/* ── Gallery ── */}
          <div className="lg:w-[42%] lg:sticky lg:top-20 lg:self-start">
            {/* Main image */}
            <div className="relative bg-white overflow-hidden md:rounded-2xl md:border md:border-zinc-100 aspect-square max-h-[380px] md:max-h-[440px]">
              {discount && (
                <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">-{discount}%</span>
              )}
              {product.isImport && (
                <span className={`absolute ${discount ? 'top-11' : 'top-3'} left-3 z-10 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>IMPORT</span>
              )}

              {/* Desktop share/wishlist overlay */}
              <div className="hidden md:flex absolute top-2 right-2 z-10 flex-col gap-1.5">
                <button onClick={() => onToggleWishlist(product)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-rose-500 text-white' : 'bg-white text-zinc-400 hover:text-rose-400'}`}>
                  <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-zinc-700 transition-colors">
                  {copied ? <CheckCircle size={15} className="text-green-500" /> : <Share2 size={15} />}
                </button>
              </div>

              <img src={mediumUrl(images[activeImg])} alt={product.title} loading="lazy" decoding="async"
                className="w-full h-full object-contain p-3 md:p-4" />

              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow text-zinc-600 active:bg-white">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow text-zinc-600 active:bg-white">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Dot indicators (mobile) */}
              <div className="md:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-purple-600 w-4' : 'bg-zinc-300'}`} />
                ))}
              </div>
            </div>

            {/* Thumbnails (desktop only) */}
            <div className="hidden md:flex gap-2 mt-2.5 overflow-x-auto custom-scrollbar pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-purple-600 shadow-sm shadow-purple-200' : 'border-zinc-200 hover:border-zinc-400'}`}>
                  <img src={thumbUrl(img)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="lg:flex-1 px-4 md:px-0 pt-4 md:pt-0 space-y-4">

            {/* Title */}
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">{product.title}</h1>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">SKU: ELARA-{product.id?.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'} />
                ))}
                <span className="text-sm font-black text-zinc-900 ml-1">{Number(rating).toFixed(1)}</span>
              </div>
              <span className="text-xs text-zinc-400">({reviewCount} avaliações)</span>
              {product.verified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Verificado
                </span>
              )}
            </div>

            {/* Price */}
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl font-black text-zinc-900">
                  Kz {(product.price * qty).toLocaleString('pt-AO')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-zinc-400 line-through font-medium">
                    Kz {(product.originalPrice * qty).toLocaleString('pt-AO')}
                  </span>
                )}
                {discount && (
                  <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-0.5 rounded-full">
                    Poupa {discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1.5">
                Em até 3x de <span className="font-bold text-purple-700">Kz {installment.toLocaleString('pt-AO')}</span> sem juros
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-zinc-700">Quantidade:</span>
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200 transition-colors font-black text-lg">−</button>
                <span className="w-10 text-center font-black text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200 transition-colors font-black text-lg">+</button>
              </div>
              {product.stock && product.stock <= 5 && (
                <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">Apenas {product.stock} restantes</span>
              )}
            </div>

            {/* CTA buttons — desktop only (mobile gets sticky footer) */}
            <div className="hidden md:flex gap-3">
              <button onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-700 font-black text-sm py-3.5 rounded-xl hover:bg-purple-50 transition-colors">
                <ShoppingCart size={17} /> Adicionar ao Carrinho
              </button>
              <button onClick={() => onBuyNow(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm py-3.5 rounded-xl transition-colors shadow-lg shadow-purple-200">
                <Zap size={17} /> Comprar Agora
              </button>
            </div>

            {/* WhatsApp */}
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors w-full">
                <MessageCircle size={16} /> Falar com o Vendedor no WhatsApp
              </a>
            )}

            {/* Delivery options */}
            <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden">
              {[
                { icon: <Zap size={14} className="text-purple-600" />, bg: 'bg-purple-100', title: 'Rápida em Luanda', sub: 'Entrega em 24–48h · Kz 1.500' },
                { icon: <Truck size={14} className="text-zinc-500" />, bg: 'bg-zinc-100', title: 'Províncias', sub: 'Entrega em 2–5 dias úteis · Kz 2.500' },
                { icon: <MapPin size={14} className="text-zinc-500" />, bg: 'bg-zinc-100', title: 'Recolha na Loja', sub: 'Disponível em Luanda · Grátis' },
              ].map(d => (
                <div key={d.title} className="flex items-start gap-3 p-3.5">
                  <div className={`w-8 h-8 ${d.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>{d.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{d.title}</p>
                    <p className="text-xs text-zinc-500">{d.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Return policy */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <RotateCcw size={13} className="text-zinc-400 shrink-0" />
              <span>7 dias para devolver · Produto 100% protegido</span>
            </div>

            {/* Seller card */}
            <div className="border border-zinc-200 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Vendedor</p>
              <div className="flex items-center gap-3">
                <button onClick={() => onViewSeller(product.sellerId)} className="shrink-0">
                  <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
                    alt={product.sellerName} className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => onViewSeller(product.sellerId)}
                    className="font-black text-sm text-zinc-900 hover:text-purple-600 transition-colors truncate block">
                    {product.sellerName}
                  </button>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-zinc-500">{Number(product.sellerRating || 4.8).toFixed(1)}</span>
                    {product.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold ml-1">
                        <CheckCircle size={9} /> Verificado
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => onContactSeller(product.sellerId)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 active:bg-purple-100 transition-colors">
                  <MessageCircle size={12} /> Mensagem
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <ShieldCheck size={16} className="text-purple-600" />, label: 'Pagamento seguro', sub: '100% protegido' },
                { icon: <Clock size={16} className="text-purple-600" />, label: 'Suporte dedicado', sub: 'Estamos aqui para ajudar' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2.5 bg-white border border-zinc-100 rounded-xl p-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">{b.icon}</div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-800">{b.label}</p>
                    <p className="text-[10px] text-zinc-400">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Description / Specs / Reviews tabs ── */}
        <div className="mt-6 mx-4 md:mx-0 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="flex border-b border-zinc-100 overflow-x-auto">
            {([['desc', 'Descrição'], ['specs', 'Especificações'], ['reviews', 'Avaliações']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setActiveTab(k)}
                className={`flex-1 min-w-[100px] py-3.5 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === k ? 'text-purple-600 border-b-2 border-purple-600' : 'text-zinc-500 hover:text-zinc-800'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-4 md:p-6">
            {activeTab === 'desc' && (
              <p className="text-sm text-zinc-600 leading-relaxed">
                {product.description || `${product.title} — produto de alta qualidade disponível na Elara com entrega rápida para toda Angola. Compre com confiança com pagamento seguro e política de devolução de 7 dias.`}
              </p>
            )}
            {activeTab === 'specs' && (
              <div className="divide-y divide-zinc-100">
                {[
                  ['Categoria', product.category],
                  ['Condição', product.condition || 'Novo'],
                  ['Vendedor', product.sellerName],
                  ['Disponibilidade', 'Em stock'],
                  ['Origem', product.isImport ? 'Importado' : 'Local'],
                ].map(([l, v]) => (
                  <div key={l} className="flex py-2.5 text-sm">
                    <span className="w-32 text-zinc-500 font-medium shrink-0">{l}</span>
                    <span className="text-zinc-900 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="text-center shrink-0">
                    <div className="text-5xl font-black text-zinc-900">{Number(rating).toFixed(1)}</div>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />)}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{reviewCount}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(n => {
                      const pct = n === 5 ? 68 : n === 4 ? 20 : n === 3 ? 7 : n === 2 ? 3 : 2;
                      return (
                        <div key={n} className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="w-3 shrink-0">{n}</span>
                          <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center py-4 text-sm text-zinc-400 border-t border-zinc-100">
                  As avaliações verificadas aparecem após a confirmação da entrega.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="px-4 md:px-0">
          <RecsSection title={`Mais em ${product.category}`} subtitle="Produtos semelhantes"
            products={recsA} wishlist={wishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} />
          {recsB.length > 0 && (
            <RecsSection title="Também pode gostar" subtitle="Escolhas populares na Elara"
              products={recsB} wishlist={wishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} />
          )}
        </div>
      </div>

      {/* ── Mobile sticky bottom CTA ── */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-700 font-black text-sm py-3 rounded-xl active:bg-purple-50 transition-colors">
          <ShoppingCart size={16} /> ao Carrinho
        </button>
        <button onClick={() => onBuyNow(product)}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-600 active:bg-purple-700 text-white font-black text-sm py-3 rounded-xl transition-colors shadow-lg shadow-purple-200">
          <Zap size={16} /> Comprar Agora
        </button>
      </div>
    </div>
  );
};

// ── Reusable recommendations section ──
interface RecsSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  wishlist: string[];
  onProductClick?: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

const RecsSection: React.FC<RecsSectionProps> = ({ title, subtitle, products, wishlist, onProductClick, onAddToCart }) => {
  if (products.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-base font-black text-zinc-900">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-x-visible custom-scrollbar">
        {products.map(p => {
          const disc = p.originalPrice && p.originalPrice > p.price
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
          return (
            <div key={p.id}
              className="shrink-0 w-[140px] md:w-auto group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer"
              onClick={() => onProductClick?.(p)}>
              <div className="aspect-square bg-zinc-50 overflow-hidden relative">
                <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                {disc && <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">-{disc}%</span>}
                {wishlist.includes(p.id) && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                    <Heart size={10} className="text-rose-500 fill-rose-500" />
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-zinc-700 font-semibold line-clamp-2 leading-tight mb-1.5">{p.title}</p>
                <p className="text-sm font-black text-zinc-900">{p.price.toLocaleString('pt-AO')} Kz</p>
                {p.originalPrice && p.originalPrice > p.price && (
                  <p className="text-[10px] text-zinc-400 line-through">{p.originalPrice.toLocaleString('pt-AO')} Kz</p>
                )}
                <div role="button" tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
                  onKeyDown={(e) => e.key === 'Enter' && onAddToCart(p)}
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors text-center select-none">
                  Adicionar
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductDetailPage;
