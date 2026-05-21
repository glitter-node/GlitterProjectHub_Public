import { default as React } from 'react';
import { IconName, IconStyle, IconSize } from './IconTypes';
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
export declare const Icon: React.FC<IconProps>;
