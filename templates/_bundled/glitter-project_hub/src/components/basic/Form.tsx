import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}


export const Form: React.FC<FormProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <form
      className={className}
      {...props}
    >
      {children}
    </form>
  );
};
