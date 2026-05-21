import React from 'react';

export interface IProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}


export const I: React.FC<IProps> = ({ className = '', children, style, ...props }) => {
  return (
    <i className={className} style={style} {...props}>
      {children}
    </i>
  );
};