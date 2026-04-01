import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Bell, Moon, LogOut, Camera, CheckCircle, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType, logout } from '../firebase';
import { UserProfile } from '../types';

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
    displayName: userProfile?.displayName || '',
    phoneNumber: userProfile?.phoneNumber || '',
    address: userProfile?.address || '',
    bio: userProfile?.bio || ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("ProfileSettingsView: handleImageUpload: File selected", file);
    if (!file || !userProfile) {
      console.log("ProfileSettingsView: handleImageUpload: No file or user profile", { file: !!file, userProfile: !!userProfile });
      return;
    }

    setIsUploading(true);
    setError(null);
    console.log("ProfileSettingsView: handleImageUpload: Starting upload for", file.name);

    try {
      const storageRef = ref(storage, `avatars/${userProfile.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("ProfileSettingsView: handleImageUpload: Upload progress", progress);
        },
        (error) => {
          console.error('ProfileSettingsView: handleImageUpload: Upload error', error);
          setIsUploading(false);
          setError('Erro ao fazer upload da imagem. Tente novamente.');
          setTimeout(() => setError(null), 3000);
        },
        async () => {
          console.log("ProfileSettingsView: handleImageUpload: Upload completed");
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("ProfileSettingsView: handleImageUpload: Download URL obtained", downloadURL);
          
          // Update Firestore immediately
          await updateDoc(doc(db, 'users', userProfile.uid), {
            photoURL: downloadURL,
            avatar: downloadURL
          });
          
          onUpdateProfile({ photoURL: downloadURL, avatar: downloadURL });
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error('ProfileSettingsView: handleImageUpload: Catch error', error);
      setIsUploading(false);
      setError('Erro ao processar imagem. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), formData);
      onUpdateProfile(formData);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
      setError('Erro ao atualizar perfil. Tente novamente.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft size={24} className="text-zinc-700 dark:text-zinc-300" />
        </button>
        <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Configurações</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-500/5 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-[40px] overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl relative">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                      <Loader2 size={32} className="text-purple-500 animate-spin" />
                    </div>
                  ) : userProfile?.photoURL || userProfile?.avatar ? (
                    <img src={userProfile.photoURL || userProfile.avatar} alt={userProfile.displayName || userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 p-4 bg-purple-600 text-white rounded-2xl shadow-xl hover:bg-purple-700 transition-all active:scale-90 border-4 border-white dark:border-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={20} />
                </button>
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-black dark:text-white">{userProfile?.displayName}</h3>
                <p className="text-zinc-500 font-bold flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} />
                  {userProfile?.email}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg border border-purple-100 dark:border-purple-800">
                    {userProfile?.role === 'seller' ? 'Vendedor Verificado' : 'Comprador'}
                  </span>
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
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
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
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-zinc-500 uppercase tracking-widest px-1">Bio / Descrição</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all resize-none"
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

          <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[40px] border border-rose-100 dark:border-rose-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black text-rose-600 dark:text-rose-400">Encerrar Sessão</h4>
              <p className="text-sm font-bold text-rose-500/70">Deseja sair da sua conta em todos os dispositivos?</p>
            </div>
            <button 
              onClick={logout}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={22} />
              Sair
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 space-y-8">
            <h4 className="text-xl font-black dark:text-white uppercase tracking-widest text-center">Preferências</h4>
            
            <div className="space-y-4">
              {[
                { icon: Bell, label: 'Notificações', desc: 'Alertas de pedidos e chat', active: true },
                { icon: Shield, label: 'Privacidade', desc: 'Gerenciar visibilidade', active: false },
                { icon: Moon, label: 'Tema Escuro', desc: 'Alternar modo de visualização', active: true }
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-purple-600 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <h5 className="font-black text-sm dark:text-white">{item.label}</h5>
                      <p className="text-[10px] font-bold text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-purple-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
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
