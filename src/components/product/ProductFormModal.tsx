import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Tag, DollarSign, Package, LayoutGrid, Image as ImageIcon, Save, AlertCircle, Upload, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Product, UserProfile, ProductCondition, ProductOrigin } from '../../types';
import { validateImageFile, compressImage } from '../../lib/imageUtils';
import ImageWithFallback from '../common/ImageWithFallback';
import { allCategories } from '../../constants';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => void;
  product?: Product | null;
  userProfile: UserProfile | null;
}

const categoriesList: string[] = allCategories.map((c: { name: string }) => c.name);

const originsList: ProductOrigin[] = ['Local', 'China', 'Europa'];

const ProductFormModal = ({ isOpen, onClose, onSubmit, product, userProfile }: ProductFormModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildEmptyForm = useCallback((): Partial<Product> => ({
    title: '',
    price: 0,
    category: categoriesList[0],
    description: '',
    image: '',
    stock: 1,
    status: 'pending',
    condition: 'Novo',
    origin: 'Local',
    isImport: false,
    sellerPhone: userProfile?.phoneNumber || userProfile?.phone || ''
  }), [userProfile]);

  const [formData, setFormData] = useState<Partial<Product>>(buildEmptyForm());

  // Reset form every time the modal opens or product changes.
  useEffect(() => {
    if (isOpen) {
      setFormData(product ? { ...product } : buildEmptyForm());
      setError(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen, product, buildEmptyForm]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setError(null);

    // Validate type + size
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error ?? 'Ficheiro inválido.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Compress to medium size for product images (1000px, ~200 KB target)
      setUploadProgress(30);
      const compressed = await compressImage(file, 'medium');

      setUploadProgress(55);
      const fileName = `${userProfile.uid}/${Date.now()}.webp`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressed, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      setUploadProgress(90);

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrlData.publicUrl }));
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title || formData.title.trim().length < 3) return 'O título deve ter pelo menos 3 caracteres.';
    if (!formData.price || formData.price <= 0) return 'Introduza um preço válido maior que 0.';
    if (!formData.stock || formData.stock < 0) return 'O stock não pode ser negativo.';
    if (!formData.description || formData.description.trim().length < 10) return 'A descrição deve ter pelo menos 10 caracteres.';
    if (!formData.image || !formData.image.trim()) return 'Adicione uma imagem do produto.';
    if (!formData.category) return 'Selecione uma categoria.';
    if (!formData.condition) return 'Selecione a condição do produto.';
    if (!formData.sellerPhone || formData.sellerPhone.replace(/\D/g, '').length < 9) return 'Introduza um número de telefone válido com pelo menos 9 dígitos.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 z-[100] flex items-start justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] md:rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative flex flex-col overflow-hidden border border-zinc-200 md:my-auto"
      >
        <div className="p-8 md:p-12 border-b border-zinc-100 flex items-center justify-between flex-shrink-0 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <p className="text-zinc-500 font-medium">Preencha os detalhes para publicar no marketplace</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-3xl transition-all"
          >
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-8 md:p-12 space-y-12 flex-1">
            {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-rose-50 text-rose-600 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-4 border border-rose-100"
            >
              <AlertCircle size={24} />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Informações Básicas</label>
                <div className="space-y-6">
                  <div className="relative group">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="Título do Produto"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative group">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                      <input 
                        required
                        type="number" 
                        placeholder="Preço (Kz)"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="relative group">
                      <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                      <input 
                        required
                        type="tel" 
                        placeholder="WhatsApp (Ex: 923...)"
                        value={formData.sellerPhone}
                        onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                        className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                    <input 
                      required
                      type="number" 
                      placeholder="Estoque disponível"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Configurações & Categoria</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none" size={20} />
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all appearance-none cursor-pointer"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative group">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none" size={20} />
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value as ProductCondition})}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Novo">Produto Novo</option>
                      <option value="Semi-novo">Semi-novo</option>
                      <option value="Usado">Produto Usado</option>
                    </select>
                  </div>

                  <div className="relative group">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none" size={20} />
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value as ProductOrigin})}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all appearance-none cursor-pointer"
                    >
                      {originsList.map(o => (
                        <option key={o} value={o}>{o === 'Local' ? 'Produção Local' : o === 'China' ? 'Importado da China' : 'Importado da Europa'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {userProfile?.role === 'admin' && (
                    <label className="flex items-center gap-4 w-full bg-zinc-50 border-2 border-zinc-100 py-5 px-8 rounded-[24px] cursor-pointer hover:border-zinc-900 transition-all group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={formData.isImport}
                          onChange={(e) => setFormData({...formData, isImport: e.target.checked})}
                          className="w-6 h-6 rounded-lg border-2 border-zinc-300 checked:bg-zinc-900 transition-all appearance-none cursor-pointer"
                        />
                        {formData.isImport && <CheckCircle size={14} className="absolute text-white pointer-events-none" />}
                      </div>
                      <span className="text-sm font-black text-zinc-900 uppercase tracking-widest">Produto de Importação</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Mídia do Produto</label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200 overflow-hidden flex items-center justify-center group relative cursor-pointer hover:border-zinc-900 transition-all"
                >
                  {isUploading ? (
                    <div className="text-center space-y-6 w-full px-12">
                      <div className="relative w-20 h-20 mx-auto">
                        <Loader2 size={80} className="text-zinc-900 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-black">{Math.round(uploadProgress)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="bg-zinc-900 h-full" 
                        />
                      </div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Enviando para o servidor...</p>
                    </div>
                  ) : formData.image ? (
                    <>
                      <ImageWithFallback
                        src={formData.image}
                        alt="Preview do produto"
                        objectFit="cover"
                        className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white text-zinc-900 p-6 rounded-[32px] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                          <Upload size={32} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                        <Upload size={32} className="text-zinc-900" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-1">Carregar Imagem</p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Arraste ou clique para selecionar</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 px-4">
                  <div className="h-px flex-1 bg-zinc-100" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">OU</span>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>

                <div className="relative group">
                  <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={20} />
                  <input
                    type="url"
                    placeholder="Link da imagem (URL)"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-5 pl-16 pr-8 rounded-[24px] text-zinc-900 font-black text-lg outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Descrição do Produto</label>
            <textarea 
              required
              rows={6}
              placeholder="Descreva todos os detalhes, especificações e o que torna este produto único..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 py-6 px-8 rounded-[32px] text-zinc-900 font-medium text-lg outline-none transition-all resize-none placeholder:text-zinc-400 leading-relaxed"
            />
          </div>

          <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 flex items-start gap-6">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">Aviso de Segurança</h4>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                Para garantir a qualidade do nosso marketplace, todos os novos anúncios passam por uma revisão manual da nossa equipe. Seu produto ficará visível assim que for aprovado.
              </p>
            </div>
          </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl p-8 md:px-12 md:py-8 border-t border-zinc-100 z-10 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-8">
            <button 
              type="submit"
              disabled={isUploading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-6 rounded-[32px] font-black text-xl uppercase tracking-widest shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              {isUploading ? <Loader2 size={28} className="animate-spin" /> : <Save size={28} />}
              {isUploading ? 'Processando Mídia...' : product ? 'Atualizar Anúncio' : 'Publicar Agora'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductFormModal;

