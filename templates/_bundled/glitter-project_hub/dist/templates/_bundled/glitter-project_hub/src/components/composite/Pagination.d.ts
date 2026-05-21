import { default as React } from 'react';
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
export declare const Pagination: React.FC<PaginationProps>;
