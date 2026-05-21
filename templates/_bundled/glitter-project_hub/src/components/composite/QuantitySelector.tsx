

import React from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Input } from '../basic/Input';
import { Icon } from '../basic/Icon';

interface QuantitySelectorProps {
  
  value: number;
  
  min?: number;
  
  max?: number;
  
  onChange: (value: number) => void;
  
  size?: 'sm' | 'md' | 'lg';
  
  disabled?: boolean;
  
  className?: string;
}


const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 999,
  onChange,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      container: 'h-8',
      button: 'w-8 h-8 text-sm',
      input: 'w-10 text-sm',
    },
    md: {
      container: 'h-10',
      button: 'w-10 h-10',
      input: 'w-14',
    },
    lg: {
      container: 'h-12',
      button: 'w-12 h-12 text-lg',
      input: 'w-16 text-lg',
    },
  };

  const classes = sizeClasses[size];

  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue) || newValue < min) {
      onChange(min);
    } else if (newValue > max) {
      onChange(max);
    }
  };

  const isMinDisabled = disabled || value <= min;
  const isMaxDisabled = disabled || value >= max;

  return (
    <Div
      className={`inline-flex items-center border border-slate-300 dark:border-slate-600 rounded-lg ${classes.container} ${className}`}
    >
      <Button
        type="button"
        onClick={handleDecrease}
        disabled={isMinDisabled}
        className={`${classes.button} flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors`}
        aria-label="수량 감소"
      >
        <Icon name="minus" className="w-4 h-4" />
      </Button>

      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={min}
        max={max}
        disabled={disabled}
        className={`${classes.input} text-center border-x border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        aria-label="수량"
      />

      <Button
        type="button"
        onClick={handleIncrease}
        disabled={isMaxDisabled}
        className={`${classes.button} flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors`}
        aria-label="수량 증가"
      >
        <Icon name="plus" className="w-4 h-4" />
      </Button>
    </Div>
  );
};

export default QuantitySelector;
