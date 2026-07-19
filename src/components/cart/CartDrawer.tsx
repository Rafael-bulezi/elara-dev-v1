import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: (Product & { cartQuantity?: number })[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove, 
  onUpdateQuantity, 
  onCheckout 
}: CartDrawerProps) => {
  const total = cart.reduce((sum, item) => sum + (item.price * (item.cartQuantity || 1)), 0);

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 md:p-6 border-b border-zinc-200 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-zinc-600" />
            </button>
            <h2 className="text-xl font-black tracking-tight">Seu Carrinho</h2>
          </div>
          <span className="bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full">{cart.length} itens</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-400">
                <ShoppingBag size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Carrinho vazio</h3>
                <p className="text-zinc-500 mt-1">Que tal adicionar alguns produtos?</p>
              </div>
              <button onClick={onClose} className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-all">
                Começar a comprar
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm line-clamp-2 leading-tight">{item.title}</h3>
                      <button onClick={() => onRemove(item.id)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-purple-600 font-black text-base mt-1">Kz {item.price.toLocaleString('pt-AO')}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-zinc-600">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-black text-sm">{item.cartQuantity || 1}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-zinc-600">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 md:p-6 bg-zinc-50 border-t border-zinc-200 space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">Kz {total.toLocaleString('pt-AO')}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span className="font-medium">Taxa de entrega</span>
                <span className="text-emerald-500 font-bold">Grátis</span>
              </div>
              <div className="h-px bg-zinc-200 my-2"></div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-black">Total</span>
                <span className="text-2xl font-black text-purple-600 tracking-tighter">Kz {total.toLocaleString('pt-AO')}</span>
              </div>
            </div>
            <button onClick={onCheckout} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
              Finalizar Compra
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

