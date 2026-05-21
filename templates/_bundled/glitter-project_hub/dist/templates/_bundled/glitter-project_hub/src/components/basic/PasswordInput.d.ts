import { default as React } from 'react';
export interface PasswordRule {
    key: string;
    labelKey: string;
    validate: (value: string, param?: number) => boolean;
    defaultParam?: number;
}
export declare const availablePasswordRules: Record<string, PasswordRule>;
export declare const defaultPasswordRules: PasswordRule[];
export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    showToggle?: boolean;
    showValidation?: boolean;
    isConfirmField?: boolean;
    confirmTarget?: string;
    onMatchChange?: (isMatch: boolean) => void;
    onValidityChange?: (isValid: boolean, failedRules: string[]) => void;
    rules?: PasswordRule[];
    enableRules?: string[];
    showRules?: string[];
    wrapperClassName?: string;
    validationClassName?: string;
}
export declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
