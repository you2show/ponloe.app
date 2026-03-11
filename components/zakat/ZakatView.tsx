import { HugeiconsIcon } from '@hugeicons/react';
import { Calculator01Icon, Dollar01Icon, InformationCircleIcon, RefreshIcon, ArrowRight01Icon, Coins01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';


export const ZakatView: React.FC = () => {
  // Default values based on current market (approximate)
  const [goldPrice, setGoldPrice] = useState<number>(65); // USD per gram
  const [silverPrice, setSilverPrice] = useState<number>(0.8); // USD per gram
  
  // Assets
  const [cash, setCash] = useState<number>(0);
  const [bankSavings, setBankSavings] = useState<number>(0);
  const [goldValue, setGoldValue] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [otherAssets, setOtherAssets] = useState<number>(0);
  
  // Liabilities
  const [debts, setDebts] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);

  const [totalNetAssets, setTotalNetAssets] = useState<number>(0);
  const [zakatPayable, setZakatPayable] = useState<number>(0);
  const [nisabThreshold, setNisabThreshold] = useState<number>(0);
  const [isEligible, setIsEligible] = useState<boolean>(false);

  // Nisab is roughly 85g of Gold
  useEffect(() => {
    setNisabThreshold(85 * goldPrice);
  }, [goldPrice]);

  const calculate = () => {
    const totalAssets = cash + bankSavings + goldValue + investments + otherAssets;
    const totalLiabilities = debts + expenses;
    const net = totalAssets - totalLiabilities;
    
    setTotalNetAssets(net);

    if (net >= nisabThreshold) {
      setIsEligible(true);
      setZakatPayable(net * 0.025); // 2.5%
    } else {
      setIsEligible(false);
      setZakatPayable(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300 font-khmer">
      {/* Header */}
      <div className="bg-emerald-900 text-white pb-12 pt-8 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
               <HugeiconsIcon icon={Calculator01Icon} strokeWidth={1.5} className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">គណនាហ្សាកាត់</h1>
            <p className="text-emerald-200 text-sm">Zakat Calculator</p>
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
         
         {/* Nisab Info Card */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
               <HugeiconsIcon icon={Coins01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div>
               <h3 className="font-bold text-gray-900 text-sm mb-1">កម្រិតនីសូប (Nisab Threshold)</h3>
               <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  ហ្សាកាត់គឺជាកាតព្វកិច្ច នៅពេលដែលទ្រព្យសម្បត្តិសរុបរបស់អ្នកមានតម្លៃលើសពីមាស ៨៥ ក្រាម (ប្រហែល ${nisabThreshold.toLocaleString()}) និងគ្រប់ខួបមួយឆ្នាំ។
               </p>
               <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">តម្លៃមាសបច្ចុប្បន្ន ($/g):</label>
                  <input 
                    type="number" 
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(Number(e.target.value))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
               </div>
            </div>
         </div>

         {/* Calculator Form */}
         <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-6">
                
                {/* Assets Section */}
                <div>
                   <h3 className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> ទ្រព្យសម្បត្តិ (Assets)
                   </h3>
                   <div className="space-y-4">
                      <div className="group">
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">សាច់ប្រាក់ក្នុងដៃ</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input type="number" value={cash || ''} onChange={e => setCash(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="0.00" />
                         </div>
                      </div>
                      <div className="group">
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">ប្រាក់ក្នុងធនាគារ</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input type="number" value={bankSavings || ''} onChange={e => setBankSavings(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="0.00" />
                         </div>
                      </div>
                      <div className="group">
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">តម្លៃមាស/ប្រាក់ ដែលមាន</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input type="number" value={goldValue || ''} onChange={e => setGoldValue(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="0.00" />
                         </div>
                      </div>
                      <div className="group">
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">ភាគហ៊ុន / វិនិយោគ</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input type="number" value={investments || ''} onChange={e => setInvestments(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="0.00" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Liabilities Section */}
                <div>
                   <h3 className="text-red-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-red-500 rounded-full"></span> បំណុល (Liabilities)
                   </h3>
                   <div className="space-y-4">
                      <div className="group">
                         <label className="block text-sm font-medium text-gray-700 mb-1.5">បំណុលដែលត្រូវសងភ្លាមៗ</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input type="number" value={debts || ''} onChange={e => setDebts(Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-red-900" placeholder="0.00" />
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                   onClick={calculate}
                   className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                   <HugeiconsIcon icon={Calculator01Icon} strokeWidth={1.5} className="w-5 h-5" /> គណនាឥឡូវនេះ
                </button>

            </div>

            {/* Result Section */}
            <div className="bg-gray-50 p-6 border-t border-gray-100">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-medium">ទ្រព្យសម្បត្តិសុទ្ធ (Net Assets):</span>
                  <span className="font-bold text-gray-900 font-mono text-lg">${totalNetAssets.toLocaleString()}</span>
               </div>
               
               <div className={`mt-4 p-5 rounded-2xl border-2 text-center ${isEligible ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-100 border-gray-200'}`}>
                  {isEligible ? (
                     <>
                        <p className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-2">ចំនួនហ្សាកាត់ដែលត្រូវបង់</p>
                        <p className="text-4xl font-bold text-emerald-600 font-mono tracking-tight">${zakatPayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p className="text-emerald-600/70 text-xs mt-2">(2.5% នៃទ្រព្យសម្បត្តិសុទ្ធ)</p>
                     </>
                  ) : (
                     <>
                        <p className="text-gray-500 font-bold">មិនទាន់ដល់កម្រិតជាប់ហ្សាកាត់ទេ</p>
                        <p className="text-gray-400 text-xs mt-1">ទ្រព្យសម្បត្តិរបស់អ្នកតិចជាងកម្រិតនីសូប (${nisabThreshold.toLocaleString()})</p>
                     </>
                  )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
