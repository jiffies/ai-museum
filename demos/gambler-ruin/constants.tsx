import React from 'react';
import { StorySection } from './types';

export const STORY_SECTIONS: StorySection[] = [
  {
    id: 'intro',
    title: '47天：从巅峰到归零',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed text-slate-600">
          47天，从赚4400万美金到亏光本钱。麻吉大哥的命运，并非偶然，而是决定于数学定律——<span className="font-bold text-slate-900">“赌徒破产定理”</span>。
        </p>
        <p className="text-slate-600">
          要理解这个败局，我们需要剥开运气的迷雾，看透三个核心概念：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2 text-slate-700 font-medium">
          <li>随机漫步 (Random Walk)</li>
          <li>吸收壁 (Absorbing Barrier)</li>
          <li>负漂移 (Negative Drift)</li>
        </ul>
      </div>
    ),
    config: {
      mode: 'intro',
      volatility: 0.5,
      drift: 0,
      startingCapital: 50,
      barrierPosition: 0,
      showWall: false,
      showCliff: false,
      simulationSpeed: 1,
      leverage: 1,
    },
  },
  {
    id: 'random_walk',
    title: '① 随机漫步：醉汉的脚步',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          想象一个醉汉在直线上游走。他抛着硬币，正面则进一步（赚钱），反面则退一步（亏钱）。
        </p>
        <p className="text-slate-600">
          麻吉大哥的经历，本质上就是醉汉的脚步。短期内，他可能连续抛出正面，资产暴涨到6000万。
        </p>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>关键点：</strong> 短期的暴涨并不代表能力，往往只是概率分布中的“连续正面”，也就是运气。
          </p>
        </div>
      </div>
    ),
    config: {
      mode: 'random_walk',
      volatility: 2,
      drift: 0,
      startingCapital: 50,
      barrierPosition: 0,
      showWall: false,
      showCliff: false,
      simulationSpeed: 2,
      leverage: 1,
    },
  },
  {
    id: 'absorbing_barrier',
    title: '② 吸收壁：不对称的战争',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          醉汉行走的这条路，两边是不对称的。
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="bg-slate-200 px-2 py-1 rounded text-xs font-bold uppercase mt-1">Market</span>
            <span className="text-sm text-slate-600"><strong>上方是高墙（市场）：</strong> 由市场的总资金构成。它是无限的，你不可能赢光它。</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase mt-1">You</span>
            <span className="text-sm text-slate-600"><strong>下方是悬崖（你）：</strong> 这是你的本金归零点。它是有限的。</span>
          </li>
        </ul>
        <p className="text-slate-800 font-medium italic border-l-4 border-slate-300 pl-4">
          “只要时间够长，你 100% 掉下悬崖。”
        </p>
      </div>
    ),
    config: {
      mode: 'absorbing_barrier',
      volatility: 3,
      drift: 0,
      startingCapital: 50,
      barrierPosition: 100, // Visual distance
      showWall: true,
      showCliff: true,
      simulationSpeed: 3,
      leverage: 1,
    },
  },
  {
    id: 'negative_drift',
    title: '③ 负漂移：悬崖边的强风',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">
          如果是公平的抛硬币，掉下去可能很久。但在赌场和合约中，有<strong>手续费</strong>和<strong>滑点</strong>。
        </p>
        <p className="text-slate-600">
          这就像悬崖边刮起了一股强风，一直把醉汉往悬崖方向吹。
        </p>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <h4 className="text-amber-800 font-bold text-sm mb-1">数学期望为负 (EV &lt; 0)</h4>
          <p className="text-xs text-amber-700">
             麻吉大哥这轮仅资金费就支付了数十万美金。这股风，一直在推着他走向归零。
          </p>
        </div>
      </div>
    ),
    config: {
      mode: 'negative_drift',
      volatility: 2,
      drift: -0.4, // Strong negative drift
      startingCapital: 50,
      barrierPosition: 100,
      showWall: true,
      showCliff: true,
      simulationSpeed: 3,
      leverage: 1,
    },
  },
  {
    id: 'leverage_death',
    title: '为何输光？杠杆与心理',
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">为何4400万浮盈不收手？最终归零？</p>
        <div className="space-y-3 text-sm">
          <div className="border-l-2 border-red-400 pl-3">
            <strong className="block text-slate-800">a. 加杠杆</strong>
            <span className="text-slate-500">杠杆将“悬崖”拉到了眼前。25倍杠杆意味着只要反向波动4%，你就掉下去了。</span>
          </div>
          <div className="border-l-2 border-orange-400 pl-3">
            <strong className="block text-slate-800">b. 鞅策略 (Martingale)</strong>
            <span className="text-slate-500">亏损加仓。用有限的“子弹”对抗无限的市场，必然导致资金链断裂。</span>
          </div>
          <div className="border-l-2 border-purple-400 pl-3">
            <strong className="block text-slate-800">c. 心理账户</strong>
            <span className="text-slate-500">觉得那是“赌场的钱”，输了不可惜。</span>
          </div>
        </div>
      </div>
    ),
    config: {
      mode: 'leverage',
      volatility: 8, // High volatility due to leverage
      drift: -0.8, // Fees kill you faster
      startingCapital: 30, // Effectively closer to zero relative to swing size
      barrierPosition: 100,
      showWall: true,
      showCliff: true,
      simulationSpeed: 2,
      leverage: 5,
    },
  },
  {
    id: 'conclusion',
    title: '人生算法：做时间的朋友',
    content: (
      <div className="space-y-6">
        <p className="text-slate-600">普通人如何避免破产，实现财富增长？</p>
        <div className="grid gap-3">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex gap-3">
            <div className="bg-emerald-200 text-emerald-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">参与“正期望”</h4>
              <p className="text-xs text-emerald-700 mt-1">定投指数，持有EV&gt;0资产。让风往山上吹。</p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
            <div className="bg-blue-200 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">远离“吸收壁”</h4>
              <p className="text-xs text-blue-700 mt-1">活着是第一要务。拒绝高杠杆，别让波动把你逼下悬崖。</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-3">
            <div className="bg-slate-200 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">设定“停止线”</h4>
              <p className="text-xs text-slate-700 mt-1">赚钱要变现，亏钱要止损。</p>
            </div>
          </div>
        </div>
      </div>
    ),
    config: {
      mode: 'positive_drift',
      volatility: 0.8,
      drift: 0.3, // Positive drift
      startingCapital: 50,
      barrierPosition: 100,
      showWall: true,
      showCliff: true,
      simulationSpeed: 2,
      leverage: 1,
    },
  },
];