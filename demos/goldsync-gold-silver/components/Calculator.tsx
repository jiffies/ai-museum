import React from 'react';
import { CalculatorState, MarketData, MetalType, UnitType } from '../types';

interface CalculatorProps {
  state: CalculatorState;
  onChange: (newState: CalculatorState) => void;
  data: MarketData | null;
}

export const Calculator: React.FC<CalculatorProps> = ({ state, onChange, data }) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange({ ...state, amount: val });
    }
  };

  const amountNum = parseFloat(state.amount) || 0;
  
  // Constants
  const OZ_TO_GRAMS = 31.1035;

  // Calculate Weights in both units
  const weightInGrams = state.unit === 'g' ? amountNum : amountNum * OZ_TO_GRAMS;
  const weightInOz = state.unit === 'oz' ? amountNum : amountNum / OZ_TO_GRAMS;

  // Values Calculation
  let internationalValue = 0;
  let domesticSpotValue = 0;
  let retailValue = 0;
  let recycleValue = 0;

  if (data) {
    if (state.metal === 'gold') {
      internationalValue = weightInOz * data.international_gold_usd_oz * data.usd_cny_rate;
      domesticSpotValue = weightInGrams * data.china_gold_spot_cny_g;
      retailValue = weightInGrams * data.retail_gold_cny_g;
      recycleValue = weightInGrams * data.recycle_gold_cny_g;
    } else {
      internationalValue = weightInOz * data.international_silver_usd_oz * data.usd_cny_rate;
      domesticSpotValue = weightInGrams * data.china_silver_spot_cny_g;
      retailValue = weightInGrams * data.retail_silver_cny_g;
      recycleValue = weightInGrams * data.recycle_silver_cny_g;
    }
  }

  const formatCurrency = (val: number) => 
    val.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          价值计算器
        </h3>
        <span className="text-xs text-slate-400">汇率: {data?.usd_cny_rate}</span>
      </div>

      <div className="p-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Metal Selection */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => onChange({ ...state, metal: 'gold' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                state.metal === 'gold' 
                  ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${state.metal === 'gold' ? 'bg-amber-400' : 'bg-slate-300'}`} />
              黄金 (Gold)
            </button>
            <button
              onClick={() => onChange({ ...state, metal: 'silver' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                state.metal === 'silver' 
                  ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${state.metal === 'silver' ? 'bg-slate-400' : 'bg-slate-300'}`} />
              白银 (Silver)
            </button>
          </div>

          {/* Unit Selection */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => onChange({ ...state, unit: 'g' })}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                state.unit === 'g' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              克 (Gram)
            </button>
            <button
              onClick={() => onChange({ ...state, unit: 'oz' })}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                state.unit === 'oz' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              盎司 (Ounce)
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative">
             <input
              type="text"
              value={state.amount}
              onChange={handleAmountChange}
              className="block w-full rounded-lg border-slate-200 border bg-white py-2.5 pl-4 pr-12 text-slate-900 focus:border-amber-400 focus:ring-amber-400 sm:text-sm font-mono shadow-sm"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-slate-400 sm:text-sm">{state.unit === 'g' ? 'g' : 'oz'}</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-amber-800 font-medium">国际折算总价 (人民币)</span>
            <span className="text-xl font-bold text-amber-600">{formatCurrency(internationalValue)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">国内大盘价 (上海金交所)</span>
                <span className="text-lg font-bold text-slate-700">{formatCurrency(domesticSpotValue)}</span>
             </div>
             
             <div className="p-4 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                 <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-xl flex items-center justify-center ${state.metal === 'gold' ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                 </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{state.metal === 'gold' ? '金' : '银'}店零售估算</span>
                <span className="text-lg font-bold text-slate-700">{formatCurrency(retailValue)}</span>
             </div>

             <div className="p-4 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">回收参考价</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(recycleValue)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
