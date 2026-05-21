import React from 'react';

export interface HrProps extends React.HTMLAttributes<HTMLHRElement> {
  ref?: React.Ref<HTMLHRElement>;
}


export const Hr = React.forwardRef<HTMLHRElement, HrProps>(({
  className = '',
  ...props
}, ref) => {
  return (
    <hr
      ref={ref}
      className={className}
      {...props}
    />
  );
});
