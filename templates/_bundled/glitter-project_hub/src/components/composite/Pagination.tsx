import React, { useMemo } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
  prevText?: string;
  nextText?: string;
}


export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  className = '',
  style,
  prevText,
  nextText,
}) => {

  
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages + 2) {
      
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      
      const halfVisible = Math.floor(maxVisiblePages / 2);

      let startPage = Math.max(2, currentPage - halfVisible);
      let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      
      if (currentPage <= halfVisible + 1) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      
      pages.push(1);

      
      if (startPage > 2) {
        pages.push('...');
      }

      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Div
      className={`flex items-center gap-2 ${className}`}
      style={style}
      role="navigation"
      aria-label={t('common.pagination')}
    >
      {showFirstLast && (
        <Button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
          aria-label={t('common.first_page')}
        >
          &#171;
        </Button>
      )}

      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
        aria-label={t('common.prev_page')}
      >
        {prevText || <>&#8249;</>}
      </Button>

      <Div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <Span
                key={`ellipsis-${index}`}
                className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400"
              >
                ...
              </Span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`px-3 py-1 text-sm border rounded ${
                isActive
                  ? 'bg-teal-500 dark:bg-teal-600 text-white border-teal-500 dark:border-teal-600'
                  : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
              }`}
              aria-label={t('common.page_n', { n: pageNum })}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}
      </Div>

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
        aria-label={t('common.next_page')}
      >
        {nextText || <>&#8250;</>}
      </Button>

      {showFirstLast && (
        <Button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
          aria-label={t('common.last_page')}
        >
          &#187;
        </Button>
      )}
    </Div>
  );
};
