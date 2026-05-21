import React from 'react';

const G7Core = () => (window as any).G7Core;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'ghost' | 'outline';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'variant-primary',
  secondary: 'variant-secondary',
  success: 'variant-success',
  warning: 'variant-warning',
  danger: 'variant-danger',
  neutral: 'variant-neutral',
  ghost: 'variant-ghost',
  outline: 'variant-outline',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseClasses = `badge ${variantClasses[variant]}`;
  const mergedClassName = G7Core()?.style?.mergeClasses?.(baseClasses, className)
    ?? `${baseClasses} ${className}`;

  return (
    <span
      className={mergedClassName}
      {...props}
    >
      {children}
    </span>
  );
};
