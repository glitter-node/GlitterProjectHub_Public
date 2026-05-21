import React, { forwardRef } from 'react';


const G7Core = () => (window as any).G7Core;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'variant-primary',
  secondary: 'variant-secondary',
  success: 'variant-success',
  warning: 'variant-warning',
  danger: 'variant-danger',
  neutral: 'variant-neutral',
  ghost: 'variant-ghost',
  outline: 'variant-outline',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-sm',
};


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const appliesVariantSystem = Boolean(variant) || className.trim() === '';
  const resolvedVariant = variant ?? 'primary';
  const baseClasses = appliesVariantSystem
    ? `btn ${variantClasses[resolvedVariant]} ${sizeClasses[size]}`
    : 'inline-flex items-center justify-center';

  
  const mergedClassName = G7Core()?.style?.mergeClasses?.(baseClasses, className)
    ?? `${baseClasses} ${className}`;

  return (
    <button
      ref={ref}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
