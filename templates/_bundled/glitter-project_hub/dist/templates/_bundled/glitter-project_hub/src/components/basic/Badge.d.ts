import { default as React } from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'ghost' | 'outline';
}
export declare const Badge: React.FC<BadgeProps>;
