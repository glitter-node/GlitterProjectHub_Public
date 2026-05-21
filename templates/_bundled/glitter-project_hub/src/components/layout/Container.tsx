import React from 'react';
import { Div } from '../basic/Div';

export interface ContainerProps {
  
  id?: string;

  
  className?: string;

  
  style?: React.CSSProperties;

  
  children?: React.ReactNode;
}


export const Container: React.FC<ContainerProps> = ({
  id,
  className,
  style,
  children,
}) => {
  return (
    <Div id={id} className={className} style={style}>
      {children}
    </Div>
  );
};
