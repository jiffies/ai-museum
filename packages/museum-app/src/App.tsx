/**
 * Input: index.json（demo索引数据）
 * Output: 主应用UI
 * 地位: 应用的根组件，包含路由和状态管理
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { DemoMetadata, DemoType, ViewMode, DemoIndex } from './types';
import { DEMO_TYPE_CONFIG } from './types';
import { createSearchIndex, searchDemos } from './utils/search';
import { Pagination } from './components/common/Pagination';
import { DemoDetail } from './pages/DemoDetail';

const PAGE_SIZE = 12;

/**
 * Demo卡片组件
 */
function DemoCard({ demo }: { demo: DemoMetadata }) {
  const typeConfig = DEMO_TYPE_CONFIG[demo.type];

  const handleClick = () => {
    // 所有类型都直接跳转到内容页面
    window.location.href = `/demos/${demo.slug}/`;
  };

  // 为不同类型配置图标颜色
  const getIconBg = (type: DemoType) => {
    switch (type) {
      case 'web-app':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'code-snippet':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'markdown':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'chat':
        return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
      case 'research':
        return 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  const iconMap: Record<DemoType, string> = {
    'web-app': 'language',
    'code-snippet': 'code',
    'markdown': 'description',
    'chat': 'chat',
    'research': 'science',
  };

  return (
    <article
      onClick={handleClick}
      className="flex flex-col h-full bg-white dark:bg-zinc-800 rounded-2xl
                 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
                 dark:shadow-none border border-gray-100 dark:border-gray-800
                 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]
                 dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1
                 transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="p-7 flex flex-col flex-grow relative">
        {/* 类型标签 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getIconBg(demo.type)}`}>
              <span className="material-icons text-base">{iconMap[demo.type]}</span>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {typeConfig.label}
            </span>
          </div>
          {demo.featured && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded">
              精选
            </span>
          )}
        </div>

        {/* 标题和描述 */}
        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-50 mb-3 group-hover:text-amber-600 transition-colors leading-tight">
          {demo.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-light">
          {demo.description}
        </p>

        {/* 标签 */}
        <div className="mt-auto flex flex-wrap gap-2">
          {demo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-md border border-gray-100 dark:border-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/30 dark:bg-zinc-800/20">
        <span className="text-xs text-gray-400 font-medium">{demo.createdAt}</span>
        <span className="flex items-center text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          查看详情 <span className="material-icons text-sm ml-1">arrow_forward</span>
        </span>
      </div>
    </article>
  );
}

/**
 * 首页组件 - 展示Demo列表
 */
function HomePage() {
  const [demos, setDemos] = useState<DemoMetadata[]>([]);
  const [filteredDemos, setFilteredDemos] = useState<DemoMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<DemoType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 重置页码当筛选条件变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeType]);

  // 计算分页数据
  const paginatedDemos = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredDemos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDemos, currentPage]);

  // 从index.json加载数据
  useEffect(() => {
    async function loadDemos() {
      try {
        const response = await fetch('/index.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data: DemoIndex = await response.json();
        setDemos(data.demos);
        setFilteredDemos(data.demos);
      } catch (err) {
        console.error('加载demos失败:', err);
        setError('加载数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    }

    loadDemos();
  }, []);

  // 创建Fuse.js搜索索引
  const searchIndex = useMemo(() => {
    return demos.length > 0 ? createSearchIndex(demos) : null;
  }, [demos]);

  // 搜索和筛选
  useEffect(() => {
    let result = demos;

    // 类型筛选
    if (activeType) {
      result = result.filter((d) => d.type === activeType);
    }

    // 使用Fuse.js搜索
    if (searchQuery.trim() && searchIndex) {
      const searchResults = searchDemos(searchIndex, searchQuery);
      // 如果有类型筛选，再过滤搜索结果
      if (activeType) {
        result = searchResults.filter((d) => d.type === activeType);
      } else {
        result = searchResults;
      }
    }

    setFilteredDemos(result);
  }, [demos, searchQuery, activeType, searchIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200">
              <span className="material-icons text-2xl">account_balance</span>
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">AI Museum</span>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400 text-lg group-focus-within:text-amber-600 transition-colors">search</span>
              </span>
              <input
                type="text"
                placeholder="搜索demos, snippets, docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 sm:text-sm transition-all shadow-sm hover:shadow-md focus:shadow-md"
              />
            </div>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center px-3 py-1.5 rounded-md transition-all transform ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="material-icons text-sm mr-2">grid_view</span>
              <span className="text-xs font-semibold">网格</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="material-icons text-sm mr-2">view_list</span>
              <span className="text-xs font-semibold">列表</span>
            </button>
          </div>
        </div>
      </header>

      {/* 类型筛选 */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveType(null)}
              className={`group inline-flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeType === null
                  ? 'bg-amber-600 text-white shadow-md hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-600/50 hover:text-amber-600 dark:hover:text-amber-600 shadow-sm hover:shadow-md'
              }`}
            >
              全部
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                activeType === null
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {demos.length}
              </span>
            </button>
            {(Object.keys(DEMO_TYPE_CONFIG) as DemoType[]).map((type) => {
              const count = demos.filter((d) => d.type === type).length;
              if (count === 0) return null;

              const typeConfig = DEMO_TYPE_CONFIG[type];
              const iconMap: Record<DemoType, string> = {
                'web-app': 'language',
                'code-snippet': 'code',
                'markdown': 'description',
                'chat': 'chat',
                'research': 'science',
              };

              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`group inline-flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeType === type
                      ? 'bg-amber-600 text-white shadow-md hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-600/50 hover:text-amber-600 dark:hover:text-amber-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className={`material-icons text-sm mr-2 ${
                    activeType === type
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-amber-600'
                  } transition-colors`}>
                    {iconMap[type]}
                  </span>
                  {typeConfig.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                    activeType === type
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400 dark:text-gray-500 font-medium">
            <span className="material-icons text-sm">filter_list</span>
            <span>共 {filteredDemos.length} 个展品</span>
          </div>
        </div>

      {/* Demo列表 */}
        {filteredDemos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的Demo
          </div>
        ) : (
          <>
            {/* Demo网格/列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedDemos.map((demo) => (
                <DemoCard key={demo.slug} demo={demo} />
              ))}
            </div>

            {/* 分页 */}
            <Pagination
              total={filteredDemos.length}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <span className="material-icons text-gray-400 text-2xl">account_balance</span>
            <span className="text-lg font-display font-bold text-gray-700 dark:text-gray-300">AI Museum</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 flex flex-col md:flex-row md:items-center md:space-x-6 text-center md:text-right">
            <a href="#" className="hover:text-amber-600 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-amber-600 transition-colors">使用条款</a>
            <span>© 2026 AI Museum. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * 根应用组件 - 配置路由
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail/:slug" element={<DemoDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
