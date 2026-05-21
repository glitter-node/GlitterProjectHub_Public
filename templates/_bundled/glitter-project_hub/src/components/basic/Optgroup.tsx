import React from 'react';

export interface OptgroupProps extends React.OptgroupHTMLAttributes<HTMLOptGroupElement> {}


export const Optgroup: React.FC<OptgroupProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <optgroup
      className={className}
      {...props}
    >
      {children}
    </optgroup>
  );
};
