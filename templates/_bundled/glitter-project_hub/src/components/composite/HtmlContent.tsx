import React, { useMemo } from 'react';

import DOMPurify from 'dompurify';
import { Div } from '../basic/Div';

export interface HtmlContentProps {
  
  content?: string;

  
  isHtml?: boolean;

  
  className?: string;

  
  purifyConfig?: any;

  
  text?: string;
}


export const HtmlContent: React.FC<HtmlContentProps> = ({
  content,
  text,
  isHtml = true,
  className = '',
  purifyConfig,
}) => {
  
  const actualContent = text ?? content ?? '';

  
  if (!actualContent || actualContent.trim() === '') {
    return null;
  }

  
  if (!isHtml) {
    const textClasses = `
      whitespace-pre-wrap
      text-slate-900 dark:text-slate-100
      font-sans
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <Div className={textClasses}>
        {actualContent}
      </Div>
    );
  }

  // 기본 DOMPurify 설정 (FORBID 방식: 위험 태그/속성만 차단, 나머지 허용)
  const defaultConfig: any = {
    FORBID_TAGS: [
      // 스크립트 실행
      'script', 'noscript',
      // 외부 콘텐츠 삽입
      'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'portal',
      // 폼 요소 (피싱 방지)
      'form', 'input', 'textarea', 'select', 'button',
      // 메타/스타일 조작
      'style', 'link', 'meta', 'base',
      // 구조 태그 주입
      'body', 'head', 'html', 'title',
      // SVG/MathML (XSS 벡터)
      'svg', 'math',
      // 미디어 이벤트 핸들러 (onerror, onloadstart)
      'audio', 'video', 'source', 'track', 'canvas',
      // UI 오버레이/이벤트
      'details', 'dialog',
      // HTML 파서 혼란/sanitizer 우회
      'plaintext', 'xmp', 'listing',
      // 레거시/비표준
      'marquee', 'noframes', 'noembed', 'template', 'slot',
    ],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'ontoggle', 'oncanplay', 'onloadstart',
      'formaction', 'xlink:href', 'action',
    ],
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['target'],
  };

  // sanitize된 HTML을 메모이제이션
  const sanitizedHtml = useMemo(() => {
    const config = purifyConfig
      ? {
          ...defaultConfig,
          ...purifyConfig,
          // 보안 기본값은 항상 유지 (사용자 설정으로 덮어쓰기 방지)
          FORBID_TAGS: [...defaultConfig.FORBID_TAGS, ...(purifyConfig.FORBID_TAGS || [])],
          FORBID_ATTR: [...defaultConfig.FORBID_ATTR, ...(purifyConfig.FORBID_ATTR || [])],
        }
      : defaultConfig;
    const cleaned = DOMPurify.sanitize(actualContent, config) as unknown as string;

    // target="_blank" 링크에 rel 속성 추가 (보안)
    return cleaned.replace(
      /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
      (match: string, before: string, href: string, after: string) => {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!match.includes('rel=')) {
            return `<a ${before}href="${href}"${after} rel="noopener noreferrer">`;
          }
        }
        return match;
      }
    );
  }, [actualContent, purifyConfig]);

  // 컨테이너 클래스 조합
  const containerClasses = `
    prose dark:prose-invert max-w-none
    prose-p:my-2
    prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4
    prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
    prose-a:text-teal-600 dark:prose-a:text-teal-400
    prose-a:no-underline hover:prose-a:underline
    prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600
    prose-blockquote:pl-4 prose-blockquote:italic
    prose-code:bg-slate-100 dark:prose-code:bg-slate-800
    prose-code:px-1 prose-code:py-0.5 prose-code:rounded
    prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
    prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
    [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300
    dark:[&_table]:border-slate-600
    [&_th]:border [&_th]:border-slate-300 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-slate-100 [&_th]:text-left
    dark:[&_th]:border-slate-600 dark:[&_th]:bg-slate-800
    [&_td]:border [&_td]:border-slate-300 [&_td]:px-4 [&_td]:py-2
    dark:[&_td]:border-slate-600
    [&_tr:hover]:bg-slate-50 dark:[&_tr:hover]:bg-slate-700/50
    after:content-[''] after:block after:clear-both
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Div
      className={containerClasses}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
