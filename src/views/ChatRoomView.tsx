import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, Phone, Video, User, CheckCheck, ShieldCheck } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Chat, Message, UserProfile } from '../types';

interface ChatRoomViewProps {
  chat: Chat;
  userProfile: UserProfile | null;
  onBack: () => void;
}

const ChatRoomView = ({ chat, userProfile, onBack }: ChatRoomViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherParticipantId = chat.participants.find(p => p !== userProfile?.uid) || '';
  const otherParticipantName = chat.participantNames?.[otherParticipantId] || 'Usuário';
  const otherParticipantAvatar = chat.participantAvatars?.[otherParticipantId] || '';

  useEffect(() => {
    if (!chat.id) return;

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chat.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(messagesData);
      setLoading(false);
      
      // Mark as read
      if ((chat.unreadCount?.[userProfile?.uid || ''] || 0) > 0) {
        updateDoc(doc(db, 'chats', chat.id), {
          [`unreadCount.${userProfile?.uid}`]: 0
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chat.id, userProfile?.uid, chat.unreadCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        chatId: chat.id,
        senderId: userProfile.uid,
        text: messageText,
        createdAt: serverTimestamp(),
        read: false
      });

      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        lastSenderId: userProfile.uid,
        [`unreadCount.${otherParticipantId}`]: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-[80] flex flex-col">
      <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow-sm">
              {otherParticipantAvatar ? (
                <img src={otherParticipantAvatar} alt={otherParticipantName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <User size={24} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-zinc-900 dark:text-white leading-tight">{otherParticipantName}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors hidden sm:flex">
            <Phone size={20} />
          </button>
          <button className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors hidden sm:flex">
            <Video size={20} />
          </button>
          <button className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="flex justify-center">
          <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-2xl flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            Conversa Protegida por Escrow
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.map((msg, i) => {
          const isMe = msg.senderId === userProfile?.uid;
          const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && showAvatar && (
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 border border-white dark:border-zinc-900 shadow-sm">
                  {otherParticipantAvatar ? (
                    <img src={otherParticipantAvatar} alt={otherParticipantName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User size={16} />
                    </div>
                  )}
                </div>
              )}
              {!isMe && !showAvatar && <div className="w-8" />}
              
              <div className={`max-w-[80%] md:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 md:p-5 rounded-3xl shadow-sm relative group ${isMe ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-lg border border-zinc-100 dark:border-zinc-700'}`}>
                  <p className="text-sm md:text-base font-medium leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end text-white/60' : 'justify-start text-zinc-400'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {msg.createdAt?.toDate().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck size={14} className={msg.read ? 'text-emerald-400' : 'text-white/40'} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4 max-w-5xl mx-auto">
          <button type="button" className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all active:scale-95">
            <ImageIcon size={22} />
          </button>
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Digite sua mensagem..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-purple-500/50 py-4 px-6 rounded-2xl text-zinc-900 dark:text-white font-bold outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center"
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoomView;
