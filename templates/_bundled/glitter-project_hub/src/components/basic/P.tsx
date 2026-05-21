import React from 'react';

export interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {}


export const P: React.FC<PProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={className}
      {...props}
    >
      {children}
    </p>
  );
};
