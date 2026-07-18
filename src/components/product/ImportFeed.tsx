import React, { useEffect, useState } from 'react';
import { Globe, Clock, Package, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';

const timeAgo = (dateStr: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'Agora mesmo';
  if (diff < 60) return `Publicado há ${diff} minuto(s)`;
  if (diff < 1440) return `Publicado há ${Math.floor(diff / 60)} hora(s)`;
  return `Publicado há ${Math.floor(diff / 1440)} dia(s)`;
};

interface ImportRequest {
  id: string;
  item_name: string;
  description: string;
  budget: string;
  whatsapp: string;
  created_at: string;
}

const ImportFeed = () => {
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('import_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching import requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleInterested = (req: ImportRequest) => {
    // Clean phone number: remove all non-numeric characters
    const cleanPhone = req.whatsapp.replace(/\D/g, '');
    const text = `Olá! Vi o seu pedido de *${req.item_name}* no Elara e gostaria de ajudar com a importação.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black dark:text-white tracking-tight">Marketplace de Importações</h2>
          <p className="text-sm font-medium text-zinc-500">Pedidos abertos aguardando propostas de Micheiros</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <Package className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-6" />
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Nenhum pedido pendente</h3>
          <p className="text-zinc-500 font-medium max-w-xs mx-auto">Novas oportunidades de importação aparecerão aqui assim que os compradores postarem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-500/5 hover:border-purple-500/30 transition-all flex flex-col group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-[0.2em] mb-2 block">Oportunidade de Importação</span>
                  <h3 className="text-2xl font-black dark:text-white leading-tight capitalize group-hover:text-purple-600 transition-colors">{req.item_name}</h3>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-xl">
                  <Globe size={20} className="text-zinc-400" />
                </div>
              </div>
              
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 line-clamp-3 flex-grow leading-relaxed">
                {req.description}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 font-mono">Orçamento</p>
                  <p className="font-black text-lg text-emerald-600 dark:text-emerald-400">{req.budget}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 font-mono flex items-center justify-end gap-1">
                    <Clock size={12} /> Freshness
                  </p>
                  <p className="font-bold text-xs text-zinc-600 dark:text-zinc-300 uppercase">
                    {timeAgo(req.created_at)}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleInterested(req)}
                className="w-full bg-[#5A189A] hover:bg-[#4a1380] text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all active:scale-95 shadow-lg shadow-purple-500/20 flex justify-center items-center gap-3"
              >
                <MessageCircle size={18} />
                Interessado no WhatsApp
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportFeed;
