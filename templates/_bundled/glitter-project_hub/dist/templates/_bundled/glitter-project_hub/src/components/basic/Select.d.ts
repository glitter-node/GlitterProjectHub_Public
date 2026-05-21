import { default as React } from 'react';
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    options?: SelectOption[] | string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement> | {
        target: {
            value: string | number;
        };
    }) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
}
export declare const Select: React.FC<SelectProps>;
