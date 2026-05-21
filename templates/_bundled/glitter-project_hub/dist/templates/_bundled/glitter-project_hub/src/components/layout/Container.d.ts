import { default as React } from 'react';
export interface ContainerProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
export declare const Container: React.FC<ContainerProps>;
