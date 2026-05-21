import { default as React } from 'react';
export interface SearchSuggestion {
    id: string | number;
    text: string;
}
export interface SearchBarProps {
    name?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    showButton?: boolean;
    suggestions?: SearchSuggestion[];
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    showSuggestions?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const SearchBar: React.FC<SearchBarProps>;
