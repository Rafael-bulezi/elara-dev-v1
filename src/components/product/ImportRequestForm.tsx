import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { modalVariants } from '../../utils/animations';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto w-full h-full">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden border border-zinc-200 shadow-2xl relative"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">
                    Pedir Importação
                  </h2>
                  <p className="text-zinc-500 font-medium">
                    Descreva o item que você deseja trazer para Angola.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                    Nome do Item
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MacBook Pro M2, Tênis Nike Jordan..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5A189A]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                    Descrição Detalhada
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Especifique cor, tamanho, modelo exato, link de referência se houver..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5A189A]/50 transition-all resize-none custom-scrollbar"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                      Orçamento (Kz/USD)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 50.000 Kz"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5A189A]/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                      WhatsApp de Contacto
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+244..."
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5A189A]/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                    Imagem de Referência (Opcional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors group overflow-hidden relative">
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
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-zinc-400 group-hover:text-[#5A189A] transition-colors mb-2" />
                        <p className="text-sm text-zinc-500 font-medium">
                          Adicionar foto do produto
                        </p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5A189A] hover:bg-[#4a1380] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg shadow-[#5A189A]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        A Enviar...
                      </>
                    ) : (
                      'Enviar Pedido'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImportRequestForm;
