import { default as React } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { Attachment, PendingFile } from './types';
export interface FileListProps {
    allItems: (Attachment | PendingFile)[];
    canAddMore: boolean;
    totalCount: number;
    maxFiles: number;
    maxSize: number;
    accept?: string;
    onRemove: (item: PendingFile | Attachment) => void;
    onRetry: (pendingFile: PendingFile) => void;
    onImageClick: (item: PendingFile | Attachment) => void;
    onDownload: (item: Attachment) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onAddClick: () => void;
    enablePrimarySelection?: boolean;
    primaryFileId?: number | string | null;
    onPrimaryChange?: (id: number | string | null) => void;
}
export declare const FileList: React.FC<FileListProps>;
export default FileList;
