import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Bell, Moon, LogOut, Camera, CheckCircle, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { getAvatarUrl } from '../utils/avatar';

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

    setIsUploading(true);
    setError(null);

    try {
      console.log('DEBUG - Iniciando upload de avatar (SEM COMPRESSÃO)...');
      
      // Pula a compressão para teste
      const compressedFile = file; 

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${userProfile.uid}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('DEBUG - Caminho do arquivo:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error('DEBUG - Erro no upload de avatar:', uploadError);
        throw uploadError;
      }

      console.log('DEBUG - Upload de avatar concluído.');

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      console.log('DEBUG - URL pública:', publicUrl);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl
        })
        .eq('id', userProfile.uid);

      if (updateError) {
        console.error('DEBUG - Erro ao atualizar perfil:', updateError);
        throw updateError;
      }
      
      onUpdateProfile({ photoURL: publicUrl, avatar: publicUrl });
      setIsUploading(false);
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
      
      // Tenta extrair a mensagem do erro do Supabase
      let errorMessage = 'Erro ao fazer upload da imagem.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(`Erro técnico: ${errorMessage}`);
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
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700" />
        </button>
        <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">Configurações</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-200 shadow-xl shadow-zinc-500/5 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-zinc-100">
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-32 h-32 bg-zinc-100 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                      <Loader2 size={32} className="text-purple-500 animate-spin" />
                    </div>
                  ) : (
                    <img src={getAvatarUrl(userProfile?.photoURL || userProfile?.avatar, userProfile?.displayName || userProfile?.name)} alt={userProfile?.displayName || userProfile?.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 p-4 bg-purple-600 text-white rounded-2xl shadow-xl hover:bg-purple-700 transition-all active:scale-90 border-4 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={20} />
                </button>
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-black">{userProfile?.displayName}</h3>
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
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 font-bold outline-none transition-all resize-none"
              />
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
                  <Save size={24} />
                  Salvar Alterações
                </>
              )}
            </button>
          </form>

          <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black text-rose-600">Encerrar Sessão</h4>
              <p className="text-sm font-bold text-rose-500/70">Deseja sair da sua conta em todos os dispositivos?</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={22} />
              Sair
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-100 p-8 rounded-[40px] border border-zinc-200 space-y-8">
            <h4 className="text-xl font-black uppercase tracking-widest text-center">Preferências</h4>
            
            <div className="space-y-4">
              {[
                { icon: Bell, label: 'Notificações', desc: 'Alertas de pedidos e chat', active: true },
                { icon: Shield, label: 'Privacidade', desc: 'Gerenciar visibilidade', active: false },
                { icon: Moon, label: 'Tema Escuro', desc: 'Alternar modo de visualização', active: true }
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-200 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-purple-600 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <h5 className="font-black text-sm">{item.label}</h5>
                      <p className="text-[10px] font-bold text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-purple-600' : 'bg-zinc-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[40px] text-white border border-white/10 shadow-2xl">
            <h4 className="text-xl font-black mb-6 flex items-center gap-3">
              <Shield size={24} className="text-emerald-500" />
              Segurança
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h5 className="font-black text-sm">Autenticação 2FA</h5>
                  <p className="text-[10px] font-bold text-zinc-500">Ativado via Google</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-black text-sm">
                Alterar Senha
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsView;
