import React from 'react';

export interface OlProps extends React.HTMLAttributes<HTMLOListElement> {}


export const Ol: React.FC<OlProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <ol
      className={className}
      {...props}
    >
      {children}
    </ol>
  );
};
