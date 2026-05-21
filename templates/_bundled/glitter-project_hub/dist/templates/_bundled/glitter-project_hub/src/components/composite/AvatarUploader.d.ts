export interface AvatarUploaderProps {
    src?: string;
    fallbackText?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    uploadEndpoint?: string;
    deleteEndpoint?: string;
    onUploadSuccess?: (data: {
        avatar: string;
        attachment_id: number;
    }) => void;
    onUploadError?: (error: Error) => void;
    onDeleteSuccess?: () => void;
    onDeleteError?: (error: Error) => void;
    showDeleteButton?: boolean;
    accept?: string;
    maxSize?: number;
    className?: string;
    uploadButtonText?: string;
    deleteButtonText?: string;
    readOnly?: boolean;
    confirmDelete?: boolean;
    deleteConfirmMessage?: string;
    confirmUpload?: boolean;
    uploadConfirmMessage?: string;
    uploadSuccessActions?: Array<Record<string, any>>;
    uploadErrorActions?: Array<Record<string, any>>;
    deleteSuccessActions?: Array<Record<string, any>>;
    deleteErrorActions?: Array<Record<string, any>>;
}
export declare function AvatarUploader({ src, fallbackText, size, uploadEndpoint, deleteEndpoint, onUploadSuccess, onUploadError, onDeleteSuccess, onDeleteError, showDeleteButton, accept, maxSize, className, uploadButtonText, deleteButtonText, readOnly, confirmDelete, deleteConfirmMessage, confirmUpload, uploadConfirmMessage, uploadSuccessActions, uploadErrorActions, deleteSuccessActions, deleteErrorActions, }: AvatarUploaderProps): import("react/jsx-runtime").JSX.Element;
export default AvatarUploader;
