/**
 * Input: 总数、当前页、每页条数、页面变化回调
 * Output: 分页UI组件
 * 地位: 通用分页组件，用于Demo列表分页
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  total,
  currentPage,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 生成页码数组
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 始终显示第一页
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // 当前页附近的页码
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // 始终显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#3E2723] hover:bg-[#E8E4DF]'
        }`}
      >
        上一页
      </button>

      {/* 页码 */}
      {pageNumbers.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm transition-colors ${
              currentPage === page
                ? 'bg-[#D4AF37] text-white'
                : 'text-[#3E2723] hover:bg-[#E8E4DF]'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#3E2723] hover:bg-[#E8E4DF]'
        }`}
      >
        下一页
      </button>
    </div>
  );
}

/**
 * 分页Hook - 返回当前页的数据
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 12
): {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  paginatedItems: T[];
  totalPages: number;
} {
  const [currentPage, setCurrentPage] = useState(1);

  // 重置页码当items变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages,
  };
}

// 需要导入useState和useEffect
import { useState, useEffect } from 'react';
