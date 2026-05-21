import React from 'react';
import { Div } from '../basic/Div';

export interface FlexProps {
  
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';

  
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

  
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';

  
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';

  
  gap?: number;

  
  grow?: boolean | number;

  
  shrink?: boolean | number;

  
  className?: string;

  
  style?: React.CSSProperties;

  
  children?: React.ReactNode;

  
  onClick?: () => void;
}


export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 0,
  grow = false,
  shrink = true,
  className = '',
  style,
  onClick,
}) => {
  
  const classes: string[] = ['flex'];

  
  const directionMap: Record<string, string> = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse',
  };
  classes.push(directionMap[direction]);

  
  const wrapMap: Record<string, string> = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };
  classes.push(wrapMap[wrap]);

  
  const justifyMap: Record<string, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };
  classes.push(justifyMap[justify]);

  
  const alignMap: Record<string, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };
  classes.push(alignMap[align]);

  
  if (gap > 0) {
    classes.push(`gap-${gap}`);
  }

  if (grow === true) {
    classes.push('flex-grow');
  } else if (typeof grow === 'number' && grow > 0) {
    classes.push(`flex-grow-${grow}`);
  }

  if (shrink === false) {
    classes.push('shrink-0');
  } else if (shrink === true) {
    classes.push('flex-shrink');
  } else if (typeof shrink === 'number' && shrink > 0) {
    classes.push(`flex-shrink-${shrink}`);
  }

  if (className) {
    classes.push(className);
  }

  return (
    <Div className={classes.join(' ')} style={style} onClick={onClick}>
      {children}
    </Div>
  );
};
