import React from 'react';

export interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}


export const Th: React.FC<ThProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={className}
      {...props}
    >
      {children}
    </th>
  );
};
