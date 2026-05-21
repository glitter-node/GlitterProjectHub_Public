import { default as React } from 'react';
export interface HrProps extends React.HTMLAttributes<HTMLHRElement> {
    ref?: React.Ref<HTMLHRElement>;
}
export declare const Hr: React.ForwardRefExoticComponent<Omit<HrProps, "ref"> & React.RefAttributes<HTMLHRElement>>;
