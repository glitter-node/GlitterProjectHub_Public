import { default as React } from 'react';
export interface ThreeColumnLayoutProps {
    leftWidth?: string;
    rightWidth?: string;
    leftSlot?: React.ReactNode;
    centerSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
export declare const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps>;
