import React from 'react';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {}


export const Code: React.FC<CodeProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <code
      className={className}
      {...props}
    >
      {children}
    </code>
  );
};
