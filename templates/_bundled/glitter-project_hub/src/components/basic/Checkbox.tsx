import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}


export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={className}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
