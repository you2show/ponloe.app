import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MarketContextProps {
  productContext: {
    image: string;
    name: string;
    price: string;
  };
}

export const MarketContext: React.FC<MarketContextProps> = ({ productContext }) => {
  const { theme } = useTheme();

  return (
    <div className={`p-3 mx-4 mt-4 rounded-xl border flex items-center gap-3 shadow-sm z-10 ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <img src={productContext.image} alt="Product" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1">
        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{productContext.name}</h4>
        <p className="text-emerald-600 font-medium text-sm">{productContext.price}</p>
      </div>
      <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold">
        មើលផលិតផល
      </button>
    </div>
  );
};
