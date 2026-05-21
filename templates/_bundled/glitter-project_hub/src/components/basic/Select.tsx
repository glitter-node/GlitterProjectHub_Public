import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Div } from './Div';
import { Button } from './Button';
import { Span } from './Span';
import { Svg } from './Svg';
import { Input } from './Input';


const logger = ((window as any).G7Core?.createLogger?.('Comp:Select')) ?? {
    log: (...args: unknown[]) => console.log('[Comp:Select]', ...args),
    warn: (...args: unknown[]) => console.warn('[Comp:Select]', ...args),
    error: (...args: unknown[]) => console.error('[Comp:Select]', ...args),
};

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options?: SelectOption[] | string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string | number } }) => void;
  
  searchable?: boolean;
  
  searchPlaceholder?: string;
}


function getLocaleName(locale: string): string {
  const localeNames: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
  };

  return localeNames[locale] || locale;
}


export const Select: React.FC<SelectProps> = ({
  children,
  label,
  error,
  options,
  className = '',
  value,
  onChange,
  disabled,
  searchable = false,
  searchPlaceholder,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  const normalizedOptions = useMemo((): SelectOption[] | null => {
    if (!options) return null;

    
    if (!Array.isArray(options)) {
      logger.warn('options prop is not an array:', options);
      return null;
    }

    
    if (options.length === 0) return [];

    
    if (typeof options[0] === 'string') {
      return (options as string[]).map((locale): SelectOption => ({
        value: locale,
        label: getLocaleName(locale),
      }));
    }

    
    return options as SelectOption[];
  }, [options]);

  
  const selectedLabel = useMemo(() => {
    if (!normalizedOptions) return '';
    const selected = normalizedOptions.find(opt => String(opt.value) === String(value));
    return selected?.label || '';
  }, [normalizedOptions, value]);

  
  const visibleOptions = useMemo((): SelectOption[] | null => {
    if (!normalizedOptions) return null;
    if (!searchable || searchTerm.trim() === '') return normalizedOptions;
    const needle = searchTerm.trim().toLowerCase();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(needle) ||
      String(opt.value).toLowerCase().includes(needle)
    );
  }, [normalizedOptions, searchable, searchTerm]);

  
  useEffect(() => {
    if (isOpen && searchable) {
      setSearchTerm('');
      
      const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  
  const updateDropdownPos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownMaxH = 280; 
    
    const openUpward = spaceBelow < dropdownMaxH && rect.top > spaceBelow;
    if (openUpward) {
      setDropdownPos({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  
  useEffect(() => {
    if (!isOpen) {
      setDropdownPos(null);
      return;
    }
    updateDropdownPos();
    window.addEventListener('scroll', updateDropdownPos, true);
    window.addEventListener('resize', updateDropdownPos);
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  }, [isOpen, updateDropdownPos]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    if (onChange) {
      
      const syntheticEvent = {
        target: { value: optionValue },
        preventDefault: () => {},
        stopPropagation: () => {},
        type: 'change',
      };
      onChange(syntheticEvent as any);
    }
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  
  if (!normalizedOptions) {
    return (
      <select
        className={className}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
    );
  }

  
  const hasCustomStyle = className && className.includes('bg-');
  
  const hasTextColor = className && /text-(slate|red|teal|green|orange|white|black|pink|amber|emerald|cyan)-\d+|text-white|text-black/.test(className);
  const baseButtonClass = hasCustomStyle
    ? `${className}${hasTextColor ? '' : ' text-slate-700 dark:text-slate-200'}`
    : `w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none ${className}`;

  return (
    <Div ref={containerRef} className="relative">
      <Button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`${baseButtonClass} flex items-center justify-between gap-2 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Span className="truncate">{selectedLabel || '\u00A0'}</Span>
        <Svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </Svg>
      </Button>

      {isOpen && dropdownPos && createPortal(
        <Div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden"
          style={{ top: dropdownPos.top, bottom: dropdownPos.bottom, left: dropdownPos.left, width: dropdownPos.width }}
          role="listbox"
        >
          {searchable && (
            <Div className="p-2 border-b border-slate-200 dark:border-slate-600">
              <Input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder ?? 'Search...'}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                role="searchbox"
                aria-label={searchPlaceholder ?? 'Search'}
              />
            </Div>
          )}
          <Div className="py-2 max-h-60 overflow-auto">
            {visibleOptions && visibleOptions.length === 0 && (
              <Div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                {searchTerm ? 'No results' : ''}
              </Div>
            )}
            {(visibleOptions ?? []).map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <Button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    isSelected ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-200'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Span>{option.label}</Span>
                  {isSelected && (
                    <Svg
                      className="w-5 h-5 text-teal-600 dark:text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </Svg>
                  )}
                </Button>
              );
            })}
          </Div>
        </Div>,
        document.body
      )}
    </Div>
  );
};
