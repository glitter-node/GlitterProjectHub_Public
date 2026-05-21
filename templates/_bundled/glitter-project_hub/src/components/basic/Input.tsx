import React, { useRef, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  onChange,
  onKeyPress,
  value,
  defaultValue,
  type = 'text',
  checked,
  defaultChecked,
  ...props
}, ref) => {
  
  const isCheckableType = type === 'radio' || type === 'checkbox';

  
  const isComposingRef = useRef(false);
  
  const internalRef = useRef<HTMLInputElement>(null);

  
  useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

  
  const [localValue, setLocalValue] = useState<string>(
    (value as string) ?? (defaultValue as string) ?? ''
  );

  
  useEffect(() => {
    if (!isCheckableType && !isComposingRef.current && value !== undefined) {
      setLocalValue(value as string);
    }
  }, [value, isCheckableType]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      
      if (onChange) {
        
        const currentValue = (e.target as HTMLInputElement).value;
        setLocalValue(currentValue);

        
        const changeEvent = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLInputElement>;
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      
      if (isComposingRef.current) {
        return;
      }
      if (onKeyPress) {
        onKeyPress(e);
      }
    },
    [onKeyPress]
  );

  
  const { loadingactions, formdata, ...validProps } = props as any;

  
  
  if (isCheckableType) {
    return (
      <input
        ref={internalRef}
        type={type}
        className={className}
        onChange={onChange}
        checked={checked}
        defaultChecked={defaultChecked}
        value={value}
        {...validProps}
      />
    );
  }

  
  const inputProps = value !== undefined
    ? { value: localValue }
    : { defaultValue };

  return (
    <input
      ref={internalRef}
      type={type}
      className={className}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      {...inputProps}
      {...validProps}
    />
  );
});


Input.displayName = 'Input';