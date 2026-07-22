import React, { useState } from 'react';
import { X, Upload, Loader2, Globe, Package, FileText, Banknote, Phone, ImageIcon } from 'lucide-react';
import { createImportRequest } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface ImportRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; budget: string; whatsapp: string }) => Promise<void>;
  userProfile?: UserProfile | null;
}

const ImportRequestForm = ({ isOpen, onClose, onSubmit, userProfile }: ImportRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    whatsapp: '',
    image: null as File | null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dbData = {
        item_name: formData.name,
        description: formData.description,
        budget: formData.budget,
        whatsapp: formData.whatsapp,
        image_url: null, // Skip image upload for MVP
        buyer_id: userProfile?.uid || null,
      };

      console.log("Submitting to Supabase:", dbData);
      const response = await createImportRequest(dbData);
      console.log("Supabase Success Response:", response);

      await onSubmit(formData); // This triggers the success toast in App.tsx
      onClose();
    } catch (error: unknown) {
      console.error("Supabase Submission Error:", error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao enviar pedido: ${message}\n\nDetalhes: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const inputClasses = "w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-purple-400 focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-[108px] md:pt-0 md:items-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-[460px] overflow-hidden shadow-2xl">

        {/* Header — matches AuthModal style */}
        <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 px-6 pt-8 pb-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Globe size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Pedir Importação
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            Descreva o item que você deseja trazer para Angola.
          </p>
        </div>

        {/* Body — overlaps header like AuthModal */}
        <div className="relative -mt-5 bg-white rounded-t-3xl px-6 pt-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="relative">
              <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                placeholder="Nome do item (ex: MacBook Pro M2)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div className="relative">
              <FileText size={15} className="absolute left-3.5 top-3.5 text-zinc-400" />
              <textarea
                required
                rows={3}
                placeholder="Descrição detalhada: cor, tamanho, modelo, link de referência..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputClasses} resize-none custom-scrollbar pt-3`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Banknote size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Orçamento (Kz/USD)"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp +244..."
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-zinc-200 border-dashed rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors group overflow-hidden relative">
                {formData.image ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-white font-bold text-sm tracking-wide">Trocar Imagem</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-4 pb-4">
                    <ImageIcon size={24} className="text-zinc-400 group-hover:text-purple-600 transition-colors mb-1.5" />
                    <p className="text-sm text-zinc-500 font-medium">Adicionar foto de referência</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Opcional</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white font-black py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  A Enviar...
                </>
              ) : (
                <>
                  <Upload size={16} /> Enviar Pedido
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportRequestForm;
