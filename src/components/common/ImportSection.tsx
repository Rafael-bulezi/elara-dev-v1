import React from 'react';
import { Globe, Zap, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ImportSectionProps {
  onOpenQuote: () => void;
}

const ImportSection = ({ onOpenQuote }: ImportSectionProps) => (
  <section className="container mx-auto px-4 py-8 md:py-16">
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-[40px] md:rounded-[64px] p-8 md:p-20 relative overflow-hidden shadow-2xl shadow-purple-500/30">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20 relative z-10">
        <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-white text-xs md:text-sm font-black uppercase tracking-widest">
            <Globe size={16} />
            Importação Direta
          </div>
          
          <h2 className="text-3xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter">
            NÃO ENCONTROU O QUE PROCURAVA?
          </h2>
          
          <p className="text-white/80 text-lg md:text-2xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Nós importamos qualquer produto da China ou Europa diretamente para você com as melhores taxas do mercado.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button 
              onClick={onOpenQuote}
              className="w-full sm:w-auto bg-white text-purple-600 px-10 py-5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Solicitar Cotação
              <ArrowLeft size={20} className="rotate-180" />
            </button>
            <div className="flex items-center gap-6 text-white/60">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-black text-white">15-20</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Dias úteis</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Seguro</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6">
          {[
            { icon: Zap, title: 'Rápido', desc: 'Processamento em 24h' },
            { icon: ShieldCheck, title: 'Seguro', desc: 'Garantia de entrega' },
            { icon: Globe, title: 'Global', desc: 'China & Europa' },
            { icon: Zap, title: 'Suporte', desc: 'Acompanhamento real' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[48px] space-y-4 hover:bg-white/20 transition-all group">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-xl">
                <item.icon size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-black text-white">{item.title}</h4>
                <p className="text-sm md:text-base text-white/60 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ImportSection;

