import React, { useState, useEffect } from 'react';
import { Div } from '../basic/Div';


const logger = ((window as any).G7Core?.createLogger?.('Comp:PageTransition')) ?? {
    log: (...args: unknown[]) => console.log('[Comp:PageTransition]', ...args),
    warn: (...args: unknown[]) => console.warn('[Comp:PageTransition]', ...args),
    error: (...args: unknown[]) => console.error('[Comp:PageTransition]', ...args),
};

export interface PageTransitionIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
}


export const PageTransitionIndicator: React.FC<PageTransitionIndicatorProps> = ({
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
      setIsPending(newIsPending);
    });

    
    return unsubscribe;
  }, []);

  if (!isPending) {
    return null;
  }

  return (
    <Div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={style}
      role="progressbar"
      aria-label="페이지 로딩 중"
    >
      <Div className="h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 animate-pulse">
        <Div
          className="h-full w-[30%] bg-teal-700 animate-[loading_1.5s_ease-in-out_infinite]"
        />
      </Div>

      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(300%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </Div>
  );
};

export default PageTransitionIndicator;
