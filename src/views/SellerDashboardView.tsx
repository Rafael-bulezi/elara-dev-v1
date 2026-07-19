import React, { useState, useEffect } from 'react';
import { ArrowLeft, LayoutDashboard, Package, ShoppingBag, Wallet, TrendingUp, Plus, Users, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, UserProfile } from '../types';
import ProductsView from './ProductsView';

interface SellerDashboardViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onEditProduct: (product: Product) => void;
  onAddProduct: () => void;
  onViewOrders: () => void;
}

type SellerTab = 'dashboard' | 'products' | 'orders' | 'earnings';

const SellerDashboardView = ({ userProfile, onBack, onEditProduct, onAddProduct, onViewOrders }: SellerDashboardViewProps) => {
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', userProfile.uid),
          supabase.from('orders').select('id', { count: 'exact' }).eq('seller_id', userProfile.uid)
        ]);
        setProductCount(productsRes.count || 0);
        setOrderCount(ordersRes.count || 0);
      } catch (err) {
        console.error('Error fetching seller stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userProfile]);

  const isPending = userProfile?.sellerStatus === 'pending';
  const isActive = userProfile?.sellerStatus === 'active';

  const tabs = [
    { id: 'dashboard' as SellerTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as SellerTab, label: 'Produtos', icon: Package },
    { id: 'orders' as SellerTab, label: 'Pedidos', icon: ShoppingBag },
    { id: 'earnings' as SellerTab, label: 'Ganhos', icon: Wallet }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl min-h-screen">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
            <ArrowLeft size={24} className="text-zinc-700" />
          </button>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">
              {userProfile?.shopName || 'Painel do Vendedor'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                isActive ? 'bg-emerald-100 text-emerald-600' : isPending ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {isActive ? 'Loja Ativa' : isPending ? 'Pendente' : 'Vendedor'}
              </span>
              <span className="text-xs font-bold text-zinc-400">Modo Vendedor</span>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
        >
          Voltar ao Modo Comprador
        </button>
      </div>

      {isPending && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-700 rounded-2xl font-bold text-sm flex items-center gap-3 border border-amber-100">
          <Store size={18} />
          A sua loja está em revisão. Pode adicionar produtos enquanto aguarda aprovação.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Package size={20} />
                </div>
                <span className="text-sm font-black text-zinc-500 uppercase tracking-wider">Produtos</span>
              </div>
              <p className="text-3xl font-black text-zinc-900">{loading ? '-' : productCount}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-sm font-black text-zinc-500 uppercase tracking-wider">Pedidos</span>
              </div>
              <p className="text-3xl font-black text-zinc-900">{loading ? '-' : orderCount}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-sm font-black text-zinc-500 uppercase tracking-wider">Ganhos</span>
              </div>
              <p className="text-3xl font-black text-zinc-900">Kz 0</p>
              <p className="text-xs font-bold text-zinc-400 mt-1">Payouts em breve</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-3xl text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black mb-2">Adicionar novo produto</h3>
                <p className="text-purple-200 text-sm font-bold max-w-md">
                  Comece a vender agora. Adicione fotos, preço e descrição do seu produto.
                </p>
              </div>
              <button
                onClick={onAddProduct}
                className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Novo Produto
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200">
            <h3 className="text-lg font-black mb-4">Próximos passos</h3>
            <ul className="space-y-3 text-sm font-bold text-zinc-600">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                Criar conta de vendedor
              </li>
              <li className={`flex items-center gap-2 ${isPending ? 'text-amber-600' : isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  {isActive ? '✓' : '2'}
                </span>
                Aguardar aprovação da loja
              </li>
              <li className="flex items-center gap-2 text-zinc-600">
                <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center text-xs">3</span>
                Adicionar produtos e começar a vender
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="-mx-4 md:mx-0">
          <ProductsView
            userProfile={userProfile}
            onBack={() => setActiveTab('dashboard')}
            onEditProduct={onEditProduct}
            onAddProduct={onAddProduct}
          />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-10 rounded-3xl border border-zinc-200 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-black text-zinc-900 mb-2">Gestão de pedidos em breve</h3>
          <p className="text-zinc-500 text-sm font-bold mb-6">Aqui você vai ver todos os pedidos da sua loja.</p>
          <button
            onClick={onViewOrders}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all"
          >
            Ver Meus Pedidos
          </button>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="bg-white p-10 rounded-3xl border border-zinc-200 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Wallet size={28} />
          </div>
          <h3 className="text-xl font-black text-zinc-900 mb-2">Ganhos e Payouts em breve</h3>
          <p className="text-zinc-500 text-sm font-bold">Acompanhe vendas, comissões e saques para a sua conta Multicaixa.</p>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardView;
