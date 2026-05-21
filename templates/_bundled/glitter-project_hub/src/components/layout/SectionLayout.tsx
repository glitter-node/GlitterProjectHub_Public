import React from 'react';
import { Section as BaseSection } from '../basic/Section';
import { Div } from '../basic/Div';
import { H2 } from '../basic/H2';
import { P } from '../basic/P';

export interface SectionLayoutProps {
  
  title?: string;

  
  subtitle?: string;

  
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  
  background?: 'none' | 'white' | 'slate' | 'primary' | 'secondary';

  
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';

  
  centered?: boolean;

  
  border?: boolean;

  
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  
  rounded?: boolean;

  
  className?: string;

  
  style?: React.CSSProperties;

  
  children?: React.ReactNode;

  
  onClick?: () => void;
}


export const SectionLayout: React.FC<SectionLayoutProps> = ({
  title,
  subtitle,
  children,
  padding = 'md',
  background = 'none',
  maxWidth,
  centered = false,
  border = false,
  shadow = 'none',
  rounded = false,
  className = '',
  style,
  onClick,
}) => {
  
  const classes: string[] = [];

  
  const paddingMap: Record<string, string> = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }; 
  classes.push(paddingMap[padding]);

  
  const backgroundMap: Record<string, string> = {
    none: '',
    white: 'bg-white dark:bg-slate-700',
    slate: 'bg-slate-50 dark:bg-slate-800',
    primary: 'bg-teal-50 dark:bg-teal-900/20',
    secondary: 'bg-slate-50 dark:bg-slate-800',
  };
  if (background !== 'none') {
    classes.push(backgroundMap[background]);
  }

  
  if (maxWidth) {
    const maxWidthMap: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    };
    classes.push(maxWidthMap[maxWidth]);
  }

  
  if (centered) {
    classes.push('mx-auto');
  }

  
  if (border) {
    classes.push('border', 'border-slate-200', 'dark:border-slate-700');
  }

  
  const shadowMap: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  if (shadow !== 'none') {
    classes.push(shadowMap[shadow]);
  }

  
  if (rounded) {
    classes.push('rounded-lg');
  }

  
  if (className) {
    classes.push(className);
  }

  return (
    <BaseSection className={classes.join(' ')} style={style} onClick={onClick}>
      
      {(title || subtitle) && (
        <Div className="mb-4">
          {title && <H2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</H2>}
          {subtitle && <P className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</P>}
        </Div>
      )}

      
      {children}
    </BaseSection>
  );
};
