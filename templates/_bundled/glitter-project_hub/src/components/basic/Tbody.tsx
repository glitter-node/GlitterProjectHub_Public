import React from 'react';

export interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}


export const Tbody: React.FC<TbodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody
      className={className}
      {...props}
    >
      {children}
    </tbody>
  );
};
