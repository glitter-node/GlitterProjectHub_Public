import React, { useCallback, useState } from 'react';
import { Div } from '../basic/Div';
import { Label } from '../basic/Label';
import { Button } from '../basic/Button';
import { Textarea } from '../basic/Textarea';
import { Input } from '../basic/Input';
import { HtmlContent } from './HtmlContent';


const G7Core = () => (window as any).G7Core;


const t = (key: string, params?: Record<string, string | number>) =>
  G7Core()?.t?.(key, params) ?? key;

export interface HtmlEditorProps {
  
  content?: string;

  
  onChange?: (event: { target: { name: string; value: string } }) => void;

  
  isHtml?: boolean;

  
  onIsHtmlChange?: (event: { target: { name: string; checked: boolean } }) => void;

  
  rows?: number;

  
  placeholder?: string;

  
  label?: string;

  
  showHtmlModeToggle?: boolean;

  
  contentClassName?: string;

  
  purifyConfig?: any;

  
  className?: string;

  
  name?: string;

  
  htmlFieldName?: string;

  
  readOnly?: boolean;
}


export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  content = '',
  onChange,
  isHtml: isHtmlProp = false,
  onIsHtmlChange,
  rows = 15,
  placeholder = '',
  label,
  showHtmlModeToggle = true,
  contentClassName = '',
  purifyConfig,
  className = '',
  name = 'content',
  htmlFieldName = 'content_mode',
  readOnly = false,
}) => {
  
  const [isHtml, setIsHtml] = useState(isHtmlProp);

  
  const [localContent, setLocalContent] = useState(content);

  
  const [previewMode, setPreviewMode] = useState(false);

  
  React.useEffect(() => {
    setIsHtml(isHtmlProp);
  }, [isHtmlProp]);

  
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;

    
    setLocalContent(newContent);

    
    if (onChange) {
      const event = G7Core()?.createChangeEvent?.({ value: newContent, name, type: 'textarea' })
        ?? { target: { name, value: newContent } };
      onChange(event);
    }
  }, [onChange, name]);

  
  const handleHtmlModeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isHtmlMode = e.target.checked;

    
    setIsHtml(isHtmlMode);

    
    if (!isHtmlMode) {
      setPreviewMode(false);
    }

    
    if (onIsHtmlChange) {
      const event = G7Core()?.createChangeEvent?.({ checked: isHtmlMode, name: htmlFieldName, type: 'checkbox' })
        ?? { target: { name: htmlFieldName, checked: isHtmlMode } };
      onIsHtmlChange(event);
    }
  }, [onIsHtmlChange, htmlFieldName]);

  
  const handlePreviewModeToggle = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  return (
    <Div className={`space-y-2 ${className}`}>
      <Div className="flex items-center justify-between">

        {label && (
          <Label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </Label>
        )}

        <Div className="flex items-center gap-3">
          {isHtml && !readOnly && (
            <Button
              type="button"
              onClick={handlePreviewModeToggle}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 ${
                previewMode
                  ? 'text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 hover:bg-slate-300 dark:hover:bg-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500'
                  : 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700 border border-teal-300 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-slate-600 focus:ring-teal-500 dark:focus:ring-teal-600'
              }`}
            >
              {previewMode ? t('common.preview_off') : t('common.preview')}
            </Button>
          )}

          {showHtmlModeToggle && (
            <Label className="flex items-center gap-2 p-2 cursor-pointer">
              <Input
                type="checkbox"
                name={htmlFieldName}
                checked={isHtml}
                onChange={handleHtmlModeChange}
                disabled={readOnly}
                className="w-4 h-4 text-teal-600 bg-slate-100 border-slate-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <Div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('common.html_mode')}
              </Div>
            </Label>
          )}
        </Div>
      </Div>

      {!previewMode && (
        <Textarea
          name={name}
          value={localContent}
          onChange={handleContentChange}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={`block w-full rounded-lg border px-3 py-2 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHtml
              ? 'font-mono bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-600 text-slate-800 dark:text-slate-200 focus:border-teal-500 focus:ring-teal-500'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-teal-500'
          }`}
        />
      )}

      {previewMode && (
        <Div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 min-h-[400px]">
          <HtmlContent
            content={localContent}
            isHtml={true}
            className={contentClassName || 'prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100'}
            purifyConfig={purifyConfig}
          />
        </Div>
      )}

    </Div>
  );
};
