import React, { useState } from 'react';
import { ChevronRight, MapPin, ShoppingBag, Shield, Truck, Star, X, ArrowRight } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (city?: string) => void;
  onOpenAuth: () => void;
}

const CITIES = [
  { name: 'Luanda', delivery: 'Entrega rápida 24–48h', fast: true },
  { name: 'Benguela', delivery: '2–5 dias úteis', fast: false },
  { name: 'Huíla', delivery: '2–5 dias úteis', fast: false },
  { name: 'Huambo', delivery: '2–5 dias úteis', fast: false },
  { name: 'Cabinda', delivery: '2–5 dias úteis', fast: false },
  { name: 'Malanje', delivery: '3–6 dias úteis', fast: false },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onOpenAuth }) => {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('Luanda');

  const skip = () => onComplete(selectedCity);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setTimeout(() => setStep(3), 250);
  };

  const handleCreateAccount = () => {
    onComplete(selectedCity);
    setTimeout(() => onOpenAuth(), 100);
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col overflow-y-auto">
        {/* Skip */}
        <div className="flex justify-end p-4">
          <button onClick={skip} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors">
            Pular <X size={14} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 max-w-sm mx-auto w-full text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
            <ShoppingBag size={28} className="text-white" />
          </div>

          <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-2">
            Tudo o que precisa,<br />
            <span className="text-purple-600">entregue em Angola.</span>
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            Milhares de produtos de vendedores angolanos, com entrega rápida e pagamento seguro.
          </p>

          {/* Value props */}
          <div className="w-full space-y-3 mb-10 text-left">
            {[
              { icon: <Truck size={18} className="text-purple-600" />, title: 'Entrega rápida em Luanda', sub: 'Receba hoje ou amanhã' },
              { icon: <Shield size={18} className="text-purple-600" />, title: 'Pagamento seguro', sub: 'Pague com Multicaixa Express, Referência ou na entrega' },
              { icon: <Star size={18} className="text-purple-600" />, title: 'Vendedores verificados', sub: 'Mais confiança e segurança nas suas compras' },
            ].map((v) => (
              <div key={v.title} className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">{v.icon}</div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{v.title}</p>
                  <p className="text-xs text-zinc-400">{v.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(2)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
            Começar a comprar <ArrowRight size={16} />
          </button>
          <button onClick={handleCreateAccount}
            className="w-full mt-3 border-2 border-zinc-200 hover:border-zinc-300 text-zinc-700 font-black py-4 rounded-2xl text-sm transition-colors">
            Criar conta
          </button>
          <button onClick={skip} className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium">
            Continuar como visitante
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-1.5 pb-6">
          {[1,2,3].map(n => (
            <div key={n} className={`h-1.5 rounded-full transition-all ${n === step ? 'bg-purple-600 w-6' : 'bg-zinc-200 w-1.5'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <button onClick={() => setStep(1)} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
            <ChevronRight size={14} className="rotate-180" /> Voltar
          </button>
          <div className="flex gap-1.5">
            {[1,2,3].map(n => <div key={n} className={`h-1.5 rounded-full transition-all ${n === step ? 'bg-purple-600 w-6' : n < step ? 'bg-purple-300 w-1.5' : 'bg-zinc-200 w-1.5'}`} />)}
          </div>
          <button onClick={skip} className="text-xs font-bold text-zinc-400 hover:text-zinc-600">Pular</button>
        </div>

        <div className="flex-1 px-6 pt-6 pb-10 max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900">Onde vamos entregar?</h2>
              <p className="text-xs text-zinc-500">Selecione a sua cidade para ver prazos correctos.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input type="text" placeholder="Pesquisar cidade ou província"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-4 pr-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors" />
          </div>

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Sugestões</p>
          <div className="space-y-2">
            {CITIES.map((city) => (
              <button key={city.name} onClick={() => handleCitySelect(city.name)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${selectedCity === city.name ? 'border-purple-600 bg-purple-50' : 'border-zinc-100 hover:border-zinc-300 bg-white'}`}>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{city.name}</p>
                  <p className={`text-xs font-medium ${city.fast ? 'text-purple-600' : 'text-zinc-400'}`}>{city.delivery}</p>
                </div>
                {city.fast && (
                  <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">RÁPIDA</span>
                )}
              </button>
            ))}
          </div>

          <button onClick={() => setStep(3)}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Account (optional)
  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-zinc-100">
        <button onClick={() => setStep(2)} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
          <ChevronRight size={14} className="rotate-180" /> Voltar
        </button>
        <div className="flex gap-1.5">
          {[1,2,3].map(n => <div key={n} className={`h-1.5 rounded-full transition-all ${n === step ? 'bg-purple-600 w-6' : n < step ? 'bg-purple-300 w-1.5' : 'bg-zinc-200 w-1.5'}`} />)}
        </div>
        <button onClick={skip} className="text-xs font-bold text-zinc-400 hover:text-zinc-600">Pular</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 max-w-sm mx-auto w-full text-center">
        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-5">
          <Shield size={24} className="text-purple-600" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Crie a sua conta</h2>
        <p className="text-sm text-zinc-500 mb-2">Tenha acesso a benefícios exclusivos.</p>

        <div className="w-full text-left space-y-2.5 mb-8 mt-4">
          {[
            'Acompanhe os seus pedidos',
            'Checkout mais rápido',
            'Guarde os seus produtos favoritos',
            'Ofertas exclusivas para si',
          ].map(b => (
            <div key={b} className="flex items-center gap-3 text-sm text-zinc-700">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <ChevronRight size={11} className="text-purple-600" />
              </div>
              {b}
            </div>
          ))}
        </div>

        {/* Google */}
        <button onClick={handleCreateAccount}
          className="w-full flex items-center justify-center gap-3 border-2 border-zinc-200 hover:border-zinc-400 text-zinc-800 font-bold py-3.5 rounded-2xl text-sm transition-colors mb-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar com Google
        </button>
        <button onClick={handleCreateAccount}
          className="w-full flex items-center justify-center gap-3 border-2 border-zinc-200 hover:border-zinc-400 text-zinc-800 font-bold py-3.5 rounded-2xl text-sm transition-colors mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continuar com Facebook
        </button>

        <div className="relative w-full my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Ou</span></div>
        </div>

        <button onClick={handleCreateAccount}
          className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl text-sm transition-colors">
          Entrar com e-mail ou telefone
        </button>
        <button onClick={skip} className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium">
          Continuar como visitante
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
