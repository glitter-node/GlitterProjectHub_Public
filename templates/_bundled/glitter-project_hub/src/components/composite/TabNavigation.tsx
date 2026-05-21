import React from 'react';
import { Nav } from '../basic/Nav';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { IconName } from '../basic/IconTypes';
import { Div } from '../basic/Div';
import { Span } from '../basic/Span';
import { Select } from '../basic/Select';

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


export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  variant = 'underline',
  className = '',
  style,
  hiddenTabIds = [],
  mobileBreakpoint = 768,
}) => {
  
  const G7Core = (window as any).G7Core;
  const useResponsive = G7Core?.useResponsive;
  const responsiveValue = useResponsive?.();
  const isMobile = responsiveValue
    ? responsiveValue.width < mobileBreakpoint
    : typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint;

  const handleTabClick = (tab: Tab) => {
    if (!tab.disabled && tab.id !== activeTabId) {
      onTabChange?.(tab.id);
    }
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string | number } }
  ) => {
    const selectedId = e.target.value;
    const numericId = Number(selectedId);
    const finalId =
      typeof selectedId === 'string' && selectedId !== '' && !Number.isNaN(numericId)
        ? numericId
        : selectedId;
    const selectedTab = tabs.find((tab) => String(tab.id) === String(finalId));
    if (selectedTab) {
      handleTabClick(selectedTab);
    }
  };

  const visibleTabs = hiddenTabIds.length > 0
    ? tabs.filter((tab) => !hiddenTabIds.includes(tab.id))
    : tabs;

  
  if (isMobile) {
    return (
      <Div className={`relative ${className}`} style={style}>
        <Select
          value={activeTabId !== undefined ? String(activeTabId) : ''}
          onChange={handleSelectChange}
          options={visibleTabs.map((tab) => ({
            value: String(tab.id),
            label: tab.badge !== undefined ? `${tab.label} (${tab.badge})` : tab.label,
            disabled: tab.disabled,
          }))}
          className="w-full"
        />
      </Div>
    );
  }

  const getTabClasses = (tab: Tab) => {
    const isActive = tab.id === activeTabId;
    const baseClasses =
      'flex items-center gap-2 px-3 py-2 font-medium text-sm transition-all shrink-0 whitespace-nowrap';

    if (tab.disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600`;
    }

    switch (variant) {
      case 'pills':
        return isActive
          ? `${baseClasses} bg-teal-600 dark:bg-teal-500 text-white rounded-lg`
          : `${baseClasses} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg`;

      case 'underline':
        return isActive
          ? `${baseClasses} text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white`
          : `${baseClasses} text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600`;

      case 'default':
      default:
        return isActive
          ? `${baseClasses} text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-b-2 border-teal-600 dark:border-teal-400`
          : `${baseClasses} text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b-2 border-transparent`;
    }
  };

  const navClasses =
    variant === 'underline'
      ? 'flex gap-0 border-b border-slate-200 dark:border-slate-700'
      : 'flex gap-2';

  // 데스크톱: 탭 버튼 단일 렌더
  return (
    <Div className={`relative ${className}`} style={style}>
      <Nav className={navClasses}>
        {visibleTabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab)}
            disabled={tab.disabled}
            className={getTabClasses(tab)}
          >
            {tab.iconName && (
              <Icon name={tab.iconName} size="sm" />
            )}

            <Span>{tab.label}</Span>

            {tab.badge !== undefined && (
              <Div className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                <Span>{tab.badge}</Span>
              </Div>
            )}
          </Button>
        ))}
      </Nav>
    </Div>
  );
};
