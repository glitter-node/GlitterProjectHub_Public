import React, { useState, useEffect, useRef } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Icon } from '../basic/Icon';
import { IconName } from '../basic/IconTypes';
import { Span } from '../basic/Span';


export type ThemeMode = 'auto' | 'light' | 'dark';


export interface ThemeToggleProps {
  
  onThemeChange?: (theme: ThemeMode) => void;
  
  className?: string;
  
  autoText?: string;
  
  lightText?: string;
  
  darkText?: string;
}




const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
};


const applyTheme = (mode: ThemeMode) => {
  const effectiveTheme = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', effectiveTheme);

  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};


const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('g7_color_scheme') as ThemeMode | null;
  if (savedTheme && ['auto', 'light', 'dark'].includes(savedTheme)) {
    return savedTheme;
  }
  return 'auto';
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  onThemeChange,
  className = '',
  autoText = 'System',
  lightText = 'Light',
  darkText = 'Dark',
}) => {
  
  const initialTheme = getInitialTheme();
  const [currentMode, setCurrentMode] = useState<ThemeMode>(initialTheme);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    applyTheme(currentMode);
  }, []);

  
  useEffect(() => {
    if (currentMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('auto');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentMode]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  const handleThemeChange = (mode: ThemeMode) => {
    setCurrentMode(mode);
    localStorage.setItem('g7_color_scheme', mode);
    applyTheme(mode);
    setShowMenu(false);
    onThemeChange?.(mode);
  };

  
  const getCurrentIcon = (): IconName => {
    const effectiveTheme = getEffectiveTheme(currentMode);
    return effectiveTheme === 'dark' ? IconName.Moon : IconName.Sun;
  };

  return (
    <Div ref={menuRef} className={`relative ${className}`}>
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
        aria-label="Toggle theme"
      >
        <Icon
          name={getCurrentIcon()}
          className="w-5 h-5"
        />
      </Button>

      {showMenu && (
        <Div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <Div className="py-2">
            <Button
              onClick={() => handleThemeChange('auto')}
              className={`
                w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors
                ${currentMode === 'auto' ? 'bg-slate-50 dark:bg-slate-700' : ''}
              `}
            >
              <Icon
                name={IconName.Settings}
                className="w-5 h-5 text-slate-600 dark:text-slate-400"
              />
              <Span className="flex-1 text-left text-slate-900 dark:text-white">{autoText}</Span>
              {currentMode === 'auto' && (
                <Icon
                  name={IconName.Check}
                  className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-auto"
                />
              )}
            </Button>

            <Button
              onClick={() => handleThemeChange('light')}
              className={`
                w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors
                ${currentMode === 'light' ? 'bg-slate-50 dark:bg-slate-700' : ''}
              `}
            >
              <Icon
                name={IconName.Sun}
                className="w-5 h-5 text-slate-600 dark:text-slate-400"
              />
              <Span className="flex-1 text-left text-slate-900 dark:text-white">{lightText}</Span>
              {currentMode === 'light' && (
                <Icon
                  name={IconName.Check}
                  className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-auto"
                />
              )}
            </Button>

            <Button
              onClick={() => handleThemeChange('dark')}
              className={`
                w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors
                ${currentMode === 'dark' ? 'bg-slate-50 dark:bg-slate-700' : ''}
              `}
            >
              <Icon
                name={IconName.Moon}
                className="w-5 h-5 text-slate-600 dark:text-slate-400"
              />
              <Span className="flex-1 text-left text-slate-900 dark:text-white">{darkText}</Span>
              {currentMode === 'dark' && (
                <Icon
                  name={IconName.Check}
                  className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-auto"
                />
              )}
            </Button>
          </Div>
        </Div>
      )}
    </Div>
  );
};

export default ThemeToggle;
