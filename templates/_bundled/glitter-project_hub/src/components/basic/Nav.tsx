import React, { forwardRef } from 'react';

export interface NavProps extends React.HTMLAttributes<HTMLElement> {}


export const Nav = forwardRef<HTMLElement, NavProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

Nav.displayName = 'Nav';
