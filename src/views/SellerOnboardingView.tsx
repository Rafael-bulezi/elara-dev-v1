import React, { useState, useRef } from 'react';
import { ArrowLeft, Store, User, Phone, MapPin, CreditCard, FileText, CheckCircle, Loader2, AlertCircle, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface SellerOnboardingViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onComplete: (updates: Partial<UserProfile>) => void;
}

const SellerOnboardingView = ({ userProfile, onBack, onComplete }: SellerOnboardingViewProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    legalName: userProfile?.name || '',
    phone: userProfile?.phone || '',
    shopName: userProfile?.shopName || '',
    address: userProfile?.address || '',
    bankDetails: userProfile?.bankDetails || ''
  });

  const handleUploadId = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;
    setIsUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.uid}/seller_id_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      setIdDocumentUrl(publicUrl);
    } catch (err) {
      console.error('Error uploading ID:', err);
      setError('Erro ao carregar o documento. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      setError('Você precisa estar logado para se tornar vendedor.');
      return;
    }
    if (!formData.shopName.trim() || !formData.legalName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.bankDetails.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!acceptedTerms) {
      setError('Aceite os termos e condições para continuar.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.legalName,
          phone: formData.phone,
          address: formData.address,
          shop_name: formData.shopName,
          bank_details: formData.bankDetails,
          id_document_url: idDocumentUrl,
          role: 'seller',
          seller_status: 'pending',
          verification_level: 'basic'
        })
        .eq('id', userProfile.uid);

      if (updateError) throw updateError;

      onComplete({
        name: formData.legalName,
        phone: formData.phone,
        address: formData.address,
        shopName: formData.shopName,
        bankDetails: formData.bankDetails,
        idDocumentUrl: idDocumentUrl || undefined,
        role: 'seller',
        sellerStatus: 'pending',
        verificationLevel: 'basic'
      });
    } catch (err) {
      console.error('Error becoming seller:', err);
      setError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700" />
        </button>
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Vender na Elara</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Preencha os dados para ativar o seu painel de vendedor.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[40px] border border-zinc-200 shadow-xl shadow-zinc-500/5 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Nome Completo (igual ao documento)</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Telefone (com WhatsApp)</label>
            <div className="relative group">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Nome da Loja / Marca</label>
            <div className="relative group">
              <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Endereço Completo (Província + Cidade + Detalhes)</label>
            <div className="relative group">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Dados Bancários / Multicaixa para Recebimento</label>
            <div className="relative group">
              <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="text"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                placeholder="IBAN ou número Multicaixa"
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Documento de Identidade (Bilhete ou Passaporte)</label>
          <input type="file" ref={fileInputRef} onChange={handleUploadId} accept="image/*" className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-zinc-50 border-2 border-zinc-200 hover:border-purple-500/50 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            {idDocumentUrl ? 'Alterar documento' : 'Carregar foto do documento'}
          </button>
          {idDocumentUrl && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
              <CheckCircle size={16} />
              Documento carregado
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <input
            id="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 accent-purple-600"
          />
          <label htmlFor="terms" className="text-sm font-bold text-zinc-600 leading-relaxed">
            Li e aceito os Termos e Condições para Vendedores da Elara. Confirmo que as informações são verdadeiras e autorizo a verificação da minha identidade.
          </label>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 text-sm font-bold flex items-start gap-3">
          <FileText size={18} />
          <p>A sua loja ficará com status <span className="font-black">Pendente</span> até revisão. Pode começar a adicionar produtos, mas eles só serão visíveis após aprovação.</p>
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
              <CheckCircle size={24} />
              Enviar Solicitação
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SellerOnboardingView;
