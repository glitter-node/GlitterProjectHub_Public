import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {}


export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <section
      className={className}
      {...props}
    >
      {children}
    </section>
  );
};
