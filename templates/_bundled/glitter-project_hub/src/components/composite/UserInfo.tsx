

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';
import { Icon } from '../basic/Icon';


const getG7Core = () => (window as any).G7Core;


const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;


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


const LAYOUT_CLASSES = {
  horizontal: 'flex items-center gap-1.5',
  vertical: 'flex flex-col items-start',
} as const;


const createDefaultMenuItems = (): MenuItemConfig[] => [
  {
    key: 'view_profile',
    label: t('userinfo.view_profile'),
    icon: 'user',
    path: '/users/{{userId}}',
  },
  {
    key: 'view_posts',
    label: t('userinfo.view_posts'),
    icon: 'file-lines',
    path: '/users/{{userId}}/posts',
  },
];


const SubText: React.FC<{ text?: string; title?: string }> = ({ text, title }) => {
  if (!text) return null;
  return (
    <Span className="text-sm text-slate-500 dark:text-slate-400" title={title}>
      {text}
    </Span>
  );
};


export const UserInfo: React.FC<UserInfoProps> = ({
  author,
  name,
  userId,
  subText,
  subTextTitle,
  isGuest = false,
  isWithdrawn = false,
  showDropdown = true,
  clickable = true,
  profilePath = '/users/{userId}',
  className = '',
  layout = 'vertical',
  text,
  stopPropagation = false,
  menuItems,
  hideMenuItems = [],
  appendMenuItems = [],
}) => {
  
  const actualUserId = userId ?? author?.uuid ?? author?.id;
  const actualIsGuest = isGuest || author?.is_guest || false;
  const actualIsWithdrawn = isWithdrawn || author?.status === 'withdrawn';

  
  
  const actualName = actualIsWithdrawn
    ? t('userinfo.withdrawn_user')
    : (text ?? name ?? author?.name ?? '');

  
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  
  const actualProfilePath = profilePath.replace('{userId}', String(actualUserId ?? ''));

  
  const containerClass = `${LAYOUT_CLASSES[layout]} ${className}`;

  // 메뉴 외부 클릭 시 닫기 + 스크롤/리사이즈 시 닫기
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setShowMenu(false);
      }
    };

    const handleScrollOrResize = () => setShowMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showMenu]);

  // 최종 메뉴 항목 계산
  const getMenuItems = useCallback((): MenuItemConfig[] => {
    // 커스텀 메뉴가 지정된 경우 그대로 사용
    if (menuItems && menuItems.length > 0) {
      return menuItems.filter((item) => item.show !== false);
    }

    // 기본 메뉴에서 숨길 항목 제거
    const defaultItems = createDefaultMenuItems();
    let items = defaultItems.filter(
      (item) => !hideMenuItems.includes(item.key) && item.show !== false
    );

    // 추가 항목 병합
    if (appendMenuItems && appendMenuItems.length > 0) {
      items = [...items, ...appendMenuItems.filter((item) => item.show !== false)];
    }

    return items;
  }, [menuItems, hideMenuItems, appendMenuItems]);

  // 드롭다운 위치 계산 (뷰포트 기준 fixed 위치 — Portal 사용)
  const updateMenuPosition = useCallback(() => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + 4,
        left: buttonRect.left,
      });
    }
  }, []);

  // 메뉴 항목 클릭 핸들러
  const handleMenuItemClick = useCallback((item: MenuItemConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);

    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      const path = item.path.replace(/\{\{userId\}\}/g, String(actualUserId ?? ''));
      const g7Core = getG7Core();
      if (g7Core?.navigate) {
        g7Core.navigate(path);
      } else {
        window.location.href = path;
      }
    }
  }, [actualUserId]);

  // 클릭 핸들러 (드롭다운 또는 프로필 이동)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if (stopPropagation) {
      e.stopPropagation();
    }

    // 비회원이거나 userId가 없으면 아무 동작 안 함
    if (actualIsGuest || !actualUserId) {
      return;
    }

    // 드롭다운이 활성화된 경우
    if (showDropdown) {
      if (!showMenu) {
        updateMenuPosition();
      }
      setShowMenu((prev) => !prev);
    }
    // 드롭다운이 비활성화되고 클릭 가능한 경우
    else if (clickable) {
      getG7Core()?.navigate?.(actualProfilePath);
    }
  }, [stopPropagation, actualIsGuest, actualUserId, showDropdown, showMenu, updateMenuPosition, clickable, actualProfilePath]);

  // 비회원인 경우
  if (actualIsGuest || !actualUserId) {
    return (
      <Div className={containerClass}>
        <Div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <Span>{actualName}</Span>
          <Span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
            {t('userinfo.guest_badge')}
          </Span>
        </Div>
        <SubText text={subText} title={subTextTitle} />
      </Div>
    );
  }

  // 탈퇴한 사용자인 경우
  if (actualIsWithdrawn) {
    return (
      <Div className={containerClass}>
        <Span className="text-slate-400 dark:text-slate-500 line-through">
          {actualName}
        </Span>
        <SubText text={subText} title={subTextTitle} />
      </Div>
    );
  }

  // 회원인 경우
  const finalMenuItems = getMenuItems();
  // className에 text- 색상 클래스가 있으면 nameButtonClass의 기본 색상을 대체
  const hasCustomColor = /\btext-\S+/.test(className);
  const defaultColorClass = hasCustomColor ? '' : 'text-slate-900 dark:text-white';
  const nameButtonClass = (showDropdown || clickable)
    ? `${defaultColorClass} hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer font-medium`.trim()
    : `${defaultColorClass} font-medium`.trim();

  return (
    <Div ref={containerRef} className={`relative inline-block ${className}`}>
      <Div className={LAYOUT_CLASSES[layout]}>
        <Button
          ref={buttonRef}
          onClick={handleClick}
          className={nameButtonClass}
        >
          {actualName}
        </Button>
        <SubText text={subText} title={subTextTitle} />
      </Div>

      {/* 드롭다운 메뉴 - Portal로 document.body에 fixed 배치 (overflow-hidden 부모 회피) */}
      {showDropdown && showMenu && finalMenuItems.length > 0 && createPortal(
        <Div
          ref={dropdownRef}
          className="fixed w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-[9999]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          data-testid="author-dropdown-menu"
        >
          {finalMenuItems.map((item) => (
            <Button
              key={item.key}
              onClick={(e) => handleMenuItemClick(item, e)}
              className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              data-testid={`menu-item-${item.key}`}
            >
              {item.icon && <Icon name={item.icon} className="w-4 h-4" />}
              <Span>{item.label}</Span>
            </Button>
          ))}
        </Div>,
        document.body
      )}
    </Div>
  );
};
