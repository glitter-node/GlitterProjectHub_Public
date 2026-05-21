import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}


export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <table
      className={className}
      {...props}
    >
      {children}
    </table>
  );
};
