import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, Truck,
  MapPin, Smartphone, Banknote, Copy, Check, Loader2, Package,
  QrCode,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, UserProfile } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: () => void;
  cart: (Product & { cartQuantity?: number })[];
  userProfile: UserProfile | null;
}

type PayMethod = 'multicaixa_express' | 'referencia' | 'cod';
type DeliveryOption = 'luanda_fast' | 'provinces' | 'pickup';

const DELIVERY_OPTS = [
  { id: 'luanda_fast' as DeliveryOption, label: 'Rápida em Luanda', detail: 'Entrega em 24–48h', price: 1500 },
  { id: 'provinces' as DeliveryOption, label: 'Províncias', detail: '2–5 dias úteis', price: 2500 },
  { id: 'pickup' as DeliveryOption, label: 'Recolha na Loja', detail: 'Disponível em Luanda', price: 0 },
];

const ORDER_ID = () => `#ELR-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const CheckoutModal = ({ isOpen, onClose, onOrderComplete, cart, userProfile }: CheckoutModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId] = useState(ORDER_ID);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    city: 'Luanda',
    neighborhood: '',
    address: '',
    delivery: 'luanda_fast' as DeliveryOption,
    payment: 'multicaixa_express' as PayMethod,
  });

  useEffect(() => {
    if (isOpen) { setStep(1); setError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((s, i) => s + i.price * (i.cartQuantity || 1), 0);
  const deliveryCost = DELIVERY_OPTS.find(d => d.id === form.delivery)?.price ?? 1500;
  const total = subtotal + deliveryCost;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleOrder = async () => {
    setLoading(true); setError('');
    try {
      if (!supabase) throw new Error('Supabase não está inicializado');

      const orderData = {
        buyer_id: userProfile?.uid || null,
        buyer_name: form.name,
        buyer_phone: form.phone,
        shipping_address: `${form.address}, ${form.neighborhood}, ${form.city}`,
        payment_method: form.payment,
        delivery_option: form.delivery,
        total,
        status: 'pending' as const,
        payment_status: (form.payment === 'cod' ? 'pending' : 'verifying') as 'pending' | 'verifying',
      };

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items for real-time order tracking
      const orderItems = cart.map(item => ({
        order_id: orderRow.id,
        product_id: item.id,
        seller_id: item.sellerId,
        quantity: item.cartQuantity || 1,
        price: item.price,
        total: item.price * (item.cartQuantity || 1),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Non-fatal: order exists, items may need manual review
      }

      setStep(4);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-6">
      {['Endereço', 'Revisão', 'Pagamento', 'Confirmação'].map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-purple-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                {done ? <Check size={12} /> : n}
              </div>
              <span className={`text-[9px] mt-1 font-bold ${active ? 'text-purple-600' : done ? 'text-emerald-500' : 'text-zinc-400'}`}>{label}</span>
            </div>
            {i < 3 && <div className={`h-0.5 w-10 mx-1 mb-4 rounded-full transition-colors ${step > n ? 'bg-emerald-400' : 'bg-zinc-200'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 rounded-lg transition-colors">
                <ArrowLeft size={16} className="text-zinc-500" />
              </button>
            )}
            <h2 className="font-black text-base text-zinc-900">
              {step === 4 ? '🎉 Pedido confirmado!' : 'Finalizar compra'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={16} className="text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          {step < 4 && <StepIndicator />}

          {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-xl font-medium">{error}</div>}

          {/* ── Step 1: Address ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-700 mb-3">Endereço de entrega</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 block mb-1">Nome completo</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors"
                    placeholder="Seu nome completo" required />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 block mb-1">Número de telefone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors"
                    placeholder="9XX XXX XXX" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-1">Cidade</label>
                  <select value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors">
                    {['Luanda','Benguela','Huíla','Huambo','Cabinda','Malanje'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 block mb-1">Bairro</label>
                  <input value={form.neighborhood} onChange={e => setForm(f => ({...f, neighborhood: e.target.value}))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors"
                    placeholder="Bairro / Zona" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-500 block mb-1">Morada completa</label>
                  <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors"
                    placeholder="Rua, número, referência" />
                </div>
              </div>

              <div className="mt-1">
                <p className="text-xs font-black text-zinc-700 mb-2">Método de entrega</p>
                <div className="space-y-2">
                  {DELIVERY_OPTS.map(opt => (
                    <label key={opt.id} className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.delivery === opt.id ? 'border-purple-600 bg-purple-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" checked={form.delivery === opt.id} onChange={() => setForm(f => ({...f, delivery: opt.id}))} className="accent-purple-600" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                          <p className="text-xs text-zinc-500">{opt.detail}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-zinc-900">{opt.price === 0 ? 'Grátis' : `Kz ${opt.price.toLocaleString('pt-AO')}`}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-2xl divide-y divide-zinc-200 overflow-hidden">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3.5">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-zinc-500">Qtd: {item.cartQuantity || 1}</p>
                    </div>
                    <span className="text-sm font-black text-zinc-900 shrink-0">Kz {(item.price * (item.cartQuantity || 1)).toLocaleString('pt-AO')}</span>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-900">{form.name}</p>
                    <p className="text-zinc-500 text-xs">{form.address}, {form.neighborhood}, {form.city}</p>
                    <p className="text-zinc-500 text-xs">{form.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span className="font-bold">Kz {subtotal.toLocaleString('pt-AO')}</span></div>
                <div className="flex justify-between text-zinc-600"><span>Entrega</span><span className="font-bold">{deliveryCost === 0 ? 'Grátis' : `Kz ${deliveryCost.toLocaleString('pt-AO')}`}</span></div>
                <div className="flex justify-between text-zinc-900 font-black text-base border-t border-zinc-200 pt-2 mt-2">
                  <span>Total</span><span>Kz {total.toLocaleString('pt-AO')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs font-black text-zinc-700 mb-3">Escolha o método de pagamento</p>

              {/* Payment method buttons */}
              <div className="space-y-2">
                {([
                  { id: 'multicaixa_express' as PayMethod, icon: <QrCode size={18} className="text-purple-600" />, label: 'Multicaixa Express (QR)', sub: 'Abra a app e escaneie o QR', badge: 'Recomendado' },
                  { id: 'referencia' as PayMethod, icon: <Smartphone size={18} className="text-blue-600" />, label: 'Referência Multicaixa', sub: 'Gera uma referência para pagar' },
                  { id: 'cod' as PayMethod, icon: <Banknote size={18} className="text-emerald-600" />, label: 'Pagamento na Entrega (COD)', sub: 'Pague quando receber o pedido' },
                ] as const).map(opt => (
                  <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.payment === opt.id ? 'border-purple-600 bg-purple-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    <input type="radio" name="payment" checked={form.payment === opt.id} onChange={() => setForm(f => ({...f, payment: opt.id}))} className="accent-purple-600" />
                    <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">{opt.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                        {'badge' in opt && opt.badge && <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
                      </div>
                      <p className="text-xs text-zinc-500">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Payment details */}
              {form.payment === 'multicaixa_express' && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
                  <div className="w-28 h-28 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center border border-purple-200">
                    <QrCode size={64} className="text-purple-600" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 mb-1">Kz {total.toLocaleString('pt-AO')}</p>
                  <p className="text-xs text-zinc-500">Abra o Multicaixa Express e escaneie o código</p>
                  <p className="text-xs text-amber-600 font-bold mt-2">⏱ Expira em 30:00</p>
                </div>
              )}

              {form.payment === 'referencia' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-zinc-900">Como pagar com Referência:</p>
                  <ol className="text-xs text-zinc-600 space-y-1.5 list-decimal list-inside">
                    <li>Vá ao Multicaixa ou banca online</li>
                    <li>Seleccione Referências &amp; Pagamentos</li>
                    <li>Insira a referência abaixo</li>
                  </ol>
                  <div className="bg-white rounded-xl border border-blue-200 p-3">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Referência</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xl font-black text-zinc-900 tracking-widest">1 2 3 4 5 6 7 8</span>
                      <button onClick={() => copy('12345678', 'ref')} className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                        {copied === 'ref' ? <Check size={12} /> : <Copy size={12} />} Copiar
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900">
                    <span>Total a pagar:</span>
                    <span>Kz {total.toLocaleString('pt-AO')}</span>
                  </div>
                </div>
              )}

              {form.payment === 'cod' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <Truck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Pague na entrega</p>
                    <p className="text-xs text-zinc-500 mt-1">O estafeta receberá o pagamento de <span className="font-black text-zinc-900">Kz {total.toLocaleString('pt-AO')}</span> à entrega. Tenha o valor exacto disponível.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Confirmation ── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">Pedido confirmado!</h3>
              <p className="text-sm text-zinc-500 mb-1">Obrigado pela sua compra na Elara.</p>
              <div className="bg-zinc-50 rounded-2xl p-4 my-5 text-left space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nº do pedido</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-zinc-900 font-mono">{orderId}</span>
                    <button onClick={() => copy(orderId, 'order')} className="text-purple-600">
                      {copied === 'order' ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total</span>
                  <span className="font-black text-zinc-900">Kz {total.toLocaleString('pt-AO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Entrega</span>
                  <span className="font-bold text-zinc-900">{DELIVERY_OPTS.find(d => d.id === form.delivery)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pagamento</span>
                  <span className="font-bold text-zinc-900">
                    {form.payment === 'multicaixa_express' ? 'Multicaixa Express' : form.payment === 'referencia' ? 'Referência' : 'Na entrega'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-5">Receberá uma notificação via SMS/WhatsApp com os detalhes. Acompanhe o seu pedido em "Os meus pedidos".</p>
              <div className="flex gap-3">
                <button onClick={onOrderComplete}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Package size={16} /> Acompanhar pedido
                </button>
                <button onClick={onClose}
                  className="flex-1 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-700 font-black py-3.5 rounded-xl text-sm transition-colors">
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step < 4 && (
          <div className="px-5 py-4 border-t border-zinc-100 bg-white shrink-0">
            {step < 3 && (
              <div className="flex justify-between text-sm mb-3 text-zinc-500">
                <span>Total ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                <span className="font-black text-zinc-900">Kz {total.toLocaleString('pt-AO')}</span>
              </div>
            )}
            <button
              onClick={step < 3 ? () => setStep(s => s + 1) : handleOrder}
              disabled={loading || (step === 1 && (!form.name || !form.phone))}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
              {loading ? <Loader2 size={16} className="animate-spin" /> : step === 3 ? <ShieldCheck size={16} /> : <ArrowRight size={16} />}
              {loading ? 'A processar...' : step === 3 ? 'Confirmar pedido' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
