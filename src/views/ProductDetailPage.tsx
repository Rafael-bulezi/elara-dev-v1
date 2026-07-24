import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ShoppingCart, Zap, MessageCircle, Heart, Star,
  ShieldCheck, Truck, ChevronRight, Share2, RotateCcw,
  ChevronLeft, CheckCircle, MapPin, Clock, Package, Tag, X,
  Phone, Info, ExternalLink, Award,
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
  navVisible?: boolean;
}

/* ── Mock reviews ── */
const MOCK_REVIEWS = [
  { name: 'Ana Ferreira',   date: 'Jun 2026', rating: 5, title: 'Excelente produto!',       body: 'Chegou rápido e em perfeito estado. Qualidade muito boa, recomendo a todos.' },
  { name: 'Domingos Neto',  date: 'Mai 2026', rating: 4, title: 'Boa compra',               body: 'Produto conforme descrito. Entrega demorou um dia a mais, mas valeu a pena.' },
  { name: 'Carla Mendes',   date: 'Abr 2026', rating: 5, title: 'Superou as expectativas',  body: 'Muito melhor do que esperava. Já comprei dois e vou comprar mais.' },
  { name: 'Paulo Baptista', date: 'Mar 2026', rating: 3, title: 'Produto ok, entrega lenta', body: 'O produto é bom mas a entrega demorou mais do que o previsto.' },
  { name: 'Luísa Tavares',  date: 'Mar 2026', rating: 5, title: 'Perfeito!',                body: 'Adorei! Embalagem cuidada e produto de alta qualidade. 10/10.' },
];

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product, products = [], onBack, onAddToCart, onBuyNow, onContactSeller, onViewSeller,
  wishlisted, onToggleWishlist, onProductClick, wishlist = [], navVisible = true,
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [copied, setCopied] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [offerSent, setOfferSent] = useState(false);
  const [isSellerHovered, setIsSellerHovered] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Reset to first image when product changes
  useEffect(() => { setActiveImg(0); setQty(1); }, [product.id]);

  // We have only one real image per mock product; repeat it for the gallery strip
  const images = Array.from({ length: 4 }, () => product.image);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const rating = product.productRating || product.sellerRating || 4.6;
  const reviewCount = product.productReviews || MOCK_REVIEWS.length;
  const installment = Math.round(product.price / 3);

  const whatsappLink = product.sellerPhone
    ? `https://wa.me/${product.sellerPhone.replace(/\D/g, '')}?text=Olá%20vi%20o%20produto%20"${encodeURIComponent(product.title)}"%20na%20Elara`
    : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Touch swipe for mobile gallery
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setActiveImg(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
    touchStartX.current = null;
  };

  const sameCat = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 8);
  const trending = products.filter(p => p.id !== product.id && p.emPromocao).slice(0, 8);
  const recsA = sameCat.length >= 3 ? sameCat : products.filter(p => p.id !== product.id).slice(0, 8);
  const recsB = trending.length >= 3 ? trending : products.filter(p => p.id !== product.id).slice(8, 16);

  /* ── Shared buy-panel content (used in both desktop sidebar and mobile footer) ── */
  const BuyActions = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-1 sm:grid-cols-3 gap-2.5'}>
      <button
        onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product); }}
        className="flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-700 font-black text-xs sm:text-sm py-3 rounded-xl hover:bg-purple-50 active:bg-purple-100 transition-colors">
        <ShoppingCart size={16} /> <span>{compact ? 'Carrinho' : 'Ao Carrinho'}</span>
      </button>
      <button
        onClick={() => setShowOfferModal(true)}
        className="flex items-center justify-center gap-2 border-2 border-amber-400 text-amber-700 font-black text-xs sm:text-sm py-3 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-colors">
        <Tag size={16} /> <span>Fazer Proposta</span>
      </button>
      <button
        onClick={() => onBuyNow(product)}
        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-xs sm:text-sm py-3 rounded-xl transition-colors shadow-lg shadow-purple-200">
        <Zap size={16} /> <span>Comprar</span>
      </button>
    </div>
  );

  /* ── Tabs: Description / Specs / Reviews subcomponent ── */
  const ProductTabs = () => (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-zinc-100 overflow-x-auto">
        {([['desc', 'Descrição'], ['specs', 'Especificações'], ['reviews', 'Avaliações']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`flex-1 min-w-[100px] py-3.5 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === k ? 'text-purple-600 border-b-2 border-purple-600' : 'text-zinc-400 hover:text-zinc-700'}`}>
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
              ['Categoria',      product.category],
              ['Condição',       product.condition || 'Novo'],
              ['Vendedor',       product.sellerName],
              ['Disponibilidade','Em stock'],
              ['Origem',         product.isImport ? 'Importado' : 'Local'],
              ['SKU',            `ELARA-${product.id?.toString().padStart(6, '0').toUpperCase()}`],
            ].map(([l, v]) => (
              <div key={l} className="flex py-2.5 text-sm">
                <span className="w-32 md:w-36 text-zinc-400 font-medium shrink-0">{l}</span>
                <span className="text-zinc-900 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {/* Summary row */}
            <div className="flex items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-zinc-100">
              <div className="text-center shrink-0">
                <div className="text-4xl md:text-5xl font-black text-zinc-900">{Number(rating).toFixed(1)}</div>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{reviewCount} avaliações</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(n => {
                  const pct = n === 5 ? 68 : n === 4 ? 20 : n === 3 ? 7 : n === 2 ? 3 : 2;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="w-3 shrink-0 text-right">{n}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right shrink-0 tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual reviews */}
            <div className="space-y-5">
              {MOCK_REVIEWS.map((r, i) => (
                <div key={i} className="border-b border-zinc-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-black text-purple-700">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-zinc-900">{r.name}</p>
                        <p className="text-[10px] text-zinc-400">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />)}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-zinc-800 mb-0.5">{r.title}</p>
                  <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">{r.body}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle size={9} /> Compra verificada
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-28 md:pb-12">



      {/* ── Desktop breadcrumb ── */}
      <div className="hidden md:block bg-white border-b border-zinc-100">
        <div className="max-w-[1400px] mx-auto px-8 py-2.5 flex items-center gap-1.5">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-400 hover:text-purple-600 text-xs font-medium shrink-0 transition-colors">
            <ArrowLeft size={13} /> Voltar
          </button>
          {[product.category, product.title].map((crumb, i, arr) => (
            <React.Fragment key={i}>
              <ChevronRight size={11} className="text-zinc-300 shrink-0" />
              <span className={`text-xs shrink-0 transition-colors ${i === arr.length - 1 ? 'text-zinc-800 font-semibold truncate max-w-[300px]' : 'text-zinc-400 hover:text-purple-600 cursor-pointer'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-[1400px] mx-auto px-0 md:px-8 py-0 md:py-6">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 xl:gap-10 items-start">

          {/* ═══════════════════════════════════
              LEFT COL: Gallery + Tabs (Desktop)
          ═══════════════════════════════════ */}
          <div className="lg:w-[50%] xl:w-[52%] space-y-6 w-full">

            {/* Gallery container */}
            <div className="flex flex-col md:flex-row gap-0 md:gap-3">

              {/* Vertical thumb strip — desktop only */}
              <div className="hidden md:flex flex-col gap-2 shrink-0">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${i === activeImg ? 'border-purple-600 shadow-sm shadow-purple-200' : 'border-zinc-200 hover:border-zinc-400'}`}>
                    <img src={thumbUrl(img)} alt="" loading="lazy" decoding="async"
                      className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="relative flex-1 bg-white md:rounded-2xl overflow-hidden shadow-sm border border-zinc-100"
                style={{ aspectRatio: '1 / 1', maxHeight: 'min(480px, calc(100vh - 160px))' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}>

                {/* Badges */}
                {discount && (
                  <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
                    -{discount}%
                  </span>
                )}
                {product.isImport && (
                  <span className={`absolute ${discount ? 'top-12' : 'top-3'} left-3 z-10 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                    IMPORT
                  </span>
                )}

                {/* Desktop action buttons */}
                <div className="hidden md:flex absolute top-3 right-3 z-10 flex-col gap-1.5">
                  <button onClick={() => onToggleWishlist(product)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-rose-500 text-white' : 'bg-white text-zinc-400 hover:text-rose-400'}`}>
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleShare}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-zinc-700 transition-colors">
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} />}
                  </button>
                </div>

                {/* Sliding Image Carousel */}
                <div 
                  className="flex w-full h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeImg * 100}%)` }}
                >
                  {images.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0">
                      <img
                        src={mediumUrl(img)}
                        alt={`${product.title} ${idx + 1}`}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Prev / Next arrows */}
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow text-zinc-600 hover:bg-white active:bg-zinc-100 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow text-zinc-600 hover:bg-white active:bg-zinc-100 transition-colors">
                  <ChevronRight size={18} />
                </button>

                {/* Mobile dot indicators */}
                <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-purple-600 w-5' : 'bg-zinc-300 w-1.5'}`} />
                  ))}
                </div>
              </div>

              {/* Horizontal thumb strip — mobile only */}
              <div className="md:hidden flex gap-2 px-4 mt-3 overflow-x-auto custom-scrollbar pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-purple-600 shadow-sm shadow-purple-200' : 'border-zinc-200 hover:border-zinc-400'}`}>
                    <img src={thumbUrl(img)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tabs directly under Gallery on Left Column — Fills empty space! */}
            <div className="hidden md:block">
              <ProductTabs />
            </div>
          </div>

          {/* ═══════════════════════════════════
              RIGHT COL (Info + Buy Box + Delivery + Seller)
          ═══════════════════════════════════ */}
          <div className="lg:flex-1 px-4 md:px-0 pt-5 md:pt-0 space-y-4 w-full">

            {/* Title block */}
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{product.category}</p>
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">{product.title}</h1>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">SKU: ELARA-{product.id?.toString().padStart(6, '0').toUpperCase()}</p>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'} />
                ))}
                <span className="text-sm font-black text-zinc-900 ml-1.5">{Number(rating).toFixed(1)}</span>
              </div>
              <button className="text-xs text-zinc-400 hover:text-purple-600 underline transition-colors" onClick={() => setActiveTab('reviews')}>
                ({reviewCount} avaliações)
              </button>
              {product.verified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Verificado
                </span>
              )}
              {product.condition && (
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{product.condition}</span>
              )}
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-3.5">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                  Kz {(product.price * qty).toLocaleString('pt-AO')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-zinc-400 line-through font-medium mb-0.5">
                    Kz {(product.originalPrice * qty).toLocaleString('pt-AO')}
                  </span>
                )}
                {discount && (
                  <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-0.5 rounded-full mb-0.5">
                    Poupa {discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Em até 3x de <span className="font-bold text-purple-700">Kz {installment.toLocaleString('pt-AO')}</span> sem juros
              </p>
            </div>

            {/* Variations / specs selector */}
            <VariationsSelector category={product.category} selected={selectedVariations} onChange={setSelectedVariations} />

            {/* Quantity */}
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs font-bold text-zinc-700">Quantidade:</span>
              <div className="flex items-center border-2 border-zinc-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-lg font-black select-none">−</button>
                <span className="w-9 text-center font-black text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-lg font-black select-none">+</button>
              </div>
              {product.stock != null && product.stock <= 5 && (
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  Apenas {product.stock} restantes
                </span>
              )}
            </div>

            {/* CTA Buttons — Prominent and immediately visible from the get go! */}
            <div className="hidden md:block space-y-2.5 pt-1">
              <BuyActions />
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl transition-colors w-full">
                  <MessageCircle size={15} /> Falar com o Vendedor no WhatsApp
                </a>
              )}
            </div>

            {/* Delivery */}
            <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-100 overflow-hidden bg-white">
              {[
                { icon: <Zap size={14} className="text-purple-600" />,   bg: 'bg-purple-50',  title: 'Rápida em Luanda',  sub: 'Entrega em 24–48h · Kz 1.500' },
                { icon: <Truck size={14} className="text-blue-500" />,    bg: 'bg-blue-50',    title: 'Províncias',        sub: 'Entrega em 2–5 dias úteis · Kz 2.500' },
                { icon: <MapPin size={14} className="text-zinc-500" />,   bg: 'bg-zinc-100',   title: 'Recolha na Loja',   sub: 'Disponível em Luanda · Grátis' },
              ].map(d => (
                <div key={d.title} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`w-7 h-7 ${d.bg} rounded-lg flex items-center justify-center shrink-0`}>{d.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{d.title}</p>
                    <p className="text-[11px] text-zinc-400">{d.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Return */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <RotateCcw size={12} className="text-zinc-400 shrink-0" />
              <span>7 dias para devolver · Produto 100% protegido</span>
            </div>

            {/* Seller Section with Desktop Hover Popover & Mobile Modal */}
            <div 
              className="relative border border-zinc-200 rounded-2xl p-3.5 bg-white transition-all hover:border-purple-200 hover:shadow-md"
              onMouseEnter={() => setIsSellerHovered(true)}
              onMouseLeave={() => setIsSellerHovered(false)}
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Vendedor</p>
                <button 
                  onClick={() => setShowSellerModal(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors"
                  title="Ver informações detalhadas do vendedor"
                >
                  <Info size={12} />
                  <span>Ver Informações</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => onViewSeller(product.sellerId)} className="shrink-0 relative group">
                  <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
                    alt={product.sellerName} className="w-11 h-11 rounded-full object-cover border border-zinc-200 group-hover:scale-105 transition-transform" />
                  {product.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white" title="Vendedor Verificado">
                      <CheckCircle size={10} />
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => onViewSeller(product.sellerId)}
                    className="font-black text-sm text-zinc-900 hover:text-purple-600 transition-colors truncate block text-left">
                    {product.sellerName}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star size={11} className="fill-amber-400" />
                      {Number(product.sellerRating || 4.8).toFixed(1)}
                    </span>
                    <span>·</span>
                    <span className="truncate">{product.sellerPhone || '923 000 000'}</span>
                  </div>
                </div>
                <button onClick={() => onContactSeller(product.sellerId)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-purple-600 border border-purple-200 px-3 py-2 rounded-xl hover:bg-purple-50 active:scale-95 transition-all">
                  <MessageCircle size={13} /> Mensagem
                </button>
              </div>

              {/* ── Desktop Hover Card Popover ── */}
              {isSellerHovered && (
                <div className="hidden md:block absolute bottom-full left-0 mb-3 w-80 bg-white/95 backdrop-blur-xl border border-purple-100 rounded-3xl p-5 shadow-[0_20px_50px_rgba(120,40,200,0.15)] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)}
                        alt={product.sellerName} className="w-12 h-12 rounded-full object-cover border-2 border-purple-100" />
                      <div>
                        <h4 className="font-black text-sm text-zinc-900 leading-tight">{product.sellerName}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {product.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle size={10} /> Vendedor Verificado
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400">Membro Elara</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-zinc-50 rounded-2xl text-center">
                    <div>
                      <p className="text-xs font-black text-zinc-900 flex items-center justify-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        {Number(product.sellerRating || 4.8).toFixed(1)} / 5.0
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold">Classificação</p>
                    </div>
                    <div className="border-l border-zinc-200">
                      <p className="text-xs font-black text-zinc-900 flex items-center justify-center gap-1">
                        <Award size={12} className="text-purple-600" />
                        128+
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold">Vendas concluídas</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600 mb-4">
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                      <span className="flex items-center gap-1.5 text-zinc-500"><Phone size={13} className="text-purple-500" /> Telefone / WhatsApp</span>
                      <a href={`tel:${product.sellerPhone || '923000000'}`} className="font-black text-purple-700 hover:underline">
                        {product.sellerPhone || '923 000 000'}
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                      <span className="flex items-center gap-1.5 text-zinc-500"><MapPin size={13} className="text-purple-500" /> Localização</span>
                      <span className="font-bold text-zinc-800">Luanda, Angola</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-1.5 text-zinc-500"><Clock size={13} className="text-purple-500" /> Tempo de resposta</span>
                      <span className="font-bold text-emerald-600">Rápido (&lt; 30 min)</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => onViewSeller(product.sellerId)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Ver Perfil</span>
                      <ExternalLink size={12} />
                    </button>
                    <button 
                      onClick={() => onContactSeller(product.sellerId)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageCircle size={12} />
                      <span>Mensagem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <ShieldCheck size={15} className="text-purple-600" />, label: 'Pagamento seguro',   sub: '100% protegido' },
                { icon: <Package size={15} className="text-purple-600" />,     label: 'Compra garantida',   sub: 'Devolução de 7 dias' },
                { icon: <Clock size={15} className="text-purple-600" />,       label: 'Suporte 24/7',       sub: 'Estamos aqui' },
                { icon: <Truck size={15} className="text-purple-600" />,       label: 'Entrega rápida',     sub: 'Luanda em 24–48h' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2.5 bg-white border border-zinc-100 rounded-xl p-2.5">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">{b.icon}</div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-800">{b.label}</p>
                    <p className="text-[10px] text-zinc-400">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Tabs — shown below Info block on mobile */}
        <div className="md:hidden mt-6 mx-4">
          <ProductTabs />
        </div>

        {/* ── Recommendations ── */}
        <div className="px-4 md:px-0 mt-2">
          <RecsSection title={`Mais em ${product.category}`} subtitle="Produtos semelhantes"
            products={recsA} wishlist={wishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} />
          {recsB.length > 0 && (
            <RecsSection title="Também pode gostar" subtitle="Escolhas populares na Elara"
              products={recsB} wishlist={wishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} />
          )}
        </div>
      </div>



      {/* ── Make offer modal ── */}
      {showOfferModal && (
        <MakeOfferModal
          product={product}
          initialAmount={Math.round(product.price * 0.85)}
          onClose={() => { setShowOfferModal(false); setOfferSent(false); setOfferAmount(''); setOfferNote(''); }}
          onSubmit={(amount, note) => {
            setOfferSent(true);
            setTimeout(() => setShowOfferModal(false), 1800);
          }}
          offerSent={offerSent}
          offerAmount={offerAmount}
          setOfferAmount={setOfferAmount}
          offerNote={offerNote}
          setOfferNote={setOfferNote}
        />
      )}

      {/* ── Seller Info Modal (Mobile & Click) ── */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <Info size={18} className="text-purple-600" />
                Informações do Vendedor
              </h3>
              <button onClick={() => setShowSellerModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)} alt={product.sellerName} className="w-14 h-14 rounded-full object-cover border-2 border-purple-100" />
              <div>
                <h4 className="font-black text-base text-zinc-900">{product.sellerName}</h4>
                {product.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
                    <CheckCircle size={12} /> Vendedor Verificado
                  </span>
                ) : (
                  <span className="text-xs text-zinc-400">Membro verificado Elara</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 rounded-2xl text-center mb-4">
              <div>
                <p className="text-sm font-black text-zinc-900 flex items-center justify-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {Number(product.sellerRating || 4.8).toFixed(1)} / 5.0
                </p>
                <p className="text-xs text-zinc-500 font-bold mt-0.5">Avaliações dos Clientes</p>
              </div>
              <div className="border-l border-zinc-200">
                <p className="text-sm font-black text-zinc-900 flex items-center justify-center gap-1">
                  <Award size={14} className="text-purple-600" />
                  128+
                </p>
                <p className="text-xs text-zinc-500 font-bold mt-0.5">Vendas Concluídas</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-600 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="flex items-center gap-2 font-bold text-zinc-500"><Phone size={14} className="text-purple-500" /> Contacto Principal</span>
                <a href={`tel:${product.sellerPhone || '923000000'}`} className="font-black text-purple-700 text-sm hover:underline">
                  {product.sellerPhone || '923 000 000'}
                </a>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="flex items-center gap-2 font-bold text-zinc-500"><MapPin size={14} className="text-purple-500" /> Localização</span>
                <span className="font-bold text-zinc-800 text-sm">Luanda, Angola</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="flex items-center gap-2 font-bold text-zinc-500"><Clock size={14} className="text-purple-500" /> Resposta Média</span>
                <span className="font-bold text-emerald-600 text-xs">Habitualmente &lt; 30 min</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowSellerModal(false); onViewSeller(product.sellerId); }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-200"
              >
                <span>Ver Perfil Completo</span>
                <ExternalLink size={14} />
              </button>
              <button 
                onClick={() => { setShowSellerModal(false); onContactSeller(product.sellerId); }}
                className="flex-1 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-800 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle size={14} />
                <span>Mensagem</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return to top ── */}
      <ReturnToTop />
    </div>
  );
};

/* ── Variations / specs selector (colour, size, storage, etc.) ── */
interface VariationsSelectorProps {
  category: string;
  selected: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

const VARIATION_MAP: Record<string, { label: string; options: string[] }[]> = {
  Tecnologia: [
    { label: 'Cor', options: ['Preto', 'Branco', 'Azul', 'Cinza'] },
    { label: 'Armazenamento', options: ['128 GB', '256 GB', '512 GB'] },
  ],
  Moda: [
    { label: 'Cor', options: ['Preto', 'Branco', 'Azul', 'Bege', 'Vermelho'] },
    { label: 'Tamanho', options: ['P', 'M', 'G', 'GG', 'XL'] },
  ],
  Beleza: [
    { label: 'Variação', options: ['Floral', 'Cítrico', 'Amadeirado', 'Neutro'] },
    { label: 'Tamanho', options: ['50 ml', '100 ml', '200 ml'] },
  ],
  Casa: [
    { label: 'Cor', options: ['Preto', 'Branco', 'Inox', 'Creme'] },
    { label: 'Voltagem', options: ['220 V', '110 V'] },
  ],
  Esportes: [
    { label: 'Tamanho', options: ['P', 'M', 'G', 'GG'] },
    { label: 'Género', options: ['Homem', 'Mulher', 'Unissexo'] },
  ],
  Veículos: [
    { label: 'Combustível', options: ['Gasolina', 'Gasóleo', 'Elétrico', 'Híbrido'] },
    { label: 'Ano', options: ['2023', '2024', '2025'] },
  ],
  'Jóias & Acessórios': [
    { label: 'Material', options: ['Ouro 18K', 'Prata 925', 'Aço Inoxidável'] },
    { label: 'Tamanho', options: ['Único', 'Ajustável'] },
  ],
};

const VariationsSelector: React.FC<VariationsSelectorProps> = ({ category, selected, onChange }) => {
  const groups = VARIATION_MAP[category] || [
    { label: 'Cor', options: ['Preto', 'Branco', 'Azul'] },
    { label: 'Estilo', options: ['Padrão', 'Premium'] },
  ];
  return (
    <div className="space-y-3">
      {groups.map(g => (
        <div key={g.label}>
          <p className="text-xs font-bold text-zinc-500 mb-1.5">{g.label}</p>
          <div className="flex flex-wrap gap-2">
            {g.options.map(opt => {
              const active = selected[g.label] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => onChange({ ...selected, [g.label]: active ? '' : opt })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    active
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-purple-300 hover:text-purple-600'
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Make offer modal ── */
interface MakeOfferModalProps {
  product: Product;
  initialAmount: number;
  onClose: () => void;
  onSubmit: (amount: string, note: string) => void;
  offerSent: boolean;
  offerAmount: string;
  setOfferAmount: (v: string) => void;
  offerNote: string;
  setOfferNote: (v: string) => void;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  product, initialAmount, onClose, onSubmit,
  offerSent, offerAmount, setOfferAmount, offerNote, setOfferNote,
}) => {
  useEffect(() => {
    if (!offerAmount) setOfferAmount(initialAmount.toString());
  }, [initialAmount, offerAmount, setOfferAmount]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-zinc-900">Fazer Proposta</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500">
              <X size={18} />
            </button>
          </div>

          {offerSent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <p className="text-base font-bold text-zinc-900 mb-1">Proposta enviada!</p>
              <p className="text-sm text-zinc-500">O vendedor responderá em breve.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(offerAmount, offerNote); }} className="space-y-4">
              <div className="bg-zinc-50 rounded-xl p-3 flex gap-3">
                <img src={product.image} alt="" className="w-14 h-14 object-cover rounded-lg border border-zinc-200" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-purple-600 uppercase">{product.category}</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">{product.title}</p>
                  <p className="text-xs text-zinc-400">Preço: Kz {product.price.toLocaleString('pt-AO')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Sua proposta (Kz)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">Kz</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={offerAmount}
                    onChange={e => setOfferAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 font-bold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" />
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  Sugestão: Kz {initialAmount.toLocaleString('pt-AO')} (≈ 85% do preço)
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Mensagem (opcional)</label>
                <textarea
                  rows={3}
                  value={offerNote}
                  onChange={e => setOfferNote(e.target.value)}
                  placeholder="Explique a sua proposta ou pergunte sobre o produto..."
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Tag size={16} /> Enviar Proposta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Recommendations strip ── */
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
    <div className="mt-10">
      <div className="mb-4">
        <h2 className="text-base font-black text-zinc-900">{title}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-x-visible custom-scrollbar">
        {products.map(p => {
          const disc = p.originalPrice && p.originalPrice > p.price
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
          return (
            <div key={p.id}
              className="shrink-0 w-[140px] md:w-auto group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer"
              onClick={() => onProductClick?.(p)}>
              <div className="aspect-square bg-zinc-50 overflow-hidden relative">
                <img src={p.image} alt={p.title} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                {disc && (
                  <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    -{disc}%
                  </span>
                )}
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

/* ── Return to top button ── */
const ReturnToTop: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-32 md:bottom-8 right-4 z-40 bg-white border border-zinc-200 shadow-lg rounded-full px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-1.5">
      ↑ Topo
    </button>
  );
};

export default ProductDetailPage;
