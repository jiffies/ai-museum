import React, { useEffect, useState } from 'react';
import { MarketData, CalculatorState } from './types';
import { fetchMarketData } from './services/dataService';
import { PriceCard } from './components/PriceCard';
import { Calculator } from './components/Calculator';

const App: React.FC = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [calcState, setCalcState] = useState<CalculatorState>({
    metal: 'gold',
    unit: 'g',
    amount: '1'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const marketData = await fetchMarketData();
      setData(marketData);
    } catch (err: any) {
      setError(err.message || "无法获取数据，请检查网络或 API Key 设置。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">GoldSync</h1>
          </div>
          
          <button 
            onClick={loadData} 
            disabled={loading}
            className="text-sm text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
             <span className={`${loading ? 'animate-spin' : ''}`}>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
             </span>
             {loading ? '更新中...' : '刷新行情'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 px-1 gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span>数据来源:</span>
            {!data && !error && <span>加载权威数据中...</span>}
            {data?.sources.map((source, i) => (
              source.url ? (
                <a 
                  key={i} 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors flex items-center gap-1 max-w-[150px] truncate"
                  title={source.name}
                >
                  <span className="truncate">{source.name}</span>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  {source.name}
                </span>
              )
            ))}
          </div>
          <div className="whitespace-nowrap">
            更新时间: {data?.last_updated || '--:--'}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Price Cards Grid */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">实时大盘 (Spot Market)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PriceCard 
              title="国际黄金 (Spot Gold)" 
              price={data?.international_gold_usd_oz || 0} 
              unit="oz" 
              currencySymbol="$" 
              subtext="伦敦金 (XAU/USD)"
            />
            <PriceCard 
              title="国内黄金 (China Gold)" 
              price={data?.china_gold_spot_cny_g || 0} 
              unit="g" 
              currencySymbol="¥" 
              subtext="上海金交所 (Au99.99)"
              accentColor="border-l-4 border-amber-500"
            />
             <PriceCard 
              title="国际白银 (Spot Silver)" 
              price={data?.international_silver_usd_oz || 0} 
              unit="oz" 
              currencySymbol="$" 
              subtext="伦敦银 (XAG/USD)"
              accentColor="border-l-4 border-slate-300"
            />
            <PriceCard 
              title="国内白银 (China Silver)" 
              price={data?.china_silver_spot_cny_g || 0} 
              unit="g" 
              currencySymbol="¥" 
              subtext="上海金交所 (Ag)"
              accentColor="border-l-4 border-slate-400"
            />
          </div>
        </section>

        {/* Retail Info */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">消费市场参考 (Retail Market)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gold Retail */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between group hover:border-amber-200 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                   <div className="text-slate-500 text-sm font-medium">黄金·零售价</div>
                </div>
                <div className="text-xs text-slate-400">品牌金店挂牌均价</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">
                  <span className="text-sm font-normal text-slate-400 mr-1">¥</span>
                  {data?.retail_gold_cny_g.toLocaleString(undefined, {minimumFractionDigits: 0})} 
                  <span className="text-sm font-normal text-slate-400 ml-1">/g</span>
                </div>
                <div className="text-xs text-amber-500 mt-1 font-medium">含工艺费</div>
              </div>
            </div>

            {/* Gold Recycle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between group hover:border-emerald-200 transition-colors">
               <div>
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                   <div className="text-slate-500 text-sm font-medium">黄金·回收价</div>
                </div>
                <div className="text-xs text-slate-400">融通/典当/银行</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  <span className="text-sm font-normal text-slate-400 mr-1">¥</span>
                  {data?.recycle_gold_cny_g.toLocaleString(undefined, {minimumFractionDigits: 0})}
                  <span className="text-sm font-normal text-slate-400 ml-1">/g</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                   折扣率: {data ? (((data.recycle_gold_cny_g / data.china_gold_spot_cny_g) - 1) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            {/* Silver Retail */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between group hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                   <div className="text-slate-500 text-sm font-medium">白银·零售价</div>
                </div>
                <div className="text-xs text-slate-400">足银/投资银条</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">
                  <span className="text-sm font-normal text-slate-400 mr-1">¥</span>
                  {data?.retail_silver_cny_g.toLocaleString(undefined, {minimumFractionDigits: 1})} 
                  <span className="text-sm font-normal text-slate-400 ml-1">/g</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">溢价较高</div>
              </div>
            </div>

            {/* Silver Recycle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between group hover:border-emerald-200 transition-colors">
               <div>
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                   <div className="text-slate-500 text-sm font-medium">白银·回收价</div>
                </div>
                <div className="text-xs text-slate-400">大宗/回收商</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  <span className="text-sm font-normal text-slate-400 mr-1">¥</span>
                  {data?.recycle_silver_cny_g.toLocaleString(undefined, {minimumFractionDigits: 1})}
                  <span className="text-sm font-normal text-slate-400 ml-1">/g</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                   折扣率: {data ? (((data.recycle_silver_cny_g / data.china_silver_spot_cny_g) - 1) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section>
          <Calculator state={calcState} onChange={setCalcState} data={data} />
        </section>

      </main>
    </div>
  );
};

export default App;
