import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Newspaper,
  Radar,
  Search,
  Users,
  Waypoints,
} from 'lucide-react';

type SourceItem = {
  layer: '源头' | '小圈' | '公开社区' | '放大';
  name: string;
  alpha: number;
  noise: number;
  speed: number;
  note: string;
};

type DomainKey = 'AI' | '金融' | '地缘政治' | '消费趋势';

type DomainConfig = {
  summary: string;
  sources: SourceItem[];
  workflow: string[];
};

const domains: Record<DomainKey, DomainConfig> = {
  AI: {
    summary: '最早信号通常来自论文预印本、代码仓库、研究员账号和开发者社区。',
    sources: [
      { layer: '源头', name: 'arXiv / 论文预印本', alpha: 95, noise: 40, speed: 95, note: '新方法、新 benchmark、新方向最早公开处之一' },
      { layer: '源头', name: 'GitHub / package 发布 / commit', alpha: 92, noise: 45, speed: 92, note: '模型、工具、接口变化会先体现在代码和 release' },
      { layer: '小圈', name: 'Discord / Slack / 研究群', alpha: 90, noise: 55, speed: 96, note: '实验结果、经验、传闻和工程细节传播很快' },
      { layer: '公开社区', name: 'X / Hacker News / Reddit', alpha: 78, noise: 70, speed: 88, note: '最早的大范围可见讨论层' },
      { layer: '放大', name: 'YouTube / Newsletter / 博客', alpha: 58, noise: 35, speed: 60, note: '解释、拆解、二次传播强' },
    ],
    workflow: ['盯论文预印本与代码 release', '跟研究员与维护者账号', '看开发者社区复现与踩坑', '最后再看媒体/视频总结'],
  },
  金融: {
    summary: '最强 alpha 常来自监管文件、公司公告、链上和市场微结构信号，而不是财经媒体首页。',
    sources: [
      { layer: '源头', name: '监管文件 / 公司公告 / 财报', alpha: 96, noise: 25, speed: 90, note: '硬信息，能直接改变预期' },
      { layer: '源头', name: '链上 / 航运 / 招聘 / 供应链数据', alpha: 91, noise: 50, speed: 87, note: '属于可验证但门槛较高的替代数据' },
      { layer: '小圈', name: 'Telegram / Discord / 私域群', alpha: 88, noise: 80, speed: 97, note: '极快，但真假混杂' },
      { layer: '公开社区', name: 'X / 专业论坛', alpha: 73, noise: 82, speed: 93, note: '题材和情绪扩散非常快' },
      { layer: '放大', name: '财经媒体 / 大V 解读', alpha: 45, noise: 40, speed: 55, note: '确认和放大，不一定最早' },
    ],
    workflow: ['先看硬文件和原始数据', '再看细分圈子的先手讨论', '用市场价格与成交验证', '最后才看大众叙事'],
  },
  地缘政治: {
    summary: '早期信号多来自当地目击者、OSINT 社群、卫星图和半封闭频道。',
    sources: [
      { layer: '源头', name: '当地目击者 / 官方通报 / 原始视频', alpha: 93, noise: 78, speed: 98, note: '极快，但真假和上下文问题很大' },
      { layer: '源头', name: '卫星图 / 航班 / 船舶 / 地理定位', alpha: 95, noise: 35, speed: 75, note: '验证力强，时效略滞后于一手爆料' },
      { layer: '小圈', name: 'Telegram / 地区频道 / OSINT 群', alpha: 90, noise: 85, speed: 99, note: '冲突和突发最早发酵地之一' },
      { layer: '公开社区', name: 'X / Reddit', alpha: 72, noise: 88, speed: 92, note: '全网开始看到，但也最容易失真' },
      { layer: '放大', name: '主流媒体 / 调查机构', alpha: 42, noise: 30, speed: 45, note: '核实和归因阶段' },
    ],
    workflow: ['先收集原始视频和地理线索', '交叉验证卫星/航班/官方数据', '筛掉情绪传播与重复搬运', '最后再参考主流报道定性'],
  },
  消费趋势: {
    summary: '新品、梗、潮流常先在创作者和小群体中爆点，再被算法大面积放大。',
    sources: [
      { layer: '源头', name: '小众创作者 / 品牌测试 / 社群反馈', alpha: 84, noise: 55, speed: 86, note: '早期用户反馈和口碑在这层出现' },
      { layer: '小圈', name: 'Discord / Reddit 小组 / 私域群', alpha: 80, noise: 62, speed: 88, note: '会更早看到复购、吐槽、破解玩法' },
      { layer: '公开社区', name: 'TikTok / Instagram / X', alpha: 68, noise: 76, speed: 94, note: '一旦算法接住，就会迅速扩散' },
      { layer: '放大', name: 'YouTube / 媒体榜单 / 大博主', alpha: 38, noise: 35, speed: 50, note: '形成大众认知和购买冲动' },
    ],
    workflow: ['盯早期创作者和评论区', '看小圈复购与吐槽', '监测平台外溢速度', '最后才看榜单与媒体总结'],
  },
};

const layerMeta = {
  源头: { icon: Database, hint: '最接近事实，通常最早，但更难读。' },
  小圈: { icon: Users, hint: '高密度、高速度，也高噪音。' },
  公开社区: { icon: Radar, hint: '最早的大范围可见层。' },
  放大: { icon: Newspaper, hint: '解释、确认、扩散，不一定最早。' },
};

function cls(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cls('rounded-3xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-3">{children}</div>;
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cls('font-semibold tracking-tight text-slate-900', className)}>{children}</h2>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cls('p-6 pt-3', className)}>{children}</div>;
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' }) {
  const styles = {
    default: 'bg-slate-900 text-white border-slate-900',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-300',
  };

  return <span className={cls('inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium', styles[variant])}>{children}</span>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full bg-slate-700"
        />
      </div>
    </div>
  );
}

function FlowArrow() {
  return <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />;
}

export default function App() {
  const [selected, setSelected] = useState<DomainKey>('AI');
  const [query, setQuery] = useState('');
  const data = domains[selected];

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.sources;
    return data.sources.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.layer.toLowerCase().includes(q) ||
        s.note.toLowerCase().includes(q)
    );
  }, [data.sources, query]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-[1.6fr_1fr]"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-2 text-white">
                  <Waypoints className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Alpha 信息地图</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    看最新信息从哪里最先冒出来，如何扩散，以及不同领域该去哪盯。
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(domains) as DomainKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelected(k)}
                    className={cls(
                      'rounded-2xl border px-4 py-2 text-sm font-medium transition',
                      selected === k
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="grid items-center gap-3 sm:grid-cols-4">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索平台、层级、特征…"
                    className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500"
                  />
                </div>
                <div className="text-sm text-slate-600 sm:col-span-2">
                  <span className="font-medium">当前领域：</span> {selected} · {domains[selected].summary}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">先记住这条主链路</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge>源头数据</Badge>
                <FlowArrow />
                <Badge variant="secondary">小圈传播</Badge>
                <FlowArrow />
                <Badge variant="outline">公开社区</Badge>
                <FlowArrow />
                <Badge variant="secondary">大众放大</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                真正的 alpha 往往更早，但更乱；越接近大众平台，越容易看到，但通常更晚。
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">信号层级图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredSources.map((source, idx) => {
                  const meta = layerMeta[source.layer];
                  const Icon = meta.icon;

                  return (
                    <motion.div
                      key={source.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-xl bg-slate-100 p-2">
                              <Icon className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold">{source.name}</h3>
                            <Badge variant="outline">{source.layer}</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{source.note}</p>
                          <p className="text-xs text-slate-500">{meta.hint}</p>
                        </div>
                        <div className="min-w-40 space-y-2 lg:w-44">
                          <ScoreBar label="Alpha" value={source.alpha} />
                          <ScoreBar label="速度" value={source.speed} />
                          <ScoreBar label="噪音" value={source.noise} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredSources.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    没找到匹配项，试试搜 GitHub、Telegram、X、卫星图、监管文件 这类关键词。
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">普通人 Alpha 雷达系统</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm leading-6 text-slate-700">
                  <div>
                    <p className="mb-2 font-semibold">推荐结构：4 层就够</p>
                    <div className="grid gap-2">
                      <p><span className="font-medium">第 1 层：</span>8–15 个源头信号源（官网、GitHub、论文、公告页）</p>
                      <p><span className="font-medium">第 2 层：</span>20–40 个高质量账号/作者/研究者</p>
                      <p><span className="font-medium">第 3 层：</span>3–8 个垂直社区（Reddit / Discord / 论坛 / 频道）</p>
                      <p><span className="font-medium">第 4 层：</span>2–5 个总结源（newsletter / YouTube / 媒体）</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">每天 15 分钟流程</p>
                    <div className="space-y-2">
                      <p><span className="font-medium">前 5 分钟：</span>先扫源头层，只看新增、release、公告、论文标题。</p>
                      <p><span className="font-medium">中间 5 分钟：</span>扫作者和社区，看哪些话题重复出现 2 次以上。</p>
                      <p><span className="font-medium">后 5 分钟：</span>把值得追的条目丢进稍后读或笔记，最多保留 3 条深挖。</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">验证规则</p>
                    <div className="space-y-2">
                      <p>同一条信号，至少满足 <span className="font-medium">两处独立来源</span>，其中一处最好是源头。</p>
                      <p>把信息分成：<span className="font-medium">事实</span>、<span className="font-medium">解释</span>、<span className="font-medium">预测</span>，不要混着看。</p>
                      <p>只有“重复出现 + 可验证 + 影响够大”的信号，才算值得行动的 alpha。</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">实战盯盘顺序</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.workflow.map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                        {i + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <AlertTriangle className="h-5 w-5" /> 常见误区
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm leading-6 text-slate-700">
                  <p><span className="font-semibold">误区 1：</span>哪里人最多，哪里就最早。实际上最大平台通常负责放大，不负责最早产生。</p>
                  <p><span className="font-semibold">误区 2：</span>越早越好。越早通常意味着更高噪音，需要更强验证能力。</p>
                  <p><span className="font-semibold">误区 3：</span>只看一个平台。真正有效的方法是把源头、小圈、公开社区串起来交叉验证。</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">一句话原则</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-700">
                  找 alpha，不是找“最大的平台”，而是找：<span className="font-semibold">离源头最近的人、数据和小圈子</span>。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}