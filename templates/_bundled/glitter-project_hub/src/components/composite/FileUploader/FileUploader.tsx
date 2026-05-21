

import { forwardRef, useImperativeHandle, useMemo, useRef, useCallback } from 'react';

import { Div } from '../../basic/Div';
import { ConfirmDialog } from '../ConfirmDialog';
import { ImageGallery, GalleryImage } from '../ImageGallery';

import { FileUploaderProvider } from './FileUploaderContext';
import { useFileUploader } from './useFileUploader';
import { FileDropZone } from './FileDropZone';
import { FileList } from './FileList';
import type { FileUploaderProps, FileUploaderRef, Attachment, PendingFile } from './types';
import { t } from './utils';


const EMPTY_FILES: Attachment[] = [];
const EMPTY_ROLE_IDS: number[] = [];



export const FileUploader = forwardRef<FileUploaderRef, FileUploaderProps>(
  (
    {
      uploadTriggerEvent,
      attachmentableType,
      attachmentableId,
      collection = 'default',
      maxFiles = 10,
      maxSize = 10,
      maxConcurrentUploads = 3,
      accept,
      imageCompression: compressionOptions,
      roleIds = EMPTY_ROLE_IDS,
      autoUpload = true,
      onFilesChange,
      onChange,
      onUploadComplete,
      onUploadError,
      onRemove,
      onReorder,
      initialFiles = EMPTY_FILES,
      className = '',
      confirmBeforeRemove = false,
      confirmRemoveTitle,
      confirmRemoveMessage,
      apiEndpoints,
      uploadParams,
      enablePrimarySelection = false,
      primaryFileId,
      onPrimaryChange,
    },
    ref
  ) => {
    
    const endpoints = {
      upload: apiEndpoints?.upload ?? '/api/attachments',
      delete: apiEndpoints?.delete ?? '/api/attachments/:id',
      reorder: apiEndpoints?.reorder ?? '/api/attachments/reorder',
    };

    
    
    
    
    
    const callbackRef = useRef(onChange ?? onFilesChange);
    callbackRef.current = onChange ?? onFilesChange;

    const wrappedOnFilesChange = useCallback(
      (files: import('./types').PendingFile[]) => {
        const cb = callbackRef.current;
        if (!cb) return;
        
        const syntheticEvent = {
          target: { value: files, files },
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        cb(syntheticEvent as any);
      },
      [] 
    );

    
    const uploader = useFileUploader({
      attachmentableType,
      attachmentableId,
      collection,
      maxFiles,
      maxSize,
      maxConcurrentUploads,
      accept,
      imageCompression: compressionOptions,
      roleIds,
      autoUpload,
      initialFiles,
      endpoints,
      onFilesChange: wrappedOnFilesChange,
      onUploadComplete,
      onUploadError,
      onRemove,
      onReorder,
      uploadTriggerEvent,
      confirmBeforeRemove,
      uploadParams,
    });

    
    useImperativeHandle(ref, () => ({
      uploadAll: uploader.handleUploadAll,
      clear: uploader.clear,
      getPendingFiles: uploader.getPendingFiles,
    }));

    
    const galleryImages: GalleryImage[] = useMemo(() => {
      return uploader.imageFiles.map((item) => {
        const isPending = !('hash' in item);
        const pendingItem = item as PendingFile;
        const attachmentItem = item as Attachment;

        if (isPending) {
          
          return {
            src: pendingItem.preview || '',
            filename: pendingItem.original_filename,
            title: pendingItem.original_filename,
            downloadRequiresAuth: false,
          };
        } else {
          
          const cachedUrl = uploader.authenticatedImageUrls.get(attachmentItem.id);
          return {
            src: cachedUrl || attachmentItem.download_url,
            downloadUrl: attachmentItem.download_url,
            filename: attachmentItem.original_filename,
            title: attachmentItem.original_filename,
            downloadRequiresAuth: true,
          };
        }
      });
    }, [uploader.imageFiles, uploader.authenticatedImageUrls]);

    
    const contextValue = useMemo(() => ({
      
      existingFiles: uploader.existingFiles,
      pendingFiles: uploader.pendingFiles,
      isDragOver: uploader.isDragOver,
      isDeleting: uploader.isDeleting,

      
      maxFiles,
      maxSize,
      accept,
      endpoints,
      confirmBeforeRemove,

      
      totalCount: uploader.totalCount,
      hasFiles: uploader.hasFiles,
      canAddMore: uploader.canAddMore,
      allItems: uploader.allItems,
      imageFiles: uploader.imageFiles,

      
      handleFiles: uploader.handleFiles,
      handleRemove: uploader.handleRemove,
      handleRetry: uploader.handleRetry,
      handleUploadAll: uploader.handleUploadAll,
      handleOpenGallery: uploader.handleOpenGallery,
      handleDownload: uploader.handleDownload,
      handleDragEnd: uploader.handleDragEnd,

      
      setIsDragOver: uploader.setIsDragOver,

      
      inputRef: uploader.inputRef,

      
      galleryOpen: uploader.galleryOpen,
      setGalleryOpen: uploader.setGalleryOpen,
      galleryStartIndex: uploader.galleryStartIndex,
      galleryKeyRef: uploader.galleryKeyRef,

      
      confirmDialogOpen: uploader.confirmDialogOpen,
      setConfirmDialogOpen: uploader.setConfirmDialogOpen,
      itemToDelete: uploader.itemToDelete,
      executeRemoveAttachment: uploader.executeRemoveAttachment,

      
      authenticatedImageUrls: uploader.authenticatedImageUrls,
    }), [uploader, maxFiles, maxSize, accept, endpoints, confirmBeforeRemove]);

    return (
      <FileUploaderProvider value={contextValue}>
        <Div className={className}>
          
          <FileDropZone
            isDragOver={uploader.isDragOver}
            canAddMore={uploader.canAddMore}
            onFiles={uploader.handleFiles}
            setIsDragOver={uploader.setIsDragOver}
            inputRef={uploader.inputRef}
            accept={accept}
            maxFiles={maxFiles}
            maxSize={maxSize}
          >
            
            {uploader.hasFiles && (
              <FileList
                allItems={uploader.allItems}
                canAddMore={uploader.canAddMore}
                totalCount={uploader.totalCount}
                maxFiles={maxFiles}
                maxSize={maxSize}
                accept={accept}
                onRemove={uploader.handleRemove}
                onRetry={uploader.handleRetry}
                onImageClick={uploader.handleOpenGallery}
                onDownload={uploader.handleDownload}
                onDragEnd={uploader.handleDragEnd}
                onAddClick={() => uploader.inputRef.current?.click()}
                enablePrimarySelection={enablePrimarySelection}
                primaryFileId={primaryFileId}
                onPrimaryChange={onPrimaryChange}
              />
            )}
          </FileDropZone>

          
          {confirmBeforeRemove && (
            <ConfirmDialog
              isOpen={uploader.confirmDialogOpen}
              onClose={() => {
                if (!uploader.isDeleting) {
                  uploader.setConfirmDialogOpen(false);
                }
              }}
              title={confirmRemoveTitle ?? t('attachment.delete_confirm_title')}
              message={confirmRemoveMessage ?? t('attachment.delete_confirm_message')}
              confirmText={t('common.delete')}
              confirmButtonVariant="danger"
              onConfirm={() => {
                if (uploader.itemToDelete) {
                  uploader.executeRemoveAttachment(uploader.itemToDelete);
                }
              }}
              isLoading={uploader.isDeleting}
              loadingText={t('attachment.deleting')}
            />
          )}

          
          {galleryImages.length > 0 && uploader.galleryOpen && (
            <ImageGallery
              key={`gallery-${uploader.galleryKeyRef.current}`}
              images={galleryImages}
              isOpen={true}
              onClose={() => uploader.setGalleryOpen(false)}
              startIndex={uploader.galleryStartIndex}
              showDownload={true}
            />
          )}
        </Div>
      </FileUploaderProvider>
    );
  }
);

FileUploader.displayName = 'FileUploader';

export default FileUploader;