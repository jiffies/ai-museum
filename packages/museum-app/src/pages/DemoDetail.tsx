/**
 * Input: URL参数中的demo slug
 * Output: Demo详情页面UI
 * 地位: 展示非Web应用类型demo的详细内容
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { DemoMetadata, DemoIndex } from '../types';
import { DEMO_TYPE_CONFIG } from '../types';

export function DemoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [demo, setDemo] = useState<DemoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDemo() {
      try {
        const response = await fetch('/index.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data: DemoIndex = await response.json();
        const found = data.demos.find((d) => d.slug === slug);

        if (!found) {
          setError('Demo不存在');
        } else {
          setDemo(found);
        }
      } catch (err) {
        console.error('加载demo失败:', err);
        setError('加载失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    }

    loadDemo();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            to="/"
            className="text-[#D4AF37] hover:underline mb-4 inline-block"
          >
            ← 返回首页
          </Link>
          <div className="text-xl text-red-500">{error || 'Demo不存在'}</div>
        </div>
      </div>
    );
  }

  const typeConfig = DEMO_TYPE_CONFIG[demo.type];

  // Web应用类型使用iframe嵌入
  if (demo.type === 'web-app') {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link
              to="/"
              className="text-[#D4AF37] hover:underline"
            >
              ← 返回
            </Link>
            <span className="text-xl">{typeConfig.icon}</span>
            <h1 className="text-xl font-bold text-[#3E2723] font-serif">
              {demo.title}
            </h1>
            <a
              href={`/demos/${demo.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] transition-colors"
            >
              在新窗口打开
            </a>
          </div>
        </header>
        <div className="w-full" style={{ height: 'calc(100vh - 64px)' }}>
          <iframe
            src={`/demos/${demo.slug}/`}
            className="w-full h-full border-0"
            title={demo.title}
          />
        </div>
      </div>
    );
  }

  // 其他类型展示详情
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="bg-white border-b border-[#E8E4DF]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="text-[#D4AF37] hover:underline"
          >
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 元信息 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{typeConfig.icon}</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {typeConfig.label}
          </span>
          {demo.featured && (
            <span className="text-sm text-[#D4AF37] bg-yellow-50 px-2 py-1 rounded">
              精选
            </span>
          )}
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold text-[#3E2723] font-serif mb-4">
          {demo.title}
        </h1>

        {/* 描述 */}
        <p className="text-lg text-gray-600 mb-6">{demo.description}</p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {demo.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm text-[#3E2723] bg-[#E8E4DF] px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 技术栈 */}
        {demo.techStack && demo.techStack.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#3E2723] mb-2">技术栈</h2>
            <div className="flex flex-wrap gap-2">
              {demo.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 日期和作者 */}
        <div className="text-sm text-gray-500 border-t border-[#E8E4DF] pt-4">
          <span>创建于 {demo.createdAt}</span>
          {demo.author && <span> · 作者: {demo.author}</span>}
        </div>

        {/* 查看内容按钮 */}
        <div className="mt-8">
          <a
            href={`/demos/${demo.slug}/`}
            className="inline-block px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] transition-colors"
          >
            查看内容 →
          </a>
        </div>
      </main>
    </div>
  );
}
