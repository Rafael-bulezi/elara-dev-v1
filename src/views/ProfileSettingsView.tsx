import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, Camera, CheckCircle, Save, Loader2, AlertCircle, ShoppingBag, Tag, Star, Heart, ShieldCheck, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { getAvatarUrl } from '../utils/avatar';
import { validateImageFile, compressImage } from '../lib/imageUtils';

interface ProfileSettingsViewProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const ProfileSettingsView = ({ userProfile, onBack, onUpdateProfile }: ProfileSettingsViewProps) => {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || userProfile?.name || '',
    phoneNumber: userProfile?.phoneNumber || userProfile?.phone || '',
    address: userProfile?.address || '',
    bio: userProfile?.bio || userProfile?.description || ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setError(null);

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error ?? 'Ficheiro inválido.');
      return;
    }

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 'avatar');
      const fileName = `${userProfile.uid}/${Date.now()}.webp`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressed, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.uid);

      if (updateError) throw updateError;

      onUpdateProfile({ photoURL: publicUrl, avatar: publicUrl });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.displayName,
          phone: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio
        })
        .eq('id', userProfile.uid);

      if (error) throw error;
      onUpdateProfile({
        name: formData.displayName,
        phone: formData.phoneNumber,
        address: formData.address
      });
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  const displayName = userProfile?.displayName || userProfile?.name || 'Usuário';
  const hasAvatar = userProfile?.avatar && userProfile.avatar.trim() !== '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pb-28 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">Meu Perfil</h2>
          <p className="text-xs text-zinc-400 font-medium">Gestão da sua conta e reputação na Elara</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Card & Stats */}
        <div className="bg-white p-6 md:p-8 rounded-[28px] border border-zinc-200 shadow-xl shadow-purple-500/5 space-y-6">
          
          {/* Avatar + Primary Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100">
            <div className="relative group shrink-0">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-purple-100 shadow-xl relative">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                    <Loader2 size={32} className="text-purple-500 animate-spin" />
                  </div>
                ) : hasAvatar ? (
                  <img src={getAvatarUrl(userProfile?.avatar, displayName)} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-4xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 p-2.5 bg-purple-600 text-white rounded-full shadow-xl hover:bg-purple-700 transition-all active:scale-90 border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 truncate">{displayName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  Comprador Ouro
                </span>
              </div>

              <p className="text-zinc-500 font-medium text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} className="text-zinc-400 shrink-0" />
                <span className="truncate">{userProfile?.email}</span>
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                  {userProfile?.role === 'seller' ? 'Vendedor Verificado' : 'Comprador Ativo'}
                </span>
                {userProfile?.mixeiroVerified && (
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                    <ShieldCheck size={11} /> Mixeiro Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid ("Oomph" section) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <p className="text-lg font-black text-zinc-900 leading-none">8</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Compras</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Tag size={16} />
              </div>
              <p className="text-lg font-black text-zinc-900 leading-none">{userProfile?.role === 'seller' ? '14' : '0'}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Vendas</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star size={16} className="fill-amber-500 text-amber-500" />
              </div>
              <p className="text-lg font-black text-zinc-900 leading-none">4.9 ★</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Reputação</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Award size={16} />
              </div>
              <p className="text-lg font-black text-zinc-900 leading-none">100%</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Confiança</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[28px] border border-zinc-200 shadow-xl shadow-zinc-500/5 space-y-6">
          <h4 className="text-base font-black text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <User size={18} className="text-purple-600" /> Informações Pessoais
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider px-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500 focus:bg-white py-3 pl-12 pr-4 rounded-xl text-zinc-900 font-bold text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider px-1">Telefone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500 focus:bg-white py-3 pl-12 pr-4 rounded-xl text-zinc-900 font-bold text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider px-1">Endereço de Entrega</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500 focus:bg-white py-3 pl-12 pr-4 rounded-xl text-zinc-900 font-bold text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider px-1">Bio / Apresentação</label>
            <textarea 
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500 focus:bg-white py-3 px-4 rounded-xl text-zinc-900 font-bold text-sm outline-none transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all active:scale-[0.98] font-bold text-sm"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsView;
