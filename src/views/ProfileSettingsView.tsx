import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, Camera, CheckCircle, Save, Loader2, AlertCircle } from 'lucide-react';
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
      // Avatar: compress to 200 px square, target ~30 KB
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
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700" />
        </button>
        <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Meu Perfil</h2>
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

      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[32px] border border-zinc-200 shadow-xl shadow-zinc-500/5 space-y-8">
          {/* Avatar + Info Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-zinc-100">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
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
                className="absolute -bottom-1 -right-1 p-3 bg-purple-600 text-white rounded-full shadow-xl hover:bg-purple-700 transition-all active:scale-90 border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-black">{displayName}</h3>
              <p className="text-zinc-500 font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} />
                {userProfile?.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                  {userProfile?.role === 'seller' ? 'Vendedor' : 'Comprador'}
                </span>
                {userProfile?.sellerStatus === 'pending' && (
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">Loja Pendente</span>
                )}
                {userProfile?.mixeiroVerified && (
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">Mixeiro Verificado</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Telefone</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Endereço de Entrega</label>
            <div className="relative group">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Bio / Descrição</label>
            <textarea 
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all active:scale-[0.98] font-black"
        >
          <LogOut size={20} />
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsView;
