import React, { useRef, useCallback, useState, useEffect } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}


export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  onChange,
  value,
  defaultValue,
  ...props
}) => {
  
  const isComposingRef = useRef(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  
  const [localValue, setLocalValue] = useState<string>(
    (value as string) ?? (defaultValue as string) ?? ''
  );

  
  useEffect(() => {
    if (!isComposingRef.current && value !== undefined) {
      setLocalValue(value as string);
    }
  }, [value]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = false;
      
      if (onChange) {
        
        const currentValue = (e.target as HTMLTextAreaElement).value;
        setLocalValue(currentValue);

        
        const changeEvent = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
        Object.defineProperty(changeEvent, 'target', {
          writable: false,
          value: { value: currentValue },
        });
        Object.defineProperty(changeEvent, 'currentTarget', {
          writable: false,
          value: { value: currentValue },
        });

        onChange(changeEvent);
      }
    },
    [onChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      setLocalValue(newValue);

      
      if (isComposingRef.current) {
        return;
      }
      if (onChange) {
        onChange(e);
      }
    },
    [onChange]
  );

  
  const { loadingactions, formdata, ...validProps } = props as any;

  
  const textareaValueProps = value !== undefined
    ? { value: localValue }
    : { defaultValue };

  return (
    <textarea
      ref={textareaRef}
      className={className}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      {...textareaValueProps}
      {...validProps}
    />
  );
};
