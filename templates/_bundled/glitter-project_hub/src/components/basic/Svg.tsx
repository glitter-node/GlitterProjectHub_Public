import React from 'react';

export interface SvgProps extends React.SVGAttributes<SVGSVGElement> {}


export const Svg: React.FC<SvgProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <svg
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
};
