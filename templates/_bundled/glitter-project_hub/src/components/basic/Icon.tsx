import React from 'react';
import { IconName, IconStyle, IconSize, iconNameMap } from './IconTypes';
export interface IconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  name: string | IconName;
  iconStyle?: IconStyle;
  style?: React.CSSProperties;
  size?: IconSize;
  color?: string;
  spin?: boolean;
  pulse?: boolean;
  fixedWidth?: boolean;
  ariaLabel?: string;
}


export const Icon: React.FC<IconProps> = ({
  name,
  iconStyle = 'solid',
  size,
  color,
  spin = false,
  pulse = false,
  fixedWidth = false,
  ariaLabel,
  className = '',
  style,
  ...props
}) => {
  const styleClassMap: Record<IconStyle, string> = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab',
  };
  const rawName = typeof name === 'string' ? name : String(name);
  const mappedName = iconNameMap[rawName];
  const iconName = mappedName
    ? String(mappedName).replace(/^fa-/, '')
    : rawName.replace(/^fa-/, '');
  const classes = [
    styleClassMap[iconStyle],
    `fa-${iconName}`,
    size && `fa-${size}`,
    spin && 'fa-spin',
    pulse && 'fa-pulse',
    fixedWidth && 'fa-fw',
    color,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const accessibilityLabel = ariaLabel || iconName.replace(/-/g, ' ');
  return (
    <i
      className={classes}
      style={style}
      aria-label={accessibilityLabel}
      role="img"
      {...props}
    />
  );
};
