import React from 'react';

export interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {}


export const H2: React.FC<H2Props> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h2
      className={className}
      {...props}
    >
      {children}
    </h2>
  );
};
