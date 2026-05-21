import React from 'react';

export interface LiProps extends React.LiHTMLAttributes<HTMLLIElement> {}


export const Li: React.FC<LiProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <li
      className={className}
      {...props}
    >
      {children}
    </li>
  );
};
