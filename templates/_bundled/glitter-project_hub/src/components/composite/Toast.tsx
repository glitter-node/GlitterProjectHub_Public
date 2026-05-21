import React, { useEffect, useState, useCallback } from 'react';
import { Div } from '../basic/Div';
import { Span } from '../basic/Span';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { IconName } from '../basic/IconTypes';


const getTranslation = (key: string, params?: Record<string, string | number>) => {
  const G7Core = (window as any).G7Core;
  return G7Core?.t?.(key, params) ?? key;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

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


const defaultIconMap: Record<ToastType, IconName> = {
  success: IconName.CheckCircle,
  error: IconName.XCircle,
  warning: IconName.ExclamationTriangle,
  info: IconName.InfoCircle,
};


const typeStyleMap: Record<ToastType, { bg: string; text: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-300',
  },
  info: {
    bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    text: 'text-teal-800 dark:text-teal-300',
  },
};


const positionClassMap: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};


export const Toast: React.FC<ToastProps> = ({
  toasts,
  position = 'bottom-center',
  duration = 3000,
  onRemove,
}) => {
  
  const [visibleToasts, setVisibleToasts] = useState<Map<string | number, boolean>>(new Map());

  
  const handleRemove = useCallback((id: string | number) => {
    
    setVisibleToasts(prev => {
      const next = new Map(prev);
      next.set(id, false);
      return next;
    });

    
    setTimeout(() => {
      if (onRemove) {
        onRemove(id);
      } else {
        
        const G7Core = (window as any).G7Core;
        if (G7Core?.state?.update) {
          G7Core.state.update((prevState: Record<string, any>) => {
            const currentToasts = Array.isArray(prevState.toasts) ? prevState.toasts : [];
            return {
              toasts: currentToasts.filter((t: ToastItem) => t.id !== id),
            };
          });
        }
      }
    }, 300);
  }, [onRemove]);

  
  useEffect(() => {
    if (!toasts || toasts.length === 0) return;

    toasts.forEach(toast => {
      
      if (visibleToasts.has(toast.id)) return;

      
      setVisibleToasts(prev => {
        const next = new Map(prev);
        next.set(toast.id, true);
        return next;
      });

      
      const effectiveDuration = toast.duration || duration;
      if (effectiveDuration > 0) {
        setTimeout(() => {
          handleRemove(toast.id);
        }, effectiveDuration);
      }
    });
  }, [toasts, duration, handleRemove, visibleToasts]);

  
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <Div
      className={`fixed z-[9999] flex flex-col gap-2 ${positionClassMap[position]}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          position={position}
          isVisible={visibleToasts.get(toast.id) ?? true}
          onClose={() => handleRemove(toast.id)}
        />
      ))}
    </Div>
  );
};

interface ToastItemComponentProps {
  toast: ToastItem;
  position: ToastPosition;
  isVisible: boolean;
  onClose: () => void;
}

const ToastItemComponent: React.FC<ToastItemComponentProps> = ({ toast, position, isVisible, onClose }) => {
  const typeStyle = typeStyleMap[toast.type] || typeStyleMap.info;

  // 아이콘 결정: 커스텀 아이콘 > 타입별 기본 아이콘
  const iconName = toast.icon
    ? (toast.icon as IconName)
    : defaultIconMap[toast.type];

  // position에 따라 숨김 애니메이션 방향 결정 (top → 위로, bottom → 아래로)
  const hideTranslate = position.startsWith('bottom') ? 'translate-y-2' : '-translate-y-2';

  return (
    <Div
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        transition-all duration-300
        ${typeStyle.bg}
        ${isVisible ? 'opacity-100 translate-y-0' : `opacity-0 ${hideTranslate}`}
      `}
      role="alert"
    >
      <Icon
        name={iconName}
        className={`w-5 h-5 flex-shrink-0 ${typeStyle.text}`}
      />
      <Span className={`flex-1 text-sm font-medium ${typeStyle.text}`}>
        {toast.message}
      </Span>
      <Button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${typeStyle.text} focus:outline-none`}
        aria-label={getTranslation('common.close')}
      >
        <Icon name={IconName.Times} className="w-4 h-4" />
      </Button>
    </Div>
  );
};

export default Toast;
