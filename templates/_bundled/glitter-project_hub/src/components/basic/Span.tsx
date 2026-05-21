import React from 'react';

export interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {}


export const Span: React.FC<SpanProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};
