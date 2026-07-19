import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, UserProfile } from '../types';

interface ProductsViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onEditProduct: (product: Product) => void;
  onAddProduct: () => void;
}

const ProductsView = ({ userProfile, onBack, onEditProduct, onAddProduct }: ProductsViewProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userProfile.uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts((data || []).map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          description: p.description,
          image: p.image_url || p.image,
          stock: p.stock,
          status: p.status,
          condition: p.condition,
          isImport: (p as { is_import?: boolean }).is_import,
          sellerId: p.seller_id,
          sellerPhone: (p as { seller_phone?: string }).seller_phone,
          createdAt: new Date(p.created_at).getTime()
        } as unknown as Product)));
      }
      setLoading(false);
    };

    fetchProducts();

    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products',
        filter: `seller_id=eq.${userProfile.uid}`
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Optimistic update
      setProducts(prev => prev.filter(p => p.id !== productId));
      setConfirmDeleteId(null);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        // Revert on error (optional, but good practice)
        // For now, we just log it and maybe fetch again
        throw error;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-50';
      case 'approved': return 'text-emerald-500 bg-emerald-50';
      case 'rejected': return 'text-rose-500 bg-rose-50';
      default: return 'text-zinc-500 bg-zinc-50';
    }
  };

  const getStatusLabel = (status: Product['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status || 'Pendente';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
            <ArrowLeft size={24} className="text-zinc-700" />
          </button>
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Meus Produtos</h2>
        </div>
        
        <button 
          onClick={onAddProduct}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={24} />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar nos meus produtos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
          />
        </div>
        
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
          {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-purple-600 shadow-lg' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-[40px] border border-zinc-200">
          <div className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
            <Tag size={48} />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-zinc-500 max-w-md mx-auto font-medium">Você ainda não tem produtos que correspondam aos filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white p-4 md:p-6 rounded-3xl border border-zinc-200 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-100 rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg backdrop-blur-md ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-md">{product.category}</span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">#{product.id.slice(-6)}</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-zinc-900 leading-tight">{product.title}</h3>
                    <div className="flex items-center gap-4">
                      <p className="text-xl md:text-2xl font-black text-purple-600">Kz {product.price.toLocaleString('pt-AO')}</p>
                      <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                      <p className="text-sm font-bold text-zinc-500">Estoque: {product.stock || 0}</p>
                      <div className="w-1 h-1 bg-zinc-300 rounded-full hidden sm:block" />
                      <p className="text-sm font-bold text-zinc-500 hidden sm:block">{product.condition || 'Novo'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:flex-col lg:flex-row">
                  <button 
                    onClick={() => onEditProduct(product)}
                    className="flex-1 md:w-full lg:flex-1 bg-zinc-100 hover:bg-purple-600 hover:text-white text-zinc-700 px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  {confirmDeleteId === product.id ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-xl transition-all active:scale-95 font-bold text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-3 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-500 rounded-xl transition-all active:scale-95 font-bold text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-3 bg-zinc-100 hover:bg-rose-600 hover:text-white text-rose-500 rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsView;
