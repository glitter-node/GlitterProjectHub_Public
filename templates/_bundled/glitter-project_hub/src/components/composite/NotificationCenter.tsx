import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';
import { Icon } from '../basic/Icon';
import { IconName } from '../basic/IconTypes';
import { Input } from '../basic/Input';


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


export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  unreadCount = 0,
  hasMore = false,
  loading = false,
  titleText = '알림',
  emptyText = '알림이 없습니다.',
  markAllReadText = '모두 읽음',
  deleteAllText = '모두 삭제',
  unreadOnlyText = '안 읽은 알림만',
  unreadOnly = false,
  onNotificationClick,
  onClose,
  onLoadMore,
  onMarkAllRead,
  onDeleteAll,
  onDelete,
  onUnreadOnlyToggle,
  onRefresh,
  dropdownAlign = 'right',
  className = '',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleUnreadIdsRef = useRef<Set<string | number>>(new Set());

  
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const notificationsCountRef = useRef(notifications.length);
  const onRefreshRef = useRef(onRefresh);
  
  const lastRequestedCountRef = useRef<number>(-1);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
    notificationsCountRef.current = notifications.length;
    onRefreshRef.current = onRefresh;
  });

  
  useEffect(() => {
    if (!sentinelRef.current || !scrollRef.current || !showNotifications) return;

    
    lastRequestedCountRef.current = -1;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        
        if (lastRequestedCountRef.current === notificationsCountRef.current) return;
        lastRequestedCountRef.current = notificationsCountRef.current;
        onLoadMoreRef.current?.();
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [showNotifications]);

  
  useEffect(() => {
    if (!scrollRef.current || !showNotifications) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-notification-id');
          const isUnread = entry.target.getAttribute('data-unread') === 'true';
          if (id && isUnread && entry.isIntersecting) {
            visibleUnreadIdsRef.current.add(id);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.5,
      }
    );

    const items = scrollRef.current.querySelectorAll('[data-notification-id]');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [showNotifications, notifications]);

  
  const displayCount = unreadCount > 0 ? unreadCount : notifications.filter((n) => !n.read).length;
  const badgeText = displayCount > 9 ? '9+' : String(displayCount);

  
  const handleClose = useCallback(() => {
    if (showNotifications) {
      if (displayCount > 0) {
        const unreadIds = Array.from(visibleUnreadIdsRef.current).filter((id) => {
          const n = notifications.find((item) => String(item.id) === String(id));
          return n && !n.read;
        });
        if (unreadIds.length > 0) {
          onClose?.(unreadIds);
        }
      }
      visibleUnreadIdsRef.current.clear();
      setShowNotifications(false);
    }
  }, [showNotifications, onClose, displayCount, notifications]);

  
  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, handleClose]);

  
  const handleToggle = useCallback(() => {
    if (showNotifications) {
      handleClose();
    } else {
      onRefreshRef.current?.();
      setShowNotifications(true);
    }
  }, [showNotifications, handleClose]);

  
  useLayoutEffect(() => {
    const dropdown = dropdownRef.current;
    if (!showNotifications || !dropdown) return;

    
    dropdown.style.transform = '';
    const rect = dropdown.getBoundingClientRect();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 0;

    
    if (rect.width === 0 && rect.height === 0) return;

    const margin = 8;
    let shift = 0;
    if (rect.right > vw - margin) {
      shift = -(rect.right - (vw - margin));
    } else if (rect.left < margin) {
      shift = margin - rect.left;
    }

    if (shift !== 0) {
      dropdown.style.transform = `translateX(${shift}px)`;
    }
  }, [showNotifications, dropdownAlign, notifications.length]);

  return (
    <Div ref={notificationRef} className={`relative ${className}`}>
      <Button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
          displayCount > 0
            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={titleText}
      >
        <Icon name={IconName.Bell} className="w-5 h-5" />
        {displayCount > 0 && (
          <Span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center text-[11px] leading-none font-bold text-white bg-red-600 ring-2 ring-white dark:ring-slate-900 rounded-full shadow-sm">
            {badgeText}
          </Span>
        )}
      </Button>

      {showNotifications && (
        <Div ref={dropdownRef} className={`absolute ${dropdownAlign === 'left' ? 'left-0' : 'right-0'} mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50`}>
          <Div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <Div className="flex items-center gap-3 min-w-0">
              <Span className="font-semibold text-slate-900 dark:text-white">{titleText}</Span>
              {onUnreadOnlyToggle && (
                <Div
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => onUnreadOnlyToggle(!unreadOnly)}
                >
                  <Input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      e.stopPropagation();
                      onUnreadOnlyToggle(e.target.checked);
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <Span className="text-xs text-slate-600 dark:text-slate-400">{unreadOnlyText}</Span>
                </Div>
              )}
            </Div>
            <Div className="flex items-center gap-3 flex-shrink-0">
              {onMarkAllRead && displayCount > 0 && (
                <Button
                  onClick={() => {
                    onMarkAllRead();
                    visibleUnreadIdsRef.current.clear();
                  }}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline cursor-pointer"
                >
                  {markAllReadText}
                </Button>
              )}
              {onDeleteAll && notifications.length > 0 && (
                <Button
                  onClick={() => {
                    // 드롭다운은 닫지 않음 — 확인 모달이 닫히면 다시 자연스럽게 노출되어야 하고,
                    // 사용자가 모달 취소 시에도 컨텍스트 유지 (PO 요구)
                    onDeleteAll();
                  }}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline cursor-pointer"
                >
                  {deleteAllText}
                </Button>
              )}
            </Div>
          </Div>
          <Div ref={scrollRef} className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <Div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                <Span>{emptyText}</Span>
              </Div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const isUnread = !notification.read;
                  return (
                    <Div
                      key={notification.id}
                      data-notification-id={notification.id}
                      data-unread={isUnread ? 'true' : 'false'}
                      onClick={() => {
                        notification.onClick?.();
                        onNotificationClick?.(notification);
                        setShowNotifications(false);
                      }}
                      className={`group flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-700 transition-colors cursor-pointer ${
                        isUnread
                          ? 'bg-teal-50/70 dark:bg-teal-900/20 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 opacity-70'
                      }`}
                    >
                      {notification.iconName && (
                        <Icon
                          name={notification.iconName}
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            isUnread ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                      )}
                      <Div className="flex-1 min-w-0">
                        <Div
                          className={`text-sm truncate ${
                            isUnread
                              ? 'font-semibold text-slate-900 dark:text-white'
                              : 'font-normal text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {notification.title}
                        </Div>
                        <Div
                          className={`text-sm mt-1 line-clamp-2 ${
                            isUnread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'
                          }`}
                        >
                          {notification.message}
                        </Div>
                        <Div className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-mono">
                          {notification.time}
                        </Div>
                      </Div>
                      <Div className="flex flex-col items-center gap-2 flex-shrink-0">
                        {isUnread && (
                          <Span className="w-2 h-2 bg-teal-500 rounded-full mt-1.5" />
                        )}
                        {onDelete && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification);
                            }}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete notification"
                          >
                            <Icon name={IconName.Trash} className="w-4 h-4" />
                          </Button>
                        )}
                      </Div>
                    </Div>
                  );
                })}
                {/* 무한스크롤 sentinel */}
                {hasMore && (
                  <Div ref={sentinelRef} className="px-4 py-3 text-center">
                    {loading ? (
                      <Span className="text-sm text-slate-400 dark:text-slate-500">...</Span>
                    ) : (
                      <Span className="text-sm text-slate-400 dark:text-slate-500" />
                    )}
                  </Div>
                )}
                {loading && !hasMore && notifications.length > 0 && (
                  <Div className="px-4 py-2 text-center">
                    <Span className="text-sm text-slate-400 dark:text-slate-500">...</Span>
                  </Div>
                )}
              </>
            )}
          </Div>
        </Div>
      )}
    </Div>
  );
};

export default NotificationCenter;
