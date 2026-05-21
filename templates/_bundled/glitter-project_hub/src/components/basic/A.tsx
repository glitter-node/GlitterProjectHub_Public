import React from 'react';

export interface AProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}


export const A: React.FC<AProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <a
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};
