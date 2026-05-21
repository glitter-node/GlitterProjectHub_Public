import React from 'react';
import { Div } from '../basic/Div';

export interface ThreeColumnLayoutProps {
  
  leftWidth?: string;

  
  rightWidth?: string;

  
  leftSlot?: React.ReactNode;

  
  centerSlot?: React.ReactNode;

  
  rightSlot?: React.ReactNode;

  
  className?: string;

  
  style?: React.CSSProperties;
}


export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftWidth = '250px',
  rightWidth = '300px',
  leftSlot,
  centerSlot,
  rightSlot,
  className = '',
  style,
}) => {
  
  const containerClasses = `flex flex-row w-full h-full ${className}`.trim();

  const leftStyle: React.CSSProperties = {
    width: leftWidth,
    flexShrink: 0,
  };

  const rightStyle: React.CSSProperties = {
    width: rightWidth,
    flexShrink: 0,
  };

  return (
    <Div className={containerClasses} style={style}>
      <Div className="flex flex-col" style={leftStyle}>
        {leftSlot}
      </Div>

      <Div className="flex flex-col flex-1 min-w-0">
        {centerSlot}
      </Div>

      <Div className="flex flex-col" style={rightStyle}>
        {rightSlot}
      </Div>
    </Div>
  );
};
