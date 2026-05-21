

import React, { useState, useRef, useEffect } from 'react';


import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Input } from '../basic/Input';
import { Span } from '../basic/Span';
import { Img } from '../basic/Img';
import { Icon } from '../basic/Icon';
import { Form } from '../basic/Form';
import { Nav } from '../basic/Nav';
import { Header as HeaderBasic } from '../basic/Header';
import { Hr } from '../basic/Hr';
import { A } from '../basic/A';


import { ThemeToggle } from './ThemeToggle';


import { Avatar } from './Avatar';


import { NotificationCenter, type NotificationItem } from './NotificationCenter';


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;


const navigate = (path: string) => {
  (window as any).G7Core?.dispatch?.({
    handler: 'navigate',
    params: { path },
  });
};

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


const Header: React.FC<HeaderProps> = ({
  logo,
  siteName = '글리터 프로젝트 허브',
  user,
  notificationCount = 0,
  boards = [],
  onMobileMenuOpen,
  availableLocales = [],
  currentLocale = 'ko',
  className = '',
  
  notifications = [],
  notificationHasMore = false,
  notificationLoading = false,
  notificationUnreadOnly = false,
  notificationTitleText,
  notificationEmptyText,
  notificationMarkAllReadText,
  notificationDeleteAllText,
  notificationUnreadOnlyText,
  onNotificationClose,
  onNotificationClick,
  onNotificationLoadMore,
  onNotificationMarkAllRead,
  onNotificationDeleteAll,
  onNotificationDelete,
  onNotificationUnreadOnlyToggle,
  onNotificationRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreBoards, setShowMoreBoards] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLDivElement>(null);

  
  const G7Core = (window as any).G7Core;
  const useResponsive = G7Core?.useResponsive;
  const responsiveValue = useResponsive?.();
  const isMobile = responsiveValue
    ? responsiveValue.width < 768
    : typeof window !== 'undefined' && window.innerWidth < 768;

  
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
    };
  }, []);

  
  const isActiveRoute = (path: string, exact = false): boolean => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  
  const getNavButtonClass = (isActive: boolean): string => {
    const baseClass = "gph-header__nav-link px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer rounded-lg transition-colors";
    if (isActive) {
      return `${baseClass} gph-header__nav-link--active bg-teal-600 text-white dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400 hover:ring-1 hover:ring-teal-700/30 dark:hover:ring-teal-300/40`;
    }
    return `${baseClass} text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800`;
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        setShowMoreBoards(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const qnaBoard = boards.find((board) => board.slug === 'qna');
  const moreBoards = boards.filter((board) => board.slug !== 'qna');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    // G7Core.dispatch를 사용하여 logout 핸들러 호출
    // AuthManager가 토큰 삭제, 상태 초기화, 리다이렉트를 처리
    (window as any).G7Core?.dispatch?.({
      handler: 'logout',
    });
  };

  const handleLocaleChange = (locale: string) => {
    (window as any).G7Core?.dispatch?.({
      handler: 'setLocale',
      target: locale,
    });
    setShowUserMenu(false);
  };

  return (
    <HeaderBasic className={`gph-header sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <Div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Div className="flex items-center justify-between h-16">
          <Button onClick={() => navigate('/')} className="gph-header__brand flex items-center gap-2 flex-shrink-0 cursor-pointer">
            {logo ? (
              <Img src={logo} alt={siteName} width={160} height={32} className="gph-header__logo h-8 w-auto transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02]" />
            ) : (
              <Span className="gph-header__brand-text text-xl font-bold text-slate-900 dark:text-white">{siteName}</Span>
            )}
          </Button>

          {!isMobile && (
            <Form onSubmit={handleSearch} className="gph-header__search flex flex-1 max-w-lg mx-8">
              <Div className="relative w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search_placeholder')}
                  className="gph-header__search-input w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <Icon
                  name="search"
                  className="gph-header__search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
                />
              </Div>
            </Form>
          )}

          <Div className="flex items-center gap-2">
            <ThemeToggle
              autoText={t('common.theme.auto')}
              lightText={t('common.theme.light')}
              darkText={t('common.theme.dark')}
            />

            {user?.uuid && (
              <NotificationCenter
                notifications={notifications}
                unreadCount={notificationCount}
                hasMore={notificationHasMore}
                loading={notificationLoading}
                unreadOnly={notificationUnreadOnly}
                titleText={notificationTitleText ?? t('mypage.notifications.title')}
                emptyText={notificationEmptyText ?? t('mypage.notifications.empty')}
                markAllReadText={notificationMarkAllReadText ?? t('mypage.notifications.mark_all_read')}
                deleteAllText={notificationDeleteAllText ?? t('mypage.notifications.delete_all')}
                unreadOnlyText={notificationUnreadOnlyText ?? t('mypage.notifications.unread_only')}
                onClose={onNotificationClose}
                onNotificationClick={onNotificationClick}
                onLoadMore={onNotificationLoadMore}
                onMarkAllRead={onNotificationMarkAllRead}
                onDeleteAll={onNotificationDeleteAll}
                onDelete={onNotificationDelete}
                onUnreadOnlyToggle={onNotificationUnreadOnlyToggle}
                onRefresh={onNotificationRefresh}
                dropdownAlign="right"
              />
            )}

            {user?.uuid ? (
              <Div ref={userMenuRef} className="relative">
                <Button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Avatar
                    avatar={user.avatar}
                    name={user.name}
                    size="sm"
                  />
                  <Span className="hidden sm:inline text-sm font-medium">{user.name}</Span>
                  <Icon name="chevron-down" className="w-4 h-4" />
                </Button>

                {showUserMenu && (
                  <Div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                    <Div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <Div className="flex items-center gap-3">
                        <Avatar
                          avatar={user.avatar}
                          name={user.name}
                          size="md"
                        />
                        <Div>
                          <Div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</Div>
                          <Div className="text-xs text-slate-500 dark:text-slate-400">{t('common.member')}</Div>
                        </Div>
                      </Div>
                    </Div>

                    <Div className="py-1">
                      {/* 관리자 메뉴 (is_admin일 때만 표시) - 하이퍼링크로 전체 페이지 새로고침 */}
                      {user.is_admin && (
                        <>
                          <A
                            href="/admin"
                            className="block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer font-medium"
                          >
                            <Icon name="settings" className="inline w-4 h-4 mr-2" />
                            {t('common.admin_menu')}
                          </A>
                          <Hr className="my-1 border-slate-200 dark:border-slate-700" />
                        </>
                      )}
                      <Button onClick={() => { navigate('/mypage'); setShowUserMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        <Icon name="user" className="inline w-4 h-4 mr-2" />
                        {t('common.mypage')}
                      </Button>
                    </Div>

                    {availableLocales && availableLocales.length > 1 && (
                      <>
                        <Hr className="my-1 border-slate-200 dark:border-slate-700" />
                        <Div className="py-1">
                          <Div className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            {t('common.language')}
                          </Div>
                          {availableLocales.map((locale) => (
                            <Button
                              key={locale}
                              onClick={() => handleLocaleChange(locale)}
                              className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                                locale === currentLocale
                                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Icon name="globe" className="inline w-4 h-4 mr-2" />
                              {locale === 'ko' ? '한국어' : locale === 'en' ? 'English' : locale.toUpperCase()}
                            </Button>
                          ))}
                        </Div>
                      </>
                    )}

                    <Hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <Button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Icon name="log-out" className="inline w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </Button>
                  </Div>
                )}
              </Div>
            ) : (
              <Div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {t('auth.login')}
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 cursor-pointer"
                >
                  {t('auth.register_link')}
                </Button>
              </Div>
            )}

            {isMobile && (
              <Button
                onClick={onMobileMenuOpen}
                className="p-2 text-slate-600 dark:text-slate-400"
              >
                <Icon name="menu" className="w-6 h-6" />
              </Button>
            )}
          </Div>
        </Div>
      </Div>

      {!isMobile && (
      <Nav className="gph-header__nav border-t border-slate-200 dark:border-slate-800">
        <Div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Div className="relative flex items-center gap-1 h-12 overflow-visible">
            <Button onClick={() => navigate('/')} className={getNavButtonClass(isActiveRoute('/', true))}>
              {t('nav.home')}
            </Button>
            <Button onClick={() => navigate('/boards')} className={getNavButtonClass(isActiveRoute('/boards', true))}>
              {t('nav.all_boards')}
            </Button>
            <Button onClick={() => navigate('/popular')} className={`flex items-center gap-1 ${getNavButtonClass(isActiveRoute('/popular') || isActiveRoute('/boards/popular'))}`}>
              <Span className="text-orange-500">🔥</Span>
              {t('nav.popular')}
            </Button>
            <Button onClick={() => navigate(`/board/${qnaBoard?.slug ?? 'qna'}`)} className={getNavButtonClass(isActiveRoute(`/board/${qnaBoard?.slug ?? 'qna'}`))}>
              {qnaBoard?.icon && <Span className="mr-1">{qnaBoard.icon}</Span>}
              {t('nav.qna')}
            </Button>

            {moreBoards.length > 0 && (
              <Div ref={moreButtonRef} className="relative">
                <Button
                  onClick={() => setShowMoreBoards(!showMoreBoards)}
                  className="gph-header__nav-link flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {t('nav.more')}
                  <Icon name="chevron-down" className="w-4 h-4" />
                </Button>
                {showMoreBoards && (
                  <Div
                    className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50"
                  >
                    {moreBoards.map((board) => {
                      const isActive = isActiveRoute(`/board/${board.slug}`);
                      return (
                        <Button
                          key={board.id}
                          onClick={() => {
                            navigate(`/board/${board.slug}`);
                            setShowMoreBoards(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                            isActive
                              ? 'bg-teal-600 text-white dark:bg-teal-500'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {board.icon && <Span className="mr-1">{board.icon}</Span>}
                          {board.name}
                        </Button>
                      );
                    })}
                  </Div>
                )}
              </Div>
            )}
          </Div>
        </Div>
      </Nav>
      )}
    </HeaderBasic>
  );
};

export default Header;
