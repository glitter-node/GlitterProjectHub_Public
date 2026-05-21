import React from 'react';
import { Div } from '../basic/Div';

export interface GridProps {
  
  cols?: number;

  
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };

  
  gap?: number;

  
  rowGap?: number;

  
  colGap?: number;

  
  autoRows?: 'auto' | 'min' | 'max' | 'fr';

  
  autoCols?: 'auto' | 'min' | 'max' | 'fr';

  
  flow?: 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense';

  
  className?: string;

  
  style?: React.CSSProperties;

  
  children?: React.ReactNode;

  
  onClick?: () => void;
}


export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  responsive,
  gap,
  rowGap,
  colGap,
  autoRows,
  autoCols,
  flow = 'row',
  className = '',
  style,
  onClick,
}) => {
  
  const classes: string[] = ['grid'];

  
  if (cols) {
    classes.push(`grid-cols-${cols}`);
  }

  if (responsive) {
    if (responsive.sm) classes.push(`sm:grid-cols-${responsive.sm}`);
    if (responsive.md) classes.push(`md:grid-cols-${responsive.md}`);
    if (responsive.lg) classes.push(`lg:grid-cols-${responsive.lg}`);
    if (responsive.xl) classes.push(`xl:grid-cols-${responsive.xl}`);
    if (responsive['2xl']) classes.push(`2xl:grid-cols-${responsive['2xl']}`);
  }

  if (gap !== undefined && gap > 0) {
    classes.push(`gap-${gap}`);
  }

  if (rowGap !== undefined && rowGap > 0) {
    classes.push(`gap-y-${rowGap}`);
  }

  if (colGap !== undefined && colGap > 0) {
    classes.push(`gap-x-${colGap}`);
  }

  if (autoRows) {
    const autoRowsMap: Record<string, string> = {
      auto: 'auto-rows-auto',
      min: 'auto-rows-min',
      max: 'auto-rows-max',
      fr: 'auto-rows-fr',
    };
    classes.push(autoRowsMap[autoRows]);
  }

  if (autoCols) {
    const autoColsMap: Record<string, string> = {
      auto: 'auto-cols-auto',
      min: 'auto-cols-min',
      max: 'auto-cols-max',
      fr: 'auto-cols-fr',
    };
    classes.push(autoColsMap[autoCols]);
  }

  const flowMap: Record<string, string> = {
    row: 'grid-flow-row',
    col: 'grid-flow-col',
    dense: 'grid-flow-dense',
    'row-dense': 'grid-flow-row-dense',
    'col-dense': 'grid-flow-col-dense',
  };
  classes.push(flowMap[flow]);

  if (className) {
    classes.push(className);
  }

  return (
    <Div className={classes.join(' ')} style={style} onClick={onClick}>
      {children}
    </Div>
  );
};
