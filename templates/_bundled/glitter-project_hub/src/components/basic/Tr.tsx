import React from 'react';

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {}


export const Tr: React.FC<TrProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={className}
      {...props}
    >
      {children}
    </tr>
  );
};
