

import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Div } from '../../basic/Div';
import { Button } from '../../basic/Button';
import { Span } from '../../basic/Span';
import { P } from '../../basic/P';
import { I } from '../../basic/I';
import { Img } from '../../basic/Img';

import type { Attachment, PendingFile } from './types';
import { getFileIcon, t } from './utils';


const G7Core = (window as any).G7Core;

export interface SortableThumbnailItemProps {
  file: PendingFile | (Attachment & { status?: string });
  onRemove: () => void;
  onRetry?: () => void;
  
  onImageClick?: () => void;
  
  onDownload?: () => void;
  
  isPrimary?: boolean;
  
  onPrimaryClick?: () => void;
}

export const SortableThumbnailItem: React.FC<SortableThumbnailItemProps> = ({
  file,
  onRemove,
  onRetry,
  onImageClick,
  onDownload,
  isPrimary,
  onPrimaryClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: 'hash' in file ? file.hash : file.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPending = 'status' in file && file.status !== undefined;
  const status = isPending ? (file as PendingFile).status : 'done';
  const isUploading = status === 'uploading';
  const isCompressing = status === 'compressing';
  const hasError = status === 'error';
  const progress = isPending ? (file as PendingFile).progress : 100;
  const preview = isPending ? (file as PendingFile).preview : undefined;
  
  const isImage = !isPending
    ? (file as Attachment).is_image
    : (file.mime_type?.startsWith('image/') ?? false);

  
  const [authenticatedImageUrl, setAuthenticatedImageUrl] = useState<string | undefined>(undefined);
  const downloadUrl = !isPending && isImage ? (file as Attachment).download_url : undefined;

  
  useEffect(() => {
    if (!downloadUrl) {
      setAuthenticatedImageUrl(undefined);
      return;
    }

    let isMounted = true;
    let objectUrl: string | undefined;

    const loadAuthenticatedImage = async () => {
      try {
        const blob = await G7Core.api.get(downloadUrl, {
          responseType: 'blob',
        });
        if (isMounted && blob) {
          objectUrl = URL.createObjectURL(blob);
          setAuthenticatedImageUrl(objectUrl);
        }
      } catch (error) {
        console.error('Failed to load authenticated image:', error);
      }
    };

    loadAuthenticatedImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [downloadUrl]);

  
  const existingImageUrl = authenticatedImageUrl;

  return (
    <Div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
    >
      
      <Div
        className={`aspect-square w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative ${
          (isImage || !isPending) ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          // 업로드 중/압축 중이면 클릭 무시
          if (isUploading || isCompressing) return;

          if (isImage && onImageClick) {
            // 이미지는 갤러리 열기
            onImageClick();
          } else if (!isPending && onDownload) {
            // 비이미지 기존 파일은 다운로드
            onDownload();
          }
        }}
      >
        {(preview || existingImageUrl) ? (
          <Img
            src={preview || existingImageUrl}
            alt={file.original_filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <I className={`fa-solid ${getFileIcon(file.mime_type)} text-4xl text-slate-400 dark:text-slate-500`} />
        )}

        {(isUploading || isCompressing) && (
          <Div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <Div className="w-3/4 h-2 bg-slate-700 rounded-full overflow-hidden">
              <Div
                className="h-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </Div>
            <Span className="text-white text-xs mt-1">{progress}%</Span>
          </Div>
        )}

        {hasError && (
          <Div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
            <I className="fa-solid fa-exclamation-triangle text-2xl text-white" />
          </Div>
        )}

        {onPrimaryClick && (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrimaryClick();
            }}
            className={`absolute top-1.5 left-1.5 z-10 p-1 rounded-full transition-colors ${
              isPrimary
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-teal-600 hover:text-white opacity-0 group-hover:opacity-100'
            }`}
            title={isPrimary ? t('attachment.primary_image') : t('attachment.set_as_primary')}
          >
            <I className="fa-solid fa-star text-xs" />
          </Button>
        )}

        <Div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-start justify-end p-1 gap-1 opacity-0 group-hover:opacity-100">
          <Button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded text-slate-600 dark:text-slate-300 hover:bg-white cursor-grab active:cursor-grabbing"
            title={t('attachment.drag_to_reorder')}
            onClick={(e) => e.stopPropagation()}
          >
            <I className="fa-solid fa-grip-vertical text-sm" />
          </Button>

          {!isPending && onDownload && (
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded text-teal-500 hover:bg-white"
              title={t('common.download')}
            >
              <I className="fa-solid fa-download text-sm" />
            </Button>
          )}

          {hasError && onRetry && (
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded text-orange-500 hover:bg-white"
              title={t('common.retry')}
            >
              <I className="fa-solid fa-arrow-rotate-right text-sm" />
            </Button>
          )}

          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={isUploading || isCompressing}
            className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded text-red-500 hover:bg-white disabled:opacity-50"
            title={t('common.delete')}
          >
            <I className="fa-solid fa-times text-sm" />
          </Button>
        </Div>
      </Div>

      <Div
        className={`p-2 ${!isPending && onDownload ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700' : ''}`}
        onClick={() => {
          // 기존 첨부파일만 클릭 시 다운로드
          if (!isPending && onDownload) {
            onDownload();
          }
        }}
      >
        <P className="text-xs font-medium text-slate-900 dark:text-white truncate" title={file.original_filename}>
          {file.original_filename}
        </P>
        <P className="text-xs text-slate-500 dark:text-slate-400">
          {isPending ? (file as PendingFile).size_formatted : (file as Attachment).size_formatted}
        </P>
      </Div>
    </Div>
  );
};

export default SortableThumbnailItem;
