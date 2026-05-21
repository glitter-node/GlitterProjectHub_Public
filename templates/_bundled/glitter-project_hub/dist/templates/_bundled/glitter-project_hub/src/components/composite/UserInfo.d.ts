import { default as React } from 'react';
export interface MenuItemConfig {
    key: string;
    label: string;
    icon?: string;
    path?: string;
    onClick?: () => void;
    show?: boolean;
}
export interface AuthorInfo {
    id?: string | number;
    uuid?: string;
    name?: string;
    avatar?: string;
    status?: 'active' | 'inactive' | 'blocked' | 'withdrawn';
    is_guest?: boolean;
}
export interface UserInfoProps {
    author?: AuthorInfo;
    name?: string;
    userId?: string | number;
    subText?: string;
    subTextTitle?: string;
    isGuest?: boolean;
    isWithdrawn?: boolean;
    showDropdown?: boolean;
    clickable?: boolean;
    profilePath?: string;
    className?: string;
    layout?: 'vertical' | 'horizontal';
    text?: string;
    stopPropagation?: boolean;
    menuItems?: MenuItemConfig[];
    hideMenuItems?: string[];
    appendMenuItems?: MenuItemConfig[];
}
export declare const UserInfo: React.FC<UserInfoProps>;
