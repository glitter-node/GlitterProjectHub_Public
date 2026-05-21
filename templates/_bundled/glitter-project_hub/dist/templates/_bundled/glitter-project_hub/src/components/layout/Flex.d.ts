import { default as React } from 'react';
export interface FlexProps {
    direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    gap?: number;
    grow?: boolean | number;
    shrink?: boolean | number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: () => void;
}
export declare const Flex: React.FC<FlexProps>;
