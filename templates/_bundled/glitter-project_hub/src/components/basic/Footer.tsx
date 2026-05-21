import React from 'react';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
}


export const Footer = React.forwardRef<HTMLElement, FooterProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <footer
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </footer>
  );
});
