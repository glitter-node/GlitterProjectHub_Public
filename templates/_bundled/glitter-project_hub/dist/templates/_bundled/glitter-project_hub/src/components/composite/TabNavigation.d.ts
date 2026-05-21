import { default as React } from 'react';
import { IconName } from '../basic/IconTypes';
export interface Tab {
    id: string | number;
    label: string;
    iconName?: IconName;
    disabled?: boolean;
    badge?: string | number;
}
export interface TabNavigationProps {
    tabs: Tab[];
    activeTabId?: string | number;
    onTabChange?: (tabId: string | number) => void;
    variant?: 'default' | 'pills' | 'underline';
    className?: string;
    style?: React.CSSProperties;
    hiddenTabIds?: (string | number)[];
    mobileBreakpoint?: number;
}
export declare const TabNavigation: React.FC<TabNavigationProps>;
