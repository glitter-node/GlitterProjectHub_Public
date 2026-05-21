import { default as React } from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export interface ToastItem {
    id: string | number;
    type: ToastType;
    message: string;
    icon?: string;
    duration?: number;
}
export interface ToastProps {
    toasts?: ToastItem[] | null;
    position?: ToastPosition;
    duration?: number;
    onRemove?: (id: string | number) => void;
}
export declare const Toast: React.FC<ToastProps>;
export default Toast;
