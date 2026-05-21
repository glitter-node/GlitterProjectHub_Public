import React, { useState, useEffect } from 'react';
import { Div } from '../basic/Div';

const logger = ((window as any).G7Core?.createLogger?.('Comp:PageTransitionBlur')) ?? {
    log: (...args: unknown[]) => console.log('[Comp:PageTransitionBlur]', ...args),
    warn: (...args: unknown[]) => console.warn('[Comp:PageTransitionBlur]', ...args),
};

export interface PageTransitionBlurProps {
  className?: string;
  style?: React.CSSProperties;
}


export const PageTransitionBlur: React.FC<PageTransitionBlurProps> = ({
  className = '',
  style,
}) => {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const transitionManager = (window as any).G7Core?.TransitionManager;

    if (!transitionManager) {
      logger.warn('TransitionManager를 찾을 수 없습니다.');
      return;
    }

    setIsPending(transitionManager.getIsPending());

    const unsubscribe = transitionManager.subscribe((newIsPending: boolean) => {
      logger.log('isPending changed:', newIsPending);
      setIsPending(newIsPending);
    });

    return unsubscribe;
  }, []);

  if (!isPending) {
    return null;
  }

  return (
    <Div
      className={`fixed inset-0 z-40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-opacity duration-150 pointer-events-none ${className}`}
      style={style}
      role="status"
      aria-label="페이지 전환 중"
      data-testid="page-transition-blur"
    />
  );
};

export default PageTransitionBlur;
