import React, { useState, useEffect } from 'react';
import { Form } from '../basic/Form';
import { Input } from '../basic/Input';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { IconName } from '../basic/IconTypes';
import { Div } from '../basic/Div';
import { Span } from '../basic/Span';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

export interface SearchSuggestion {
  id: string | number;
  text: string;
}

export interface SearchBarProps {
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  showButton?: boolean; 
  suggestions?: SearchSuggestion[];
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  showSuggestions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}


export const SearchBar: React.FC<SearchBarProps> = ({
  name = 'search',
  placeholder,
  value: controlledValue,
  onChange,
  onSubmit,
  showButton = false,
  suggestions = [],
  onSuggestionClick,
  showSuggestions = false,
  className = '',
  style,
}) => {
  
  const resolvedPlaceholder = placeholder ?? t('common.search_placeholder');

  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousValueRef = React.useRef<string>('');

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const shouldShowSuggestions = showSuggestions && isFocused && suggestions.length > 0 && value.length > 0;

  
  useEffect(() => {
    if (controlledValue !== undefined) {
      previousValueRef.current = controlledValue;
    }
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);

    
    
    if (previousValueRef.current !== '' && newValue === '' && !(e.nativeEvent as any).inputType) {
      
      setTimeout(() => {
        const formElement = containerRef.current?.querySelector('form');
        if (formElement) {
          formElement.requestSubmit();
        }
      }, 0);
    }

    previousValueRef.current = newValue;
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInternalValue(suggestion.text);
    const syntheticEvent = {
      target: { value: suggestion.text, name },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
    onSuggestionClick?.(suggestion);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Div ref={containerRef} className={`relative ${className}`} style={style}>
      <Form onSubmit={handleSubmit} className="relative">
        <Div className={`relative flex items-center ${showButton ? 'gap-2' : ''}`}>
          <Div className="relative flex-1">
            <Div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name={IconName.Search} className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </Div>

            <Input
              type="search"
              name={name}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={resolvedPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            />
          </Div>

          {showButton && (
            <Button
              type="submit"
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors text-sm font-medium cursor-pointer h-[42px]"
            >
              {t('common.search')}
            </Button>
          )}
        </Div>
      </Form>

      {shouldShowSuggestions && (
        <Div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <Div
              key={suggestion.id}
              className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Div className="flex items-center gap-2">
                <Icon name={IconName.Search} className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Span className="text-sm text-slate-700 dark:text-slate-300">{suggestion.text}</Span>
              </Div>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
};
