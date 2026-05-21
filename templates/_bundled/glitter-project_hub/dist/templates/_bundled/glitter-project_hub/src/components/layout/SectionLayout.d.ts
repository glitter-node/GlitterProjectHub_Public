import { default as React } from 'react';
export interface SectionLayoutProps {
    title?: string;
    subtitle?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    background?: 'none' | 'white' | 'slate' | 'primary' | 'secondary';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
    centered?: boolean;
    border?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: () => void;
}
export declare const SectionLayout: React.FC<SectionLayoutProps>;
