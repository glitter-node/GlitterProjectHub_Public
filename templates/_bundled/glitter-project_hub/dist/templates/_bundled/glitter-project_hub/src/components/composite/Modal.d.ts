import { default as React } from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: string;
    iconClassName?: string;
    closeOnBackdropClick?: boolean;
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
    closeOnEscape?: boolean;
    children?: React.ReactNode;
    width?: string;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Modal: React.FC<ModalProps>;
