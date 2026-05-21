import React from 'react';
import { Modal } from './Modal';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { P } from '../basic/P';
import { Span } from '../basic/Span';
import { I } from '../basic/I';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

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


export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmButtonVariant = 'primary',
  
  
  cancelButtonVariant: _cancelButtonVariant = 'secondary',
  width = '500px',
  
  
  closeOnOverlay: _closeOnOverlay = true,
  isLoading = false,
  loadingText,
}) => {
  
  const resolvedConfirmText = confirmText ?? t('common.confirm');
  const resolvedCancelText = cancelText ?? t('common.cancel');
  const resolvedLoadingText = loadingText ?? t('common.loading');

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    
    if (isLoading) return;
    onCancel?.();
    onClose();
  };

  const handleClose = () => {
    
    if (isLoading) return;
    onClose();
  };

  
  const confirmVariantClassMap: Record<'primary' | 'secondary' | 'danger' | 'ghost', string> = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={width}
    >
      
      <Div className="py-2">
        {typeof message === 'string' ? (
          <P className="text-slate-700 dark:text-slate-300">{message}</P>
        ) : (
          message
        )}
      </Div>

      
      <Div className="flex justify-end gap-3 mt-6">
        
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Span>{resolvedCancelText}</Span>
        </Button>

        
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${confirmVariantClassMap[confirmButtonVariant]}`}
        >
          {isLoading && (
            <I className="fa-solid fa-spinner w-4 h-4 animate-spin" />
          )}
          <Span>{isLoading ? resolvedLoadingText : resolvedConfirmText}</Span>
        </Button>
      </Div>
    </Modal>
  );
};
