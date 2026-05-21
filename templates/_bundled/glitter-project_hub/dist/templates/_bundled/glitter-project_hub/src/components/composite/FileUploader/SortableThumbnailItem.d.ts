import { default as React } from 'react';
import { Attachment, PendingFile } from './types';
export interface SortableThumbnailItemProps {
    file: PendingFile | (Attachment & {
        status?: string;
    });
    onRemove: () => void;
    onRetry?: () => void;
    onImageClick?: () => void;
    onDownload?: () => void;
    isPrimary?: boolean;
    onPrimaryClick?: () => void;
}
export declare const SortableThumbnailItem: React.FC<SortableThumbnailItemProps>;
export default SortableThumbnailItem;
