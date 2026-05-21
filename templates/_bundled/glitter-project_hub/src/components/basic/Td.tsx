import React from 'react';

export interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}


export const Td: React.FC<TdProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td
      className={className}
      {...props}
    >
      {children}
    </td>
  );
};
