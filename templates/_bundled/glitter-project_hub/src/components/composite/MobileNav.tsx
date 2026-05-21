

import React, { useEffect, useRef } from 'react';
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Span } from '../basic/Span';
import { P } from '../basic/P';
import { Icon } from '../basic/Icon';
import { Img } from '../basic/Img';
import { Nav } from '../basic/Nav';
import { Ul } from '../basic/Ul';
import { Li } from '../basic/Li';


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
  id: number;
  name: string;
  avatar?: string;
}

interface MobileNavProps {
  
  isOpen: boolean;
  
  onClose: () => void;
  
  logo?: string;
  
  siteName?: string;
  
  user?: User | null;
  
  boards?: Board[];
}


const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  logo,
  siteName = '글리터 프로젝트 허브',
  user,
  boards = [],
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  
  const G7Core = (window as any).G7Core;
  const useResponsive = G7Core?.useResponsive;
  const responsiveValue = useResponsive?.();
  
  const isPortable = responsiveValue
    ? responsiveValue.width < 1024
    : typeof window !== 'undefined' && window.innerWidth < 1024;

  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;
  
  if (!isPortable) return null;

  const qnaBoard = boards.find((board) => board.slug === 'qna');
  const moreBoards = boards.filter((board) => board.slug !== 'qna');

  return (
    <Div
      className="fixed inset-0 z-50"
      onClick={handleOverlayClick}
    >
      
      <Div className="fixed inset-0 bg-black/50 transition-opacity" />

      
      <Div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <Button onClick={() => { onClose(); navigate('/'); }} className="flex items-center gap-2 cursor-pointer">
            {logo ? (
              <Img src={logo} alt={siteName} width={160} height={32} className="h-8 w-auto" />
            ) : (
              <Span className="text-xl font-bold text-slate-900 dark:text-white">{siteName}</Span>
            )}
          </Button>
          <Button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="메뉴 닫기"
          >
            <Icon name="x" className="w-6 h-6" />
          </Button>
        </Div>

        {user ? (
          <Div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <Div className="flex items-center gap-3">
              {user.avatar ? (
                <Img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              ) : (
                <Div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white text-lg font-medium">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Div>
              )}
              <Div>
                <P className="font-medium text-slate-900 dark:text-white">{user.name}</P>
                <Button onClick={() => { onClose(); navigate('/mypage'); }} className="text-sm text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">
                  {t('common.mypage')}
                </Button>
              </Div>
            </Div>
          </Div>
        ) : (
          <Div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <Div className="flex gap-2">
              <Button
                onClick={() => { onClose(); navigate('/login'); }}
                className="flex-1 py-2 text-center text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 rounded-lg cursor-pointer"
              >
                {t('auth.login')}
              </Button>
              <Button
                onClick={() => { onClose(); navigate('/register'); }}
                className="flex-1 py-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
              >
                {t('auth.register')}
              </Button>
            </Div>
          </Div>
        )}

        <Nav className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <Ul className="space-y-1">
            <Li>
              <Button
                onClick={() => { onClose(); navigate('/'); }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Icon name="home" className="w-5 h-5" />
                {t('nav.home')}
              </Button>
            </Li>
            <Li>
              <Button
                onClick={() => { onClose(); navigate('/boards'); }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Icon name="list" className="w-5 h-5" />
                {t('nav.all_boards')}
              </Button>
            </Li>
            <Li>
              <Button
                onClick={() => { onClose(); navigate('/popular'); }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Span className="text-orange-500">🔥</Span>
                {t('nav.popular')}
              </Button>
            </Li>
            <Li>
              <Button
                onClick={() => { onClose(); navigate(`/board/${qnaBoard?.slug ?? 'qna'}`); }}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Icon name="question-circle" className="w-5 h-5" />
                {t('nav.qna')}
              </Button>
            </Li>
            <Li className="my-4 border-t border-slate-200 dark:border-slate-800" />

            <Li className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('nav.more')}
            </Li>
            {moreBoards.map((board) => (
              <Li key={board.id}>
                <Button
                  onClick={() => { onClose(); navigate(`/board/${board.slug}`); }}
                  className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  {board.icon && <Span>{board.icon}</Span>}
                  {board.name}
                </Button>
              </Li>
            ))}
          </Ul>
        </Nav>

        <Div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <Button onClick={() => { onClose(); navigate('/about'); }} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              {t('footer.about')}
            </Button>
            <Button onClick={() => { onClose(); navigate('/terms'); }} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              {t('footer.terms')}
            </Button>
            <Button onClick={() => { onClose(); navigate('/privacy'); }} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              {t('footer.privacy')}
            </Button>
          </Div>
        </Div>
      </Div>
    </Div>
  );
};

export default MobileNav;
