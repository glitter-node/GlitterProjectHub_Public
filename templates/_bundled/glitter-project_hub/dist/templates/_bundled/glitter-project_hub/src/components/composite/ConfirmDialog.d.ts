import { default as React } from 'react';
export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmButtonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    cancelButtonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    width?: string;
    closeOnOverlay?: boolean;
    isLoading?: boolean;
    loadingText?: string;
}
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
