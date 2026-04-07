import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Star, MapPin, Calendar, MessageCircle, ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, UserProfile } from '../types';
import ProductCard from '../components/ProductCard';

interface SellerProfileViewProps {
  sellerId: string;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onContactSeller: (sellerId: string, sellerName: string, sellerAvatar: string) => void;
}

const SellerProfileView = ({ sellerId, onBack, onProductClick, onAddToCart, onContactSeller }: SellerProfileViewProps) => {
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();

        if (error) throw error;
        if (data) {
          setSeller({
            uid: data.id,
            email: data.email,
            displayName: data.display_name,
            photoURL: data.photo_url,
            role: data.role,
            phoneNumber: data.phone_number,
            address: data.address,
            bio: data.bio,
            rating: data.rating,
            reviewsCount: data.reviews_count,
            createdAt: { toDate: () => new Date(data.created_at) }
          } as unknown as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching seller:', error);
      }
    };

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          description: p.description,
          image: p.image,
          stock: p.stock,
          status: p.status,
          condition: p.condition,
          isImport: p.is_import,
          sellerId: p.seller_id,
          sellerPhone: p.seller_phone,
          createdAt: { toDate: () => new Date(p.created_at) }
        } as unknown as Product)));
      }
      setLoading(false);
    };

    fetchSeller();
    fetchProducts();

    const channel = supabase
      .channel('seller_products')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products',
        filter: `seller_id=eq.${sellerId}`
      }, () => fetchProducts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button onClick={onBack} className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mb-10 group flex items-center gap-3">
        <ArrowLeft size={24} className="text-zinc-700 dark:text-zinc-300 group-hover:-translate-x-1 transition-transform" />
        <span className="font-black dark:text-white uppercase tracking-widest text-sm">Voltar ao Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-10 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-500/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10" />
            
            <div className="relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-100 dark:bg-zinc-800 rounded-[48px] overflow-hidden border-8 border-white dark:border-zinc-900 shadow-2xl mx-auto mb-8">
                {seller?.photoURL || seller?.avatar ? (
                  <img src={seller.photoURL || seller.avatar} alt={seller.displayName || seller.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <User size={64} />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-black dark:text-white tracking-tight">{seller?.displayName || seller?.name}</h2>
                  <CheckCircle size={20} className="text-blue-500" />
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={18} fill="currentColor" />
                    <span className="font-black text-lg">{seller?.rating || '5.0'}</span>
                  </div>
                  <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                  <span className="text-zinc-500 font-bold text-sm">({seller?.reviewsCount || 0} avaliações)</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 text-xs font-bold border border-zinc-100 dark:border-zinc-700">
                    <MapPin size={14} />
                    {seller?.address || 'Angola'}
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl text-zinc-500 dark:text-zinc-400 text-xs font-bold border border-zinc-100 dark:border-zinc-700">
                    <Calendar size={14} />
                    Desde {seller?.createdAt?.toDate().getFullYear() || '2026'}
                  </div>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed pt-4">
                  {seller?.bio || 'Vendedor verificado no Elara Marketplace. Comprometido com a qualidade e satisfação do cliente.'}
                </p>

                <div className="pt-8 space-y-4">
                  <button 
                    onClick={() => onContactSeller(sellerId, seller?.displayName || seller?.name || 'Vendedor', seller?.photoURL || seller?.avatar || '')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={24} />
                    Falar com Vendedor
                  </button>
                  <div className="flex items-center justify-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                    <ShieldCheck size={16} />
                    Vendedor Verificado
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xl font-black dark:text-white uppercase tracking-widest mb-6 text-center">Estatísticas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 text-center">
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{products.length}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Produtos</p>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 text-center">
                <p className="text-3xl font-black text-blue-500">98%</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Sucesso</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-2 rounded-[32px] border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-auto lg:mx-0">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'products' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <ShoppingBag size={20} />
              Produtos
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'reviews' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xl' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <Star size={20} />
              Avaliações
            </button>
          </div>

          {activeTab === 'products' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-500/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h5 className="font-black dark:text-white">Cliente Elara</h5>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Há 2 dias</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    "Excelente vendedor! O produto chegou muito rápido e em perfeitas condições. Recomendo a todos no marketplace."
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileView;
