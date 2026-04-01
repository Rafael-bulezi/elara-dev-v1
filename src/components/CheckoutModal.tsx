import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, ArrowLeft, Smartphone, Truck, ShieldCheck, MessageCircle, Globe, AlertCircle, Loader2, Copy, Upload, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { Product, UserProfile } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: () => void;
  cart: (Product & { cartQuantity?: number })[];
  userProfile: UserProfile | null;
}

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  onOrderComplete, 
  cart, 
  userProfile
}: CheckoutModalProps) => {
  const [step, setStep] = useState(1);
  const [checkoutType, setCheckoutType] = useState<'whatsapp' | 'app' | null>(null);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: '',
    paymentMethod: 'multicaixa'
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  const IBAN = "0055 0000 33548942101 98";
  const EXPRESS = "921044212";

  const total = cart.reduce((sum, item) => sum + (item.price * (item.cartQuantity || 1)), 0);
  const hasImportProducts = cart.some(item => item.isImport);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSuccess(false);
      if (hasImportProducts) {
        setCheckoutType('whatsapp');
        setFormData(prev => ({ ...prev, paymentMethod: 'whatsapp' }));
      }
    }
  }, [isOpen, hasImportProducts]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const generateWhatsAppLink = () => {
    const message = `Olá! Gostaria de fazer um pedido na ELARA:\n\n` +
      cart.map(item => `- ${item.title} (${item.cartQuantity || 1}x) - Kz ${item.price.toLocaleString('pt-AO')} ${item.isImport ? '(Importação)' : ''}`).join('\n') +
      `\n\nTotal: Kz ${total.toLocaleString('pt-AO')}\n\n` +
      `Cliente: ${formData.name}\n` +
      `Endereço: ${formData.address}\n` +
      `Pagamento: ${formData.paymentMethod}`;
    
    // Extract phone number from text (Angola format)
    const extractPhone = (text: string) => {
      if (!text) return null;
      // Look for 9 digits starting with 9, or with 244 prefix
      const match = text.match(/(?:244)?\s?9\d{8}/g);
      if (match) {
        // Return the first one found, cleaned
        return match[0].replace(/\s/g, '');
      }
      return null;
    };

    // 1. Check product property
    // 2. Check product description
    // 3. Check seller name (sometimes people put it there)
    // 4. Default
    const sellerPhone = cart[0]?.sellerPhone || 
                       extractPhone(cart[0]?.description || '') || 
                       extractPhone(cart[0]?.sellerName || '') ||
                       "244900000000"; 

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = sellerPhone.replace(/\D/g, '');
    // Ensure 244 prefix if not present
    const finalPhone = cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`;
    return `https://wa.me/${finalPhone}?text=${encodedMessage}`;
  };

  const sendSilentEmail = async (orderData: Record<string, unknown>) => {
    // Silently notify the admin as requested
    console.log("Sending silent notification to 7dark7cloud7@gmail.com", orderData);
    try {
      // Using our new server-side API
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '7dark7cloud7@gmail.com',
          subject: 'Novo Pedido Confirmado - ELARA',
          data: orderData
        })
      }).catch(() => {}); // Silent fail
    } catch (e) {
      // Ignore errors as it's a silent background task
    }
  };

  const handleConfirmOrder = async () => {
    try {
      if (checkoutType === 'whatsapp' || hasImportProducts) {
        window.open(generateWhatsAppLink(), '_blank');
        onOrderComplete();
        return;
      }

      if (step === 2 && checkoutType === 'app') {
        setStep(3);
        return;
      }

      if (step === 3 && checkoutType === 'app') {
        if (!receiptFile && formData.paymentMethod !== 'entrega') {
          setError("Por favor, envie o comprovativo do pagamento.");
          return;
        }

        setIsUploading(true);
        let receiptUrl = '';

        if (receiptFile) {
          const storageRef = ref(storage, `receipts/${userProfile?.uid}/${Date.now()}_${receiptFile.name}`);
          const snapshot = await uploadBytes(storageRef, receiptFile);
          receiptUrl = await getDownloadURL(snapshot.ref);
        }

        // Create order in Firestore
        const orderData = {
          buyerId: userProfile?.uid,
          buyerName: formData.name,
          buyerEmail: formData.email,
          buyerPhone: formData.phone,
          shippingAddress: formData.address,
          paymentMethod: formData.paymentMethod,
          sellerId: cart[0]?.sellerId || '',
          sellerIds: Array.from(new Set(cart.map(item => item.sellerId))),
          products: cart,
          total: total,
          status: 'pending',
          paymentStatus: formData.paymentMethod === 'entrega' ? 'pending' : 'verifying',
          paymentReceipt: receiptUrl,
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'orders'), orderData);
        
        // Send silent email notification
        sendSilentEmail(orderData);
        
        setIsUploading(false);
        setStep(4); // "Estamos checando..."
        
        // After some time, simulate confirmation or just leave it as "verifying"
        // The user said: "Depois de algum tempo, ele vai confirmar... vai mostrar pagamento comprovado"
        // For now, let's just show the "Checking" state.
        return;
      }

      if (!userProfile) {
        setError("Por favor, faça login para finalizar a compra pelo App.");
        return;
      }
    } catch (error) {
      setIsUploading(false);
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      setError("Erro ao processar pedido. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col overflow-hidden my-auto border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {step > 1 && !success && (
              <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            )}
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Finalizar Compra</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-6 md:p-10 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 relative">
                <CheckCircle size={48} className="text-emerald-500" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-emerald-500 rounded-full"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black dark:text-white tracking-tight">Pagamento Confirmado!</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xs mx-auto">
                  O seu pedido foi processado com sucesso e o pagamento foi identificado pelo sistema.
                </p>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Processo Concluído</p>
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black dark:text-white">Como você prefere finalizar?</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Escolha o método de fechamento do seu pedido</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setCheckoutType('whatsapp'); setStep(2); }}
                  className="group p-8 rounded-[32px] border-2 border-emerald-500/20 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 transition-all text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MessageCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-emerald-700 dark:text-emerald-400">Via WhatsApp</h4>
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/50 font-bold">Fale direto com o vendedor</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setCheckoutType('app'); setStep(2); }}
                  className="group p-8 rounded-[32px] border-2 border-purple-500/20 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 transition-all text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Smartphone size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-purple-700 dark:text-purple-400">Pelo App</h4>
                    <p className="text-sm text-purple-600/70 dark:text-purple-400/50 font-bold">Pagamento seguro via ELARA</p>
                  </div>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">1</div>
                    Dados de Entrega
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Nome Completo</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500/50 p-4 rounded-2xl outline-none transition-all dark:text-white font-bold"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Telefone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500/50 p-4 rounded-2xl outline-none transition-all dark:text-white font-bold"
                        placeholder="Seu WhatsApp"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Endereço de Entrega</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500/50 p-4 rounded-2xl outline-none transition-all dark:text-white font-bold"
                        placeholder="Rua, Bairro, Cidade"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-black dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">2</div>
                    Pagamento
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      ...(checkoutType === 'whatsapp' ? [{ id: 'whatsapp', name: 'WhatsApp (Acordar com Vendedor)', icon: MessageCircle }] : []),
                      { id: 'multicaixa', name: 'Multicaixa Express', icon: CreditCard },
                      { id: 'transferencia', name: 'Transferência Bancária', icon: Globe },
                      { id: 'entrega', name: 'Pagamento na Entrega', icon: Truck }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => handlePaymentChange(method.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.paymentMethod === method.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <method.icon size={20} />
                          <span className="font-bold">{method.name}</span>
                        </div>
                        {formData.paymentMethod === method.id && <CheckCircle size={20} />}
                      </button>
                    ))}
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="dark:text-white">Kz {total.toLocaleString('pt-AO')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-zinc-500">Entrega</span>
                      <span className="text-emerald-500">Grátis</span>
                    </div>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="flex justify-between items-end">
                      <span className="font-black dark:text-white">Total</span>
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">Kz {total.toLocaleString('pt-AO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Pagamento</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Siga as instruções abaixo para concluir seu pedido</p>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[32px] border-2 border-zinc-100 dark:border-zinc-800 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">IBAN para Transferência</span>
                      {copied === 'iban' && <span className="text-[10px] font-bold text-emerald-500 animate-bounce">Copiado!</span>}
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 group">
                      <code className="flex-1 font-mono font-bold text-sm md:text-base dark:text-white">{IBAN}</code>
                      <button 
                        onClick={() => copyToClipboard(IBAN, 'iban')}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-purple-600 transition-colors"
                      >
                        {copied === 'iban' ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Número Multicaixa Express</span>
                      {copied === 'express' && <span className="text-[10px] font-bold text-emerald-500 animate-bounce">Copiado!</span>}
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <code className="flex-1 font-mono font-bold text-lg dark:text-white">{EXPRESS}</code>
                      <button 
                        onClick={() => copyToClipboard(EXPRESS, 'express')}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-purple-600 transition-colors"
                      >
                        {copied === 'express' ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Enviar Comprovativo</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`p-8 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${receiptFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 bg-zinc-50 dark:bg-zinc-900'}`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${receiptFile ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                        {receiptFile ? <Check size={32} /> : <Upload size={32} />}
                      </div>
                      <div className="text-center">
                        <p className="font-black dark:text-white">
                          {receiptFile ? receiptFile.name : 'Clique ou arraste a foto do depósito'}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                          Formatos aceitos: JPG, PNG (Máx 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-12 rounded-[40px] border-2 border-purple-500/20 text-center space-y-8">
                <div className="relative mx-auto w-24 h-24">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-purple-600">
                    <Smartphone size={32} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-black dark:text-white tracking-tight">Estamos checando...</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xs mx-auto">
                    Recebemos o seu comprovativo. Nossa equipe está verificando o pagamento agora mesmo.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                    <Loader2 size={28} className="animate-spin" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-tight">
                      Verificação em curso
                    </p>
                    <p className="text-xs text-emerald-600/60 dark:text-emerald-400/40 font-bold">
                      Você será notificado assim que o pagamento for comprovado.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={onOrderComplete}
                  className="px-8 py-4 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-sm hover:bg-zinc-50 transition-all active:scale-95"
                >
                  Voltar para a Loja
                </button>
              </div>
            </div>
          ) : null}
        </div>

          {(step === 2 || step === 3) && !success && (
            <div className="sticky bottom-0 p-6 md:p-8 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-8 z-10">
              <button 
                onClick={handleConfirmOrder}
                disabled={isUploading}
                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${checkoutType === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'} ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Enviando...
                  </>
                ) : checkoutType === 'whatsapp' ? (
                  <>
                    <MessageCircle size={24} />
                    Enviar Pedido via WhatsApp
                  </>
                ) : step === 2 ? (
                  <>
                    <ArrowLeft size={24} className="rotate-180" />
                    Próximo Passo
                  </>
                ) : (
                  <>
                    <ShieldCheck size={24} />
                    Enviar Comprovativo
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
