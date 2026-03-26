import React from 'react';

interface PriceCardProps {
  title: string;
  price: number;
  unit: string;
  currencySymbol: string;
  trend?: 'up' | 'down' | 'neutral'; // Simplified for this demo
  subtext?: string;
  accentColor?: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({ 
  title, 
  price, 
  unit, 
  currencySymbol, 
  subtext,
  accentColor = "border-l-4 border-amber-400" 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 ${accentColor}`}>
      <div className="text-slate-500 text-sm font-medium mb-1 tracking-wide">{title}</div>
      <div className="flex items-baseline">
        <span className="text-sm font-semibold text-slate-400 mr-1">{currencySymbol}</span>
        <span className="text-3xl font-bold text-slate-800 tabular-nums">
          {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs font-medium text-slate-400 ml-1">/{unit}</span>
      </div>
      {subtext && (
        <div className="mt-2 text-xs text-slate-400">
          {subtext}
        </div>
      )}
    </div>
  );
};
