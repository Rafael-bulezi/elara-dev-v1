import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Package, Truck, MessageCircle, CreditCard, ChevronRight, X } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, UserProfile } from '../types';

interface OrdersViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onContactUser?: (userId: string, userName: string, userAvatar: string, productId?: string, productName?: string) => void;
}

const OrdersView = ({ userProfile, onBack, onContactUser }: OrdersViewProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderType, setOrderType] = useState<'purchases' | 'sales'>(userProfile?.role === 'seller' ? 'sales' : 'purchases');

  useEffect(() => {
    if (!userProfile) return;

    const q = orderType === 'purchases' 
      ? query(collection(db, 'orders'), where('buyerId', '==', userProfile.uid))
      : query(collection(db, 'orders'), where('sellerIds', 'array-contains', userProfile.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile, orderType]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  const getStatusColor = (status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    if (paymentStatus === 'verifying') return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    if (paymentStatus === 'verified' && status === 'held') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    if (paymentStatus === 'rejected') return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';

    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'held': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'shipped': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'received': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'text-zinc-500 bg-zinc-50 dark:bg-zinc-900/20';
    }
  };

  const getStatusLabel = (status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    if (paymentStatus === 'verifying') return 'Estamos checando...';
    if (paymentStatus === 'verified' && status === 'held') return 'Pagamento Comprovado';
    if (paymentStatus === 'rejected') return 'Pagamento Rejeitado';

    switch (status) {
      case 'pending': return 'Pendente';
      case 'held': return 'Em Escrow';
      case 'shipped': return 'Enviado';
      case 'received': return 'Recebido';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft size={24} className="text-zinc-700 dark:text-zinc-300" />
          </button>
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Meus Pedidos</h2>
        </div>

        {userProfile?.role === 'seller' && (
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => setOrderType('purchases')}
              className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${orderType === 'purchases' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Compras
            </button>
            <button 
              onClick={() => setOrderType('sales')}
              className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${orderType === 'sales' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-lg' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Vendas
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
            <ShoppingBag size={48} />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Nenhum pedido encontrado</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">Você ainda não tem {orderType === 'purchases' ? 'compras' : 'vendas'} registradas no sistema.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={order.products[0]?.image} alt={order.products[0]?.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {getStatusLabel(order.status, order.paymentStatus)}
                      </span>
                    </div>
                    <h3 className="font-black text-zinc-900 dark:text-white leading-tight line-clamp-1">{order.products[0]?.title} {order.products.length > 1 && `+ ${order.products.length - 1} itens`}</h3>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-1">Kz {order.total.toLocaleString('pt-AO')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Data</p>
                    <p className="font-bold dark:text-white text-sm">{order.createdAt?.toDate().toLocaleDateString('pt-AO')}</p>
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 group-hover:text-purple-600 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
              <h2 className="text-2xl font-black dark:text-white tracking-tight">Detalhes do Pedido</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-6 md:p-10 space-y-8 flex-1">
                <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Status Atual</p>
                  <span className={`text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-xl ${getStatusColor(selectedOrder.status, selectedOrder.paymentStatus)}`}>
                    {getStatusLabel(selectedOrder.status, selectedOrder.paymentStatus)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Total do Pedido</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">Kz {selectedOrder.total.toLocaleString('pt-AO')}</p>
                </div>
              </div>

              {selectedOrder.paymentReceipt && (
                <div className="space-y-4">
                  <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                    <CreditCard size={20} className="text-emerald-500" />
                    Comprovativo de Pagamento
                  </h4>
                  <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img src={selectedOrder.paymentReceipt} alt="Comprovativo" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                  <Package size={20} className="text-purple-600" />
                  Produtos
                </h4>
                <div className="space-y-3">
                  {selectedOrder.products.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold dark:text-white text-sm truncate">{p.title}</h5>
                        <p className="text-xs font-bold text-zinc-500">Qtd: {p.cartQuantity || 1} • Kz {p.price.toLocaleString('pt-AO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                    <Truck size={20} className="text-blue-500" />
                    Entrega
                  </h4>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-bold dark:text-white leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                    <CreditCard size={20} className="text-emerald-500" />
                    Pagamento
                  </h4>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-black dark:text-white uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {orderType === 'sales' && selectedOrder.status === 'pending' && (
                <div className="pt-4">
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'held')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                  >
                    Confirmar Recebimento e Iniciar Escrow
                  </button>
                </div>
              )}

              {orderType === 'sales' && selectedOrder.status === 'held' && (
                <div className="pt-4">
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Marcar como Enviado
                  </button>
                </div>
              )}

              {orderType === 'purchases' && selectedOrder.status === 'shipped' && (
                <div className="pt-4">
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'received')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    Confirmar Recebimento do Produto
                  </button>
                </div>
              )}
              </div>

              <div className="sticky bottom-0 p-6 md:p-8 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 flex gap-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-8 z-10">
                <button 
                  onClick={() => {
                    const otherUserId = orderType === 'sales' ? selectedOrder.buyerId : selectedOrder.sellerId;
                    const otherUserName = orderType === 'sales' ? 'Comprador' : selectedOrder.products[0]?.sellerName || 'Vendedor';
                    const otherUserAvatar = orderType === 'sales' ? '' : selectedOrder.products[0]?.sellerAvatar || '';
                    onContactUser?.(otherUserId, otherUserName, otherUserAvatar, selectedOrder.products[0]?.id, selectedOrder.products[0]?.title);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-purple-500/50 text-zinc-900 dark:text-white py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={22} />
                  Falar com {orderType === 'sales' ? 'Comprador' : 'Vendedor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
