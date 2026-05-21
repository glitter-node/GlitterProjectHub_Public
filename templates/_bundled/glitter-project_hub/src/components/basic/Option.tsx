import React from 'react';

export interface OptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}


export const Option: React.FC<OptionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <option
      className={className}
      {...props}
    >
      {children}
    </option>
  );
};
