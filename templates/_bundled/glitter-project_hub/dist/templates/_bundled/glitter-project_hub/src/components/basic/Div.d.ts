import { default as React } from 'react';
export interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement>;
}
export declare const Div: React.ForwardRefExoticComponent<Omit<DivProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
