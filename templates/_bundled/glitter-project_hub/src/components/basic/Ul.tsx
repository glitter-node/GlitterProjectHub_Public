import React from 'react';

export interface UlProps extends React.HTMLAttributes<HTMLUListElement> {}


export const Ul: React.FC<UlProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <ul
      className={className}
      {...props}
    >
      {children}
    </ul>
  );
};
