import React, { useEffect, useRef } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

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


export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  iconClassName = 'text-slate-500 dark:text-slate-400',
  closeOnBackdropClick = true,
  closeOnOverlayClick,
  showCloseButton = true,
  closeOnEscape = true,
  children,
  width = '500px',
  className = '',
  style,
}) => {
  
  const shouldCloseOnBackdrop = closeOnOverlayClick !== undefined
    ? closeOnOverlayClick
    : closeOnBackdropClick;
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen && closeOnEscape) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, closeOnEscape]);

  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      
      previousFocusRef.current = document.activeElement as HTMLElement;

      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      
      firstElement?.focus();

      
      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
          
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);

      return () => {
        document.removeEventListener('keydown', handleTab);
        
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  
  const zIndex = style?.zIndex ?? 50;

  return (
    <Div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      onClick={shouldCloseOnBackdrop ? onClose : undefined}
    >
      
      <Div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />

      
      <Div
        ref={modalRef}
        className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden ${className}`}
        style={{ width, ...(style ? { ...style, zIndex: undefined } : {}) }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || icon || showCloseButton) && (
          <Div className="flex items-center justify-between p-4">
            {(title || icon) && (
              <Div
                id="modal-title"
                className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white"
              >
                {icon && <Icon name={icon} size="md" className={iconClassName} />}
                {title}
              </Div>
            )}
            {showCloseButton && (
              <Button
                onClick={onClose}
                className="ml-auto text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                aria-label={t('common.close_modal')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </Div>
        )}

        <Div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </Div>
      </Div>
    </Div>
  );
};
