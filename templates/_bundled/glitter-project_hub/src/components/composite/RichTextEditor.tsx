

import React, { useEffect, useRef, useState } from 'react';
import { Div } from '../basic/Div';


const logger = ((window as any).G7Core?.createLogger?.('Comp:RichTextEditor')) ?? {
    log: (...args: unknown[]) => console.log('[Comp:RichTextEditor]', ...args),
    warn: (...args: unknown[]) => console.warn('[Comp:RichTextEditor]', ...args),
    error: (...args: unknown[]) => console.error('[Comp:RichTextEditor]', ...args),
};
import { Button } from '../basic/Button';
import { Input } from '../basic/Input';
import { Textarea } from '../basic/Textarea';
import { H3 } from '../basic/H3';
import { Label } from '../basic/Label';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

interface RichTextEditorProps {
  
  name: string;
  
  initialValue?: string;
  
  placeholder?: string;
  
  onChange?: (html: string) => void;
  
  imageUploadUrl?: string;
  
  minHeight?: string;
  
  disabled?: boolean;
  
  className?: string;
}

type FormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'image';


const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  initialValue = '',
  placeholder,
  onChange,
  imageUploadUrl = '/api/upload/image',
  minHeight = '300px',
  disabled = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialValue);
  const [showCodeView, setShowCodeView] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  
  useEffect(() => {
    
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  
  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
  }, [content, onChange]);

  
  const applyFormat = (format: FormatType) => {
    
    logger.log('Apply format:', format);
  };

  
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(imageUploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('업로드 실패');

      const data = await response.json();
      
      logger.log('Image uploaded:', data.url);
    } catch (error) {
      logger.error('이미지 업로드 오류:', error);
    }
  };

  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  
  const insertLink = () => {
    if (linkUrl) {
      
      logger.log('Insert link:', linkUrl);
      setShowLinkModal(false);
      setLinkUrl('');
    }
  };

  const toolbarButtons: { format: FormatType; icon: React.ReactNode; title: string }[] = [
    { format: 'bold', icon: 'B', title: t('editor.toolbar.bold') },
    { format: 'italic', icon: 'I', title: t('editor.toolbar.italic') },
    { format: 'underline', icon: 'U', title: t('editor.toolbar.underline') },
    { format: 'strike', icon: 'S', title: t('editor.toolbar.strike') },
    { format: 'code', icon: '</>', title: t('editor.toolbar.code') },
  ];

  const headingButtons: { format: FormatType; label: string }[] = [
    { format: 'h1', label: 'H1' },
    { format: 'h2', label: 'H2' },
    { format: 'h3', label: 'H3' },
  ];

  const listButtons: { format: FormatType; icon: string; title: string }[] = [
    { format: 'bulletList', icon: '•', title: t('editor.toolbar.bullet_list') },
    { format: 'orderedList', icon: '1.', title: t('editor.toolbar.ordered_list') },
    { format: 'blockquote', icon: '❝', title: t('editor.toolbar.blockquote') },
  ];

  return (
    <Div className={`border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden ${className}`}>
      <Div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.format}
              type="button"
              onClick={() => applyFormat(btn.format)}
              disabled={disabled}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-50"
              title={btn.title}
            >
              {btn.icon}
            </Button>
          ))}
        </Div>

        <Div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          {headingButtons.map((btn) => (
            <Button
              key={btn.format}
              type="button"
              onClick={() => applyFormat(btn.format)}
              disabled={disabled}
              className="px-2 h-8 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-50"
            >
              {btn.label}
            </Button>
          ))}
        </Div>

        <Div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          {listButtons.map((btn) => (
            <Button
              key={btn.format}
              type="button"
              onClick={() => applyFormat(btn.format)}
              disabled={disabled}
              className="w-8 h-8 flex items-center justify-center text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-50"
              title={btn.title}
            >
              {btn.icon}
            </Button>
          ))}
        </Div>

        <Div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Button
            type="button"
            onClick={() => setShowLinkModal(true)}
            disabled={disabled}
            className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-50"
            title={t('editor.toolbar.link')}
          >
            🔗
          </Button>
          <Label className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer">
            🖼
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
            />
          </Label>
        </Div>

        <Button
          type="button"
          onClick={() => setShowCodeView(!showCodeView)}
          disabled={disabled}
          className={`px-2 h-8 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-50 ${
            showCodeView ? 'bg-slate-200 dark:bg-slate-700' : ''
          }`}
        >
          {'</>'}
          {t('editor.toolbar.code_view')}
        </Button>
      </Div>

      {showCodeView ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-sm focus:outline-none resize-none"
          style={{ minHeight }}
        />
      ) : (
        <Div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          className="p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none prose dark:prose-invert max-w-none"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
      )}

      <Input type="hidden" name={name} value={content} />

      {showLinkModal && (
        <Div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96">
            <H3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              {t('editor.link_modal.title')}
            </H3>
            <Input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4"
            />
            <Div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {t('editor.link_modal.insert')}
              </Button>
            </Div>
          </Div>
        </Div>
      )}
    </Div>
  );
};

export default RichTextEditor;
