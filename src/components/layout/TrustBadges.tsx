import React from 'react';
import { ShieldCheck, Truck, BadgeCheck, RotateCcw } from 'lucide-react';

interface TrustBadgesProps {
  className?: string;
  compact?: boolean;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ className = '', compact = false }) => {
  const items = [
    { icon: Truck, label: 'Entrega 24-48h', sublabel: 'Em Luanda' },
    { icon: ShieldCheck, label: 'Pagamento seguro', sublabel: '100% protegido' },
    { icon: BadgeCheck, label: 'Vendedores verificados', sublabel: 'Confiança' },
    { icon: RotateCcw, label: 'Devoluções fáceis', sublabel: '7 dias para trocar' },
  ];

  return (
    <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'} ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <item.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{item.label}</p>
            {!compact && <p className="text-xs text-zinc-500">{item.sublabel}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
