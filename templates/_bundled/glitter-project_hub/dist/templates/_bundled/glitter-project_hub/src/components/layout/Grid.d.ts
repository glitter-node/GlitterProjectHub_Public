import { default as React } from 'react';
export interface GridProps {
    cols?: number;
    responsive?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    gap?: number;
    rowGap?: number;
    colGap?: number;
    autoRows?: 'auto' | 'min' | 'max' | 'fr';
    autoCols?: 'auto' | 'min' | 'max' | 'fr';
    flow?: 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense';
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: () => void;
}
export declare const Grid: React.FC<GridProps>;
