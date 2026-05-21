import React, { useMemo } from 'react';
import { Div } from '../basic/Div';
import { Img } from '../basic/Img';
import { Icon } from '../basic/Icon';


export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';


const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',         
  sm: 'w-8 h-8 text-sm',         
  md: 'w-10 h-10 text-base',     
  lg: 'w-12 h-12 text-lg',       
  xl: 'w-16 h-16 text-xl',       
  '2xl': 'w-24 h-24 text-2xl',   
  '3xl': 'w-32 h-32 text-3xl',   
  '4xl': 'w-40 h-40 text-4xl',   
  '5xl': 'w-48 h-48 text-5xl',   
} as const;


const BASE_CONTAINER_CLASSES = 'rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700';


const WITHDRAWN_CLASSES = 'slatescale opacity-50';


const INITIAL_BG_CLASSES = {
  normal: 'bg-gradient-to-br from-teal-500 to-teal-600',
  withdrawn: 'bg-slate-300 dark:bg-slate-600',
  guest: 'bg-slate-200 dark:bg-slate-700',
} as const;


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


export const Avatar: React.FC<AvatarProps> = ({
  author,
  name,
  avatar,
  size = 'md',
  className = '',
  text,
  isWithdrawn = false,
  isGuest = false,
}) => {
  
  const actualAvatar = avatar ?? author?.avatar;
  const actualName = text ?? name ?? author?.name ?? '?';
  const actualIsWithdrawn = isWithdrawn || author?.status === 'withdrawn';
  const actualIsGuest = isGuest || author?.is_guest || false;

  
  const containerClasses = useMemo(() => {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const withdrawnClass = actualIsWithdrawn ? WITHDRAWN_CLASSES : '';

    return [sizeClass, BASE_CONTAINER_CLASSES, withdrawnClass, className]
      .filter(Boolean)
      .join(' ');
  }, [size, actualIsWithdrawn, className]);

  
  const initialBgClass = actualIsGuest
    ? INITIAL_BG_CLASSES.guest
    : actualIsWithdrawn
      ? INITIAL_BG_CLASSES.withdrawn
      : INITIAL_BG_CLASSES.normal;

  
  const renderContent = () => {
    if (actualIsGuest) {
      return (
        <Div className={`w-full h-full flex items-center justify-center ${initialBgClass}`}>
          <Icon name="user" className="text-slate-400 dark:text-slate-500" />
        </Div>
      );
    }
    if (actualIsWithdrawn) {
      return (
        <Div className={`w-full h-full flex items-center justify-center ${initialBgClass}`}>
          <Icon name="user" className="text-slate-500 dark:text-slate-400" />
        </Div>
      );
    }
    return (
      <Div className={`w-full h-full flex items-center justify-center text-white font-semibold ${initialBgClass}`}>
        {actualName.charAt(0).toUpperCase()}
      </Div>
    );
  };

  return (
    <Div className={containerClasses}>
      {actualAvatar && !actualIsGuest && !actualIsWithdrawn ? (
        <Img
          src={actualAvatar}
          alt={actualName}
          className="w-full h-full object-cover"
        />
      ) : (
        renderContent()
      )}
    </Div>
  );
};
