import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Search, Package, CreditCard, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, UserProfile, Order } from '../types';
import { getAvatarUrl } from '../utils/avatar';

interface AdminViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
}

const AdminView = ({ userProfile, onBack }: AdminViewProps) => {
  const [activeTab, setActiveTab] = useState<'products' | 'payments'>('products');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    const isAdmin = userProfile.email === '7dark7cloud7@gmail.com' || userProfile.role === 'admin';
    if (!isAdmin) return;

    setLoading(true);
    
    const fetchAllProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setAllProducts((data || []).map((p) => ({
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
          sellerName: (p as { profiles?: { full_name?: string }, seller_name?: string }).profiles?.full_name || (p as { seller_name?: string }).seller_name || 'Vendedor Desconhecido',
          sellerAvatar: (p as { profiles?: { avatar_url?: string }, seller_avatar?: string }).profiles?.avatar_url || (p as { seller_avatar?: string }).seller_avatar || '',
          createdAt: new Date(p.created_at).getTime()
        } as unknown as Product)));
      }
      if (activeTab === 'products') setLoading(false);
    };

    const fetchPendingPayments = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('payment_status', 'verifying')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending payments:', error);
      } else {
        setPendingPayments((data || []).map((o) => ({
          id: o.id,
          buyerId: o.buyer_id,
          buyerName: o.buyer_name,
          buyerEmail: o.buyer_email,
          buyerPhone: o.buyer_phone,
          shippingAddress: o.shipping_address,
          paymentMethod: o.payment_method,
          total: o.total,
          status: o.status,
          paymentStatus: o.payment_status,
          paymentReceipt: o.payment_receipt,
          products: (o as { order_items: { products: unknown; quantity: number }[] }).order_items.map((oi: { products: unknown; quantity: number }) => ({
            ...(oi.products as object),
            cartQuantity: oi.quantity
          })),
          createdAt: new Date(o.created_at).getTime()
        } as unknown as Order)));
      }
      if (activeTab === 'payments') setLoading(false);
    };

    fetchAllProducts();
    fetchPendingPayments();

    const productsChannel = supabase
      .channel('admin_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchAllProducts())
      .subscribe();

    const paymentsChannel = supabase
      .channel('admin_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: 'payment_status=eq.verifying' }, () => fetchPendingPayments())
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [userProfile, activeTab]);

  const handleApprove = async (productId: string) => {
    setApprovingId(productId);
    
    if (!supabase) {
      console.error('Erro: Supabase não inicializado!');
      setApprovingId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'approved'
        })
        .eq('id', productId);

      if (error) {
        console.error(`Erro do Supabase: ${error.message}`);
        alert(`Erro ao aprovar: ${error.message}`);
        setApprovingId(null);
        return;
      }
      
      // Remove from local state to update UI immediately
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'approved' } : p));
      setApprovingId(null);
    } catch (error: unknown) {
      console.error(`Erro inesperado: ${error instanceof Error ? error.message : error}`);
      setApprovingId(null);
    }
  };

  const handleVerifyPayment = async (orderId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          status: status === 'verified' ? 'held' : 'pending'
        })
        .eq('id', orderId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'rejected'
        })
        .eq('id', productId);
      
      if (error) throw error;
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'rejected' } : p));
      setConfirmRejectId(null);
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      setAllProducts(prev => prev.filter(p => p.id !== productId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = productFilter === 'all' || p.status === productFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = pendingPayments.filter(o => 
    o.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
            <ArrowLeft size={24} className="text-zinc-700" />
          </button>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Painel Administrativo</h2>
            <p className="text-zinc-500 font-medium">Gestão de produtos e pagamentos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <ShieldCheck size={24} className="text-emerald-500" />
          <div className="text-left">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sessão Segura</p>
            <p className="text-sm font-black">Admin: {userProfile?.name || userProfile?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-white text-purple-600 shadow-lg' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <Package size={18} />
          Produtos ({allProducts.length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'payments' ? 'bg-white text-purple-600 shadow-lg' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <CreditCard size={18} />
          Pagamentos ({pendingPayments.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 mb-8 w-full md:w-fit overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button 
              key={status}
              onClick={() => setProductFilter(status)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${productFilter === status ? 'bg-white text-purple-600 shadow-lg' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Rejeitados'}
            </button>
          ))}
        </div>
      )}

      <div className="relative group mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={activeTab === 'products' ? "Buscar por produto ou vendedor..." : "Buscar por comprador ou ID do pedido..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'products' ? (
        filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-[40px] border border-zinc-200">
            <div className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
              <Clock size={48} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-zinc-500 max-w-md mx-auto font-medium">Não há produtos que correspondam aos filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white p-6 md:p-8 rounded-[40px] border border-zinc-200 hover:border-purple-500/50 transition-all group shadow-xl shadow-zinc-500/5"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-48 h-48 bg-zinc-100 rounded-[32px] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 text-white rounded-xl shadow-lg ${product.status === 'approved' ? 'bg-emerald-500' : product.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                        {product.status === 'approved' ? 'Aprovado' : product.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">{product.category}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID: {product.id}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">{product.title}</h3>
                      <p className="text-zinc-500 font-medium leading-relaxed line-clamp-2">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4 border-t border-zinc-100">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Preço</p>
                        <p className="text-xl font-black text-purple-600">Kz {product.price.toLocaleString('pt-AO')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estoque</p>
                        <p className="text-xl font-black">{product.stock || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Detalhes</p>
                        <p className="text-sm font-black">{product.condition || 'Novo'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vendedor</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-zinc-100 rounded-lg overflow-hidden">
                            <img src={getAvatarUrl(product.sellerAvatar, product.sellerName)} alt={product.sellerName} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm font-black truncate">{product.sellerName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Data</p>
                        <p className="text-sm font-black">{new Date(product.createdAt).toLocaleDateString('pt-AO')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-4 justify-center mt-4 pt-4 border-t border-zinc-100">
                    {product.status !== 'approved' && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApprove(product.id);
                        }}
                        disabled={approvingId === product.id}
                        style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
                        className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${approvingId === product.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {approvingId === product.id ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            Aprovando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={24} />
                            Aprovar
                          </>
                        )}
                      </button>
                    )}
                    
                    {product.status !== 'rejected' && (
                      confirmRejectId === product.id ? (
                        <div className="flex flex-col gap-2 w-full">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">Confirmar Rejeição?</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReject(product.id); }}
                              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-black text-sm transition-all"
                            >
                              Sim
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmRejectId(null); }}
                              className="flex-1 bg-zinc-200 text-zinc-700 px-4 py-3 rounded-xl font-black text-sm transition-all"
                            >
                              Não
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmRejectId(product.id); }}
                          style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          <XCircle size={24} />
                          Rejeitar
                        </button>
                      )
                    )}

                    {confirmDeleteId === product.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">Excluir Permanentemente?</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(product.id); }}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-black text-sm transition-all"
                          >
                            Sim
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="flex-1 bg-zinc-200 text-zinc-700 px-4 py-3 rounded-xl font-black text-sm transition-all"
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(product.id); }}
                        style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <AlertCircle size={24} />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredPayments.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-[40px] border border-zinc-200">
            <div className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
              <CreditCard size={48} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-2">Nenhum pagamento pendente</h3>
            <p className="text-zinc-500 max-w-md mx-auto font-medium">Todos os comprovativos já foram verificados.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPayments.map((order) => (
              <div 
                key={order.id}
                className="bg-white p-6 md:p-8 rounded-[40px] border border-zinc-200 hover:border-purple-500/50 transition-all group shadow-xl shadow-zinc-500/5"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-64 h-80 bg-zinc-100 rounded-[32px] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform border-4 border-zinc-200">
                    {order.paymentReceipt ? (
                      <a href={order.paymentReceipt} target="_blank" rel="noreferrer">
                        <img src={order.paymentReceipt} alt="Comprovativo" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <AlertCircle size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-purple-600 text-white rounded-xl shadow-lg">Verificando</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">Pedido: #{order.id.slice(-6)}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{order.paymentMethod}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">Comprador: {order.buyerName}</h3>
                      <p className="text-xl font-black text-purple-600">Total: Kz {order.total.toLocaleString('pt-AO')}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Produtos no Pedido</p>
                      <div className="flex flex-wrap gap-2">
                        {order.products.map((p: Product, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                            <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-xs font-bold">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Endereço de Entrega</p>
                      <p className="text-sm font-bold">{order.shippingAddress}</p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-4 justify-center">
                    <button 
                      onClick={() => handleVerifyPayment(order.id, 'verified')}
                      className="flex-1 lg:w-48 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle size={24} />
                      Confirmar
                    </button>
                    <button 
                      onClick={() => handleVerifyPayment(order.id, 'rejected')}
                      className="flex-1 lg:w-48 bg-rose-500 hover:bg-rose-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <XCircle size={24} />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default AdminView;
