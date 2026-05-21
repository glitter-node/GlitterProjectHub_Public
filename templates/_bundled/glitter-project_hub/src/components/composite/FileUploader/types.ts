



export interface Attachment {
  id: number;
  hash: string;
  original_filename: string;
  mime_type: string;
  size: number;
  size_formatted: string;
  download_url: string;
  order: number;
  is_image: boolean;
  meta?: Record<string, unknown>;
}

export interface PendingFile {
  id: string;
  file: File;
  compressedBlob?: Blob;
  original_filename: string;
  mime_type: string;
  size: number;
  size_formatted: string;
  preview?: string;
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

export interface FileUploaderProps {
  
  uploadTriggerEvent?: string;
  
  attachmentableType?: string;
  
  attachmentableId?: number;
  
  collection?: string;
  
  maxFiles?: number;
  
  maxSize?: number;
  
  maxConcurrentUploads?: number;
  
  accept?: string;
  
  imageCompression?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
  };
  
  roleIds?: number[];
  
  autoUpload?: boolean;
  
  onFilesChange?: (files: PendingFile[]) => void;
  
  onChange?: (...args: any[]) => void;
  
  onUploadComplete?: (attachments: Attachment[]) => void;
  
  onUploadError?: (error: string, file: File) => void;
  
  onRemove?: (id: number | string) => void;
  
  onReorder?: (files: Attachment[]) => void;
  
  initialFiles?: Attachment[];
  
  className?: string;
  
  confirmBeforeRemove?: boolean;
  
  confirmRemoveTitle?: string;
  
  confirmRemoveMessage?: string;
  
  uploadParams?: Record<string, string>;
  
  enablePrimarySelection?: boolean;
  
  primaryFileId?: number | string | null;
  
  onPrimaryChange?: (id: number | string | null) => void;
  
  apiEndpoints?: {
    
    upload?: string;
    
    delete?: string;
    
    reorder?: string;
  };
}

export interface FileUploaderRef {
  
  uploadAll: () => Promise<Attachment[]>;
  
  clear: () => void;
  
  getPendingFiles: () => PendingFile[];
}

export interface ApiEndpoints {
  upload: string;
  delete: string;
  reorder: string;
}
