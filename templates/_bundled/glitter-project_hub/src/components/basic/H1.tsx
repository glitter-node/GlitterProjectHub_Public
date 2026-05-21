import React from 'react';

export interface H1Props extends React.HTMLAttributes<HTMLHeadingElement> {}


export const H1: React.FC<H1Props> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h1
      className={className}
      {...props}
    >
      {children}
    </h1>
  );
};
