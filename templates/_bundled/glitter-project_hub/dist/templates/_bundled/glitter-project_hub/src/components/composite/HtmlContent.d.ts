import { default as React } from 'react';
export interface HtmlContentProps {
    content?: string;
    isHtml?: boolean;
    className?: string;
    purifyConfig?: any;
    text?: string;
}
export declare const HtmlContent: React.FC<HtmlContentProps>;
