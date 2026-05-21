import { default as React } from 'react';
import { IconName } from '../basic/IconTypes';
export interface NotificationItem {
    id: string | number;
    title: string;
    message: string;
    time: string;
    read?: boolean;
    url?: string;
    iconName?: IconName;
    data?: Record<string, unknown>;
    onClick?: () => void;
}
export interface NotificationCenterProps {
    notifications?: NotificationItem[];
    unreadCount?: number;
    hasMore?: boolean;
    loading?: boolean;
    titleText?: string;
    emptyText?: string;
    markAllReadText?: string;
    deleteAllText?: string;
    unreadOnlyText?: string;
    unreadOnly?: boolean;
    onNotificationClick?: (notification: NotificationItem) => void;
    onClose?: (visibleUnreadIds: (string | number)[]) => void;
    onLoadMore?: () => void;
    onMarkAllRead?: () => void;
    onDeleteAll?: () => void;
    onDelete?: (notification: NotificationItem) => void;
    onUnreadOnlyToggle?: (checked: boolean) => void;
    onRefresh?: () => void;
    dropdownAlign?: 'left' | 'right';
    className?: string;
}
export declare const NotificationCenter: React.FC<NotificationCenterProps>;
export default NotificationCenter;
