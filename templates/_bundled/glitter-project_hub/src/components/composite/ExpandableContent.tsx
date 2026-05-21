import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';
import { Icon } from '../basic/Icon';


const t = (key: string): string =>
  (window as any).G7Core?.t?.(key) ?? key;

export interface ExpandableContentProps {
  
  maxHeight?: number;

  
  expandText?: string;

  
  collapseText?: string;

  
  className?: string;

  
  children?: React.ReactNode;
}


export const ExpandableContent: React.FC<ExpandableContentProps> = ({
  maxHeight = 500,
  expandText,
  collapseText,
  className = '',
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  
  const checkHeight = useCallback(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setNeedsExpand(scrollHeight > maxHeight);
    }
  }, [maxHeight]);

  useEffect(() => {
    checkHeight();

    
    const container = contentRef.current;
    if (!container) return;

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', checkHeight);
      }
    });

    
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(checkHeight);
      observer.observe(container);
    }

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', checkHeight);
      });
      observer?.disconnect();
    };
  }, [checkHeight, children]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const resolvedExpandText = expandText || t('common.expand');
  const resolvedCollapseText = collapseText || t('common.collapse');

  return (
    <Div className={className}>
      
      <Div className="relative">
        <Div
          ref={contentRef}
          className={
            !isExpanded && needsExpand
              ? 'overflow-hidden transition-[max-height] duration-300 ease-in-out'
              : 'transition-[max-height] duration-300 ease-in-out'
          }
          style={
            !isExpanded && needsExpand
              ? { maxHeight: `${maxHeight}px` }
              : undefined
          }
        >
          {children}
        </Div>

        {!isExpanded && needsExpand && (
          <Div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
        )}
      </Div>

      {needsExpand && (
        <Button
          type="button"
          onClick={toggleExpand}
          className="flex items-center justify-center w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer gap-1.5"
        >
          <Span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {isExpanded ? resolvedCollapseText : resolvedExpandText}
          </Span>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size="sm"
          />
        </Button>
      )}
    </Div>
  );
};

export default ExpandableContent;
