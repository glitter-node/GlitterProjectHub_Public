import { default as React } from 'react';
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
    ref?: React.Ref<HTMLElement>;
}
export declare const Footer: React.ForwardRefExoticComponent<Omit<FooterProps, "ref"> & React.RefAttributes<HTMLElement>>;
