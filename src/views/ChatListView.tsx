import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Clock, User, Trash2, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chat, UserProfile } from '../types';

interface ChatListViewProps {
  userProfile: UserProfile | null;
  onSelectChat: (chat: Chat) => void;
}

const ChatListView = ({ userProfile, onSelectChat }: ChatListViewProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [userProfile.uid])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats((data || []).map((chat) => ({
          id: chat.id,
          participants: chat.participants,
          lastMessage: chat.last_message,
          lastMessageAt: new Date(chat.updated_at).getTime(),
          lastSenderId: chat.last_sender_id,
          participantNames: chat.participant_names,
          participantAvatars: chat.participant_avatars,
          unreadCount: chat.unread_count
        } as unknown as Chat)));
      }
      setLoading(false);
    };

    fetchChats();

    const channel = supabase
      .channel('chats_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats',
        filter: `participants=cs.{${userProfile.uid}}`
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
      
      if (error) throw error;
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Erro ao excluir conversa.');
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipantName = chat.participantNames?.[chat.participants.find(p => p !== userProfile?.uid) || ''] || '';
    return otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Mensagens</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Converse com compradores e vendedores</p>
        </div>
      </div>

      <div className="relative group mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar conversas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500/50 py-4 pl-14 pr-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
            <MessageCircle size={48} />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Nenhuma mensagem</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">Suas conversas aparecerão aqui quando você entrar em contato com alguém.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredChats.map((chat) => {
            const otherParticipantId = chat.participants.find(p => p !== userProfile?.uid) || '';
            const otherParticipantName = chat.participantNames?.[otherParticipantId] || 'Usuário';
            const otherParticipantAvatar = chat.participantAvatars?.[otherParticipantId] || '';
            const unreadCount = chat.unreadCount?.[userProfile?.uid || ''] || 0;

            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`bg-white dark:bg-zinc-900 p-4 md:p-5 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4 ${unreadCount > 0 ? 'border-purple-500/50 bg-purple-50/30 dark:bg-purple-900/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-purple-500/30'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow-sm">
                    <img src={getAvatarUrl(otherParticipantAvatar, otherParticipantName)} alt={otherParticipantName} className="w-full h-full object-cover" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-lg animate-pulse">
                      {unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-black text-zinc-900 dark:text-white truncate ${unreadCount > 0 ? 'text-lg' : 'text-base'}`}>{otherParticipantName}</h3>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(chat.lastMessageAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {chat.lastSenderId === userProfile?.uid && <CheckCheck size={14} className="text-purple-500 flex-shrink-0" />}
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-zinc-900 dark:text-white font-black' : 'text-zinc-500 dark:text-zinc-400 font-medium'}`}>
                        {chat.lastMessage || 'Iniciou uma conversa'}
                      </p>
                    </div>
                    {confirmDeleteId === chat.id ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-xs font-bold"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors font-bold text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(chat.id); }}
                        className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatListView;
