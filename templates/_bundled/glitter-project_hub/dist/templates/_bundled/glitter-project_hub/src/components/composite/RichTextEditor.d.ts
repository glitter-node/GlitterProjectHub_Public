import { default as React } from 'react';
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
declare const RichTextEditor: React.FC<RichTextEditorProps>;
export default RichTextEditor;
