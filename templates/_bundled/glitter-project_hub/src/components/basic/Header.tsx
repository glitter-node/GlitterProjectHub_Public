import React from 'react';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
}


export const Header = React.forwardRef<HTMLElement, HeaderProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <header
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </header>
  );
});
