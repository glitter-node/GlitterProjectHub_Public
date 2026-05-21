import { default as React } from 'react';
export interface ExpandableContentProps {
    maxHeight?: number;
    expandText?: string;
    collapseText?: string;
    className?: string;
    children?: React.ReactNode;
}
export declare const ExpandableContent: React.FC<ExpandableContentProps>;
export default ExpandableContent;
