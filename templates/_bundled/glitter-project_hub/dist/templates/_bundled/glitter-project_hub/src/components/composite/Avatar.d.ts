import { default as React } from 'react';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export interface AuthorInfo {
    id?: string | number;
    name?: string;
    avatar?: string;
    status?: 'active' | 'inactive' | 'blocked' | 'withdrawn';
    is_guest?: boolean;
}
export interface AvatarProps {
    author?: AuthorInfo;
    name?: string;
    avatar?: string;
    size?: AvatarSize;
    className?: string;
    text?: string;
    isWithdrawn?: boolean;
    isGuest?: boolean;
}
export declare const Avatar: React.FC<AvatarProps>;
