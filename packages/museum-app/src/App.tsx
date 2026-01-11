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

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-[#E8E4DF] p-6 cursor-pointer
                 hover:shadow-md hover:border-[#D4AF37] transition-all duration-200"
    >
      {/* 类型标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{typeConfig.icon}</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {typeConfig.label}
        </span>
        {demo.featured && (
          <span className="text-xs text-[#D4AF37] bg-yellow-50 px-2 py-1 rounded">
            精选
          </span>
        )}
      </div>

      {/* 标题和描述 */}
      <h3 className="text-lg font-semibold text-[#3E2723] mb-2 font-serif">
        {demo.title}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {demo.description}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {demo.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs text-[#3E2723] bg-[#FAF9F6] px-2 py-1 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 日期 */}
      <div className="text-xs text-gray-400">{demo.createdAt}</div>
    </div>
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
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#3E2723] font-serif">
              🏛️ AI Museum
            </h1>

            {/* 搜索框 */}
            <div className="flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="搜索Demo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E4DF] rounded-lg
                           focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            {/* 视图切换 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 类型筛选 */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveType(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeType === null
                ? 'bg-[#D4AF37] text-white'
                : 'bg-white text-[#3E2723] border border-[#E8E4DF] hover:border-[#D4AF37]'
            }`}
          >
            全部 ({demos.length})
          </button>
          {(Object.keys(DEMO_TYPE_CONFIG) as DemoType[]).map((type) => {
            const count = demos.filter((d) => d.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeType === type
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-white text-[#3E2723] border border-[#E8E4DF] hover:border-[#D4AF37]'
                }`}
              >
                {DEMO_TYPE_CONFIG[type].icon} {DEMO_TYPE_CONFIG[type].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo列表 */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        {filteredDemos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的Demo
          </div>
        ) : (
          <>
            {/* 结果统计 */}
            <div className="text-sm text-gray-500 mb-4">
              共 {filteredDemos.length} 个Demo
              {filteredDemos.length > PAGE_SIZE && (
                <span>，第 {currentPage} 页</span>
              )}
            </div>

            {/* Demo网格/列表 */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDemos.map((demo) => (
                  <DemoCard key={demo.slug} demo={demo} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedDemos.map((demo) => (
                  <DemoCard key={demo.slug} demo={demo} />
                ))}
              </div>
            )}

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
      <footer className="bg-white border-t border-[#E8E4DF] py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          AI Museum - 收集和展示AI Demo的博物馆
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
