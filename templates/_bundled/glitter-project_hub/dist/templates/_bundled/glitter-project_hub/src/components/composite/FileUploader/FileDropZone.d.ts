import { default as React } from 'react';
export interface FileDropZoneProps {
    isDragOver: boolean;
    canAddMore: boolean;
    onFiles: (files: FileList) => void;
    setIsDragOver: (value: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    accept?: string;
    maxFiles: number;
    maxSize: number;
    children?: React.ReactNode;
}
export declare const FileDropZone: React.FC<FileDropZoneProps>;
export default FileDropZone;
