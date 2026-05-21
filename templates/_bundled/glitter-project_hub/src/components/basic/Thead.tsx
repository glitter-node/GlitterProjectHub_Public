import React from 'react';

export interface TheadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}


export const Thead: React.FC<TheadProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={className}
      {...props}
    >
      {children}
    </thead>
  );
};
