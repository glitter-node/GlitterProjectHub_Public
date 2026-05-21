import { default as React } from 'react';
import { NotificationItem } from './NotificationCenter';
interface Board {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}
interface User {
    uuid: string;
    name: string;
    avatar?: string;
    is_admin?: boolean;
}
interface HeaderProps {
    logo?: string;
    siteName?: string;
    user?: User | null;
    notificationCount?: number;
    boards?: Board[];
    maxVisibleBoards?: number;
    onMobileMenuOpen?: () => void;
    availableLocales?: string[];
    currentLocale?: string;
    className?: string;
    notifications?: NotificationItem[];
    notificationHasMore?: boolean;
    notificationLoading?: boolean;
    notificationUnreadOnly?: boolean;
    notificationTitleText?: string;
    notificationEmptyText?: string;
    notificationMarkAllReadText?: string;
    notificationDeleteAllText?: string;
    notificationUnreadOnlyText?: string;
    onNotificationClose?: (visibleUnreadIds: (string | number)[]) => void;
    onNotificationClick?: (notification: NotificationItem) => void;
    onNotificationLoadMore?: () => void;
    onNotificationMarkAllRead?: () => void;
    onNotificationDeleteAll?: () => void;
    onNotificationDelete?: (notification: NotificationItem) => void;
    onNotificationUnreadOnlyToggle?: (checked: boolean) => void;
    onNotificationRefresh?: () => void;
}
declare const Header: React.FC<HeaderProps>;
export default Header;
