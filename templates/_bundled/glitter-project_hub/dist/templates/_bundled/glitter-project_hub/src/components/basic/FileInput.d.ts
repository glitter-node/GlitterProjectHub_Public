import { default as React } from 'react';
export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'onError'> {
    accept?: string;
    maxSize?: number;
    onChange?: (file: File | null) => void;
    onError?: (error: string) => void;
    buttonText?: string;
    placeholder?: string;
}
export declare const FileInput: React.ForwardRefExoticComponent<FileInputProps & React.RefAttributes<HTMLInputElement>>;
