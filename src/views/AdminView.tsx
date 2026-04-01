import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Search, Package, CreditCard, AlertCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, UserProfile, Order } from '../types';

interface AdminViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
}

const AdminView = ({ userProfile, onBack }: AdminViewProps) => {
  const [activeTab, setActiveTab] = useState<'products' | 'payments'>('products');
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile || userProfile.email !== '7dark7cloud7@gmail.com') return;

    setLoading(true);
    
    // Products Listener
    const productsQ = query(
      collection(db, 'products'),
      where('status', '==', 'pending')
    );

    const unsubscribeProducts = onSnapshot(productsQ, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setPendingProducts(productsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      if (activeTab === 'products') setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    // Payments Listener
    const paymentsQ = query(
      collection(db, 'orders'),
      where('paymentStatus', '==', 'verifying')
    );

    const unsubscribePayments = onSnapshot(paymentsQ, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setPendingPayments(paymentsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      if (activeTab === 'payments') setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    return () => {
      unsubscribeProducts();
      unsubscribePayments();
    };
  }, [userProfile, activeTab]);

  const handleApprove = async (productId: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: userProfile?.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  const handleVerifyPayment = async (orderId: string, status: 'verified' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: status,
        status: status === 'verified' ? 'held' : 'pending', // Move to escrow if verified
        updatedAt: serverTimestamp(),
        verifiedBy: userProfile?.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: userProfile?.uid
      });
      setConfirmRejectId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'products');
    }
  };

  const filteredProducts = pendingProducts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = pendingPayments.filter(o => 
    o.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft size={24} className="text-zinc-700 dark:text-zinc-300" />
          </button>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Painel Administrativo</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestão de produtos e pagamentos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <ShieldCheck size={24} className="text-emerald-500" />
          <div className="text-left">
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sessão Segura</p>
            <p className="text-sm font-black dark:text-white">Admin: {userProfile?.displayName}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <Package size={18} />
          Produtos Pendentes ({pendingProducts.length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'payments' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          <CreditCard size={18} />
          Pagamentos ({pendingPayments.length})
        </button>
      </div>

      <div className="relative group mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={activeTab === 'products' ? "Buscar por produto ou vendedor..." : "Buscar por comprador ou ID do pedido..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'products' ? (
        filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
              <Clock size={48} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Nenhum produto pendente</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">Todos os produtos submetidos já foram revisados.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 transition-all group shadow-xl shadow-zinc-500/5"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-[32px] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500 text-white rounded-xl shadow-lg">Pendente</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg border border-purple-100 dark:border-purple-800">{product.category}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID: {product.id}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">{product.title}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Preço</p>
                        <p className="text-xl font-black text-purple-600 dark:text-purple-400">Kz {product.price.toLocaleString('pt-AO')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estoque</p>
                        <p className="text-xl font-black dark:text-white">{product.stock || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Detalhes</p>
                        <p className="text-sm font-black dark:text-white">{product.condition || 'Novo'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vendedor</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                            <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm font-black dark:text-white truncate">{product.sellerName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Data</p>
                        <p className="text-sm font-black dark:text-white">{product.createdAt?.toDate().toLocaleDateString('pt-AO')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-4 justify-center">
                    <button 
                      onClick={() => handleApprove(product.id)}
                      className="flex-1 lg:w-48 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle size={24} />
                      Aprovar
                    </button>
                    {confirmRejectId === product.id ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">Confirmar Rejeição?</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleReject(product.id)}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-4 py-3 rounded-xl font-black text-sm transition-all"
                          >
                            Sim
                          </button>
                          <button 
                            onClick={() => setConfirmRejectId(null)}
                            className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-3 rounded-xl font-black text-sm transition-all"
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmRejectId(product.id)}
                        className="flex-1 lg:w-48 bg-rose-500 hover:bg-rose-600 text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <XCircle size={24} />
                        Rejeitar
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
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
              <CreditCard size={48} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Nenhum pagamento pendente</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">Todos os comprovativos já foram verificados.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPayments.map((order) => (
              <div 
                key={order.id}
                className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 transition-all group shadow-xl shadow-zinc-500/5"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-64 h-80 bg-zinc-100 dark:bg-zinc-800 rounded-[32px] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform border-4 border-zinc-200 dark:border-zinc-800">
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
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg border border-purple-100 dark:border-purple-800">Pedido: #{order.id.slice(-6)}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{order.paymentMethod}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">Comprador: {order.buyerName}</h3>
                      <p className="text-xl font-black text-purple-600 dark:text-purple-400">Total: Kz {order.total.toLocaleString('pt-AO')}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Produtos no Pedido</p>
                      <div className="flex flex-wrap gap-2">
                        {order.products.map((p: Product, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-xs font-bold dark:text-white">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Endereço de Entrega</p>
                      <p className="text-sm font-bold dark:text-white">{order.shippingAddress}</p>
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
