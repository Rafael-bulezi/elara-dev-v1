import React, { useState } from 'react';
import { ArrowLeft, Globe, Zap, ShieldCheck, Send, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface ImportQuoteViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
}

const ImportQuoteView = ({ userProfile, onBack }: ImportQuoteViewProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    productLink: '',
    description: '',
    quantity: '1',
    budget: '',
    urgency: 'normal' as 'low' | 'normal' | 'high'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .insert({
          product_name: formData.productName,
          product_link: formData.productLink,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          budget: formData.budget,
          urgency: formData.urgency,
          user_id: userProfile.uid,
          user_email: userProfile.email,
          user_name: userProfile.displayName,
          status: 'pending'
        });

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-4xl font-black tracking-tight mb-4">Solicitação Enviada!</h2>
        <p className="text-xl text-zinc-500 font-medium mb-10 leading-relaxed">
          Recebemos sua solicitação de cotação. Nossa equipe de importação analisará os detalhes e entrará em contato em até 24 horas úteis.
        </p>
        <button 
          onClick={onBack}
          className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700" />
        </button>
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Solicitar Importação</h2>
          <p className="text-zinc-500 font-medium">Traga qualquer produto da China ou Europa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-200 shadow-xl shadow-zinc-500/5 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Nome do Produto</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: iPhone 15 Pro Max 256GB"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Link do Produto (Opcional)</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                  <input 
                    type="url" 
                    placeholder="https://alibaba.com/product/..."
                    value={formData.productLink}
                    onChange={(e) => setFormData({...formData, productLink: e.target.value})}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Quantidade</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Orçamento Estimado (Kz)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 500.000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Descrição Detalhada</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Descreva cor, modelo, especificações técnicas ou qualquer detalhe importante..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Urgência</label>
                <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
                  {(['low', 'normal', 'high'] as const).map((u) => (
                    <button 
                      key={u}
                      type="button"
                      onClick={() => setFormData({...formData, urgency: u})}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.urgency === u ? 'bg-white text-purple-600 shadow-lg' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      {u === 'low' ? 'Baixa' : u === 'normal' ? 'Normal' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={24} />
                  Enviar Solicitação
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-purple-500/20">
            <h3 className="text-2xl font-black mb-6 leading-tight">Como Funciona?</h3>
            <div className="space-y-6">
              {[
                { icon: Zap, title: 'Análise', desc: 'Analisamos seu pedido e buscamos os melhores fornecedores.' },
                { icon: Globe, title: 'Cotação', desc: 'Enviamos o valor total incluindo taxas e frete.' },
                { icon: ShieldCheck, title: 'Pagamento', desc: 'Você paga com segurança via Elara Escrow.' },
                { icon: Send, title: 'Entrega', desc: 'Receba seu produto em casa com rastreio total.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <step.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">{step.title}</h4>
                    <p className="text-sm text-white/70 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-100 p-8 rounded-[40px] border border-zinc-200">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertCircle size={24} />
              <h4 className="font-black uppercase tracking-widest text-sm">Aviso Importante</h4>
            </div>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">
              O tempo médio de entrega para importações é de 15 a 25 dias úteis após a confirmação do pagamento. Todas as taxas alfandegárias já estão inclusas em nossas cotações finais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportQuoteView;
