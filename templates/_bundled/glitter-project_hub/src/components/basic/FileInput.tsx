import React, { forwardRef, useRef, useCallback, useState } from 'react';
import { Div } from './Div';
import { Span } from './Span';
import { Svg } from './Svg';
import { Input } from './Input';
import { Button } from './Button';

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'onError'> {
  
  accept?: string;
  
  maxSize?: number;
  
  onChange?: (file: File | null) => void;
  
  onError?: (error: string) => void;
  
  buttonText?: string;
  
  placeholder?: string;
}


export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(({
  accept,
  maxSize,
  onChange,
  onError,
  buttonText = 'Browse',
  placeholder = 'No file selected',
  className = '',
  disabled,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
  const [fileName, setFileName] = useState<string>('');

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled, inputRef]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setFileName('');
      onChange?.(null);
      return;
    }

    
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size exceeds ${maxSize}MB limit`;
      onError?.(errorMsg);
      // 입력 초기화
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setFileName('');
      return;
    }

    setFileName(file.name);
    onChange?.(file);
  }, [maxSize, onChange, onError, inputRef]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setFileName('');
    onChange?.(null);
  }, [onChange, inputRef]);

  return (
    <Div className={`flex items-center gap-2 ${className}`}>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange as any}
        disabled={disabled}
        className="hidden"
        {...props}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonText}
      </Button>
      <Span className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate">
        {fileName || placeholder}
      </Span>
      {fileName && !disabled && (
        <Button
          type="button"
          onClick={handleClear}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Clear file"
        >
          <Svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </Svg>
        </Button>
      )}
    </Div>
  );
});

FileInput.displayName = 'FileInput';
