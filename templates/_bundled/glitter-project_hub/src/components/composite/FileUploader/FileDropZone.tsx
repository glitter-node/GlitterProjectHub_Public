

import React from 'react';

import { Div } from '../../basic/Div';
import { P } from '../../basic/P';
import { I } from '../../basic/I';

import { t } from './utils';

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

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragOver,
  canAddMore,
  onFiles,
  setIsDragOver,
  inputRef,
  accept,
  maxFiles,
  maxSize,
  children,
}) => {
  return (
    <Div
      className={`
        relative border-2 border-dashed rounded-lg transition-colors
        ${
          isDragOver
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : 'border-slate-300 dark:border-slate-600'
        }
      `}
      onDragOver={(e) => {
        e.preventDefault();
        if (canAddMore) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (canAddMore) {
          onFiles(e.dataTransfer.files);
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && onFiles(e.target.files)}
        className="hidden"
      />

      {!children && (
        <Div
          className="p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <I className="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 dark:text-slate-500 mb-4" />
          <P className="text-sm text-slate-600 dark:text-slate-400">
            {t('attachment.drop_or_click')}
          </P>
          <P className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {t('attachment.upload_limit', { maxFiles, maxSize })}
            {accept && ` (${accept})`}
          </P>
        </Div>
      )}

      {children}
    </Div>
  );
};

export default FileDropZone;
