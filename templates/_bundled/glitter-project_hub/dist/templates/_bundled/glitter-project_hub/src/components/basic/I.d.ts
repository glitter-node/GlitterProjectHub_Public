import { default as React } from 'react';
export interface IProps extends React.HTMLAttributes<HTMLElement> {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}
export declare const I: React.FC<IProps>;
