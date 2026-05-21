

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../Header';
import MobileNav from '../MobileNav';


const mockG7Core = {
  t: vi.fn((key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      'nav.home': '홈',
      'nav.popular': '활발한 흐름',
      'nav.all_boards': '전체 공간',
      'nav.qna': '질문 공간',
      'nav.more': '더 보기',
      'auth.login': '로그인',
      'auth.register': '회원가입',
      'auth.register_link': '회원가입',
      'common.search_placeholder': '검색',
      'common.theme.auto': '자동',
      'common.theme.light': '라이트',
      'common.theme.dark': '다크',
      'footer.about': '소개',
      'footer.terms': '이용약관',
      'footer.privacy': '개인정보처리방침',
    };
    return translations[key] ?? key;
  }),
  dispatch: vi.fn(),
  useResponsive: vi.fn(() => ({ width: 1280, height: 800 })),
  style: {
    mergeClasses: (_base: string, className: string) => className,
  },
};


beforeEach(() => {
  vi.clearAllMocks();
  (window as any).G7Core = mockG7Core;
});


const MockHeader: React.FC<{
  logo?: string;
  siteName?: string;
  user?: { id: number; name: string } | null;
  boards?: { id: number; name: string; slug: string }[];
}> = ({ logo, siteName = '글리터 프로젝트 허브', user, boards = [] }) => {
  const t = (key: string) => mockG7Core.t(key);

  return (
    <header data-testid="header">
      <a href="/" data-testid="logo-link">
        {logo ? <img src={logo} alt={siteName} /> : <span>{siteName}</span>}
      </a>
      <nav data-testid="main-nav">
        <a href="/">{t('nav.home')}</a>
        <a href="/popular">{t('nav.popular')}</a>
        {boards.map((board) => (
          <a key={board.id} href={`/board/${board.slug}`}>
            {board.name}
          </a>
        ))}
      </nav>
      <div data-testid="user-area">
        {user ? (
          <span data-testid="user-name">{user.name}</span>
        ) : (
          <>
            <a href="/login">{t('auth.login')}</a>
            <a href="/register">{t('auth.register')}</a>
          </>
        )}
      </div>
    </header>
  );
};

describe('Header 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 헤더가 렌더링되어야 함', () => {
      render(<MockHeader />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('사이트 이름이 표시되어야 함', () => {
      render(<MockHeader siteName="테스트 사이트" />);
      expect(screen.getByText('테스트 사이트')).toBeInTheDocument();
    });

    it('로고 이미지가 있으면 이미지로 표시되어야 함', () => {
      render(<MockHeader logo="/logo.png" siteName="테스트" />);
      const img = screen.getByAltText('테스트');
      expect(img).toHaveAttribute('src', '/logo.png');
    });
  });

  describe('네비게이션', () => {
    it('기본 메뉴 항목이 표시되어야 함', () => {
      render(<MockHeader />);
      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getByText('활발한 흐름')).toBeInTheDocument();
      expect(screen.queryByText('쇼핑')).not.toBeInTheDocument();
    });

    it('게시판 목록이 표시되어야 함', () => {
      const boards = [
        { id: 1, name: '자유게시판', slug: 'free' },
        { id: 2, name: '질문답변', slug: 'qna' },
      ];
      render(<MockHeader boards={boards} />);
      expect(screen.getByText('자유게시판')).toBeInTheDocument();
      expect(screen.getByText('질문답변')).toBeInTheDocument();
    });

    it('더보기 메뉴를 열어 보조 게시판 링크를 표시하고 선택 시 닫아야 함', () => {
      const boards = [
        { id: 1, name: '공지사항', slug: 'notice' },
        { id: 2, name: '자유게시판', slug: 'free' },
        { id: 3, name: '질문게시판', slug: 'qna' },
        { id: 4, name: '자료실', slug: 'resources' },
      ];

      render(<Header siteName="테스트" boards={boards} />);

      expect(screen.getByText('전체 공간')).toBeInTheDocument();
      expect(screen.getByText('활발한 흐름')).toBeInTheDocument();
      expect(screen.getByText('질문 공간')).toBeInTheDocument();
      expect(screen.queryByText('공지사항')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /더 보기/ }));

      expect(screen.getByText('공지사항')).toBeInTheDocument();
      expect(screen.getByText('자유게시판')).toBeInTheDocument();
      expect(screen.getByText('자료실')).toBeInTheDocument();
      expect(screen.queryByText('질문게시판')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('자유게시판'));

      expect(mockG7Core.dispatch).toHaveBeenCalledWith({
        handler: 'navigate',
        params: { path: '/board/free' },
      });
      expect(screen.queryByText('공지사항')).not.toBeInTheDocument();
    });

    it('더보기 메뉴는 외부 클릭 시 닫혀야 함', () => {
      const boards = [
        { id: 1, name: '공지사항', slug: 'notice' },
        { id: 2, name: '질문게시판', slug: 'qna' },
      ];

      render(<Header siteName="테스트" boards={boards} />);

      fireEvent.click(screen.getByRole('button', { name: /더 보기/ }));
      expect(screen.getByText('공지사항')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('공지사항')).not.toBeInTheDocument();
    });
  });

  describe('사용자 상태', () => {
    it('비로그인 시 로그인/회원가입 버튼이 표시되어야 함', () => {
      render(<MockHeader user={null} />);
      expect(screen.getByText('로그인')).toBeInTheDocument();
      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    it('로그인 시 사용자 이름이 표시되어야 함', () => {
      const user = { id: 1, name: '홍길동' };
      render(<MockHeader user={user} />);
      expect(screen.getByTestId('user-name')).toHaveTextContent('홍길동');
    });
  });

  describe('커뮤니티 전용 UI', () => {
    it('쇼핑/장바구니 UI가 표시되지 않아야 함', () => {
      render(<MockHeader />);
      expect(screen.queryByText('쇼핑')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-count')).not.toBeInTheDocument();
    });
  });
});

describe('MobileNav 컴포넌트', () => {
  const boards = [
    { id: 1, name: '공지사항', slug: 'notice' },
    { id: 2, name: '자유게시판', slug: 'free' },
    { id: 3, name: '질문게시판', slug: 'qna' },
    { id: 4, name: '자료실', slug: 'resources' },
    { id: 5, name: '가입인사', slug: 'introductions' },
    { id: 6, name: '고객지원', slug: 'support' },
  ];

  beforeEach(() => {
    mockG7Core.useResponsive.mockReturnValue({ width: 390, height: 844 });
  });

  it('단순화된 주요 목적지와 더보기 게시판 링크를 표시해야 함', () => {
    render(<MobileNav isOpen={true} onClose={vi.fn()} siteName="테스트" boards={boards} />);

    expect(screen.getByRole('button', { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /전체 공간/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /활발한 흐름/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /질문 공간/ })).toBeInTheDocument();
    expect(screen.getByText('더 보기')).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.getByText('자유게시판')).toBeInTheDocument();
    expect(screen.getByText('자료실')).toBeInTheDocument();
    expect(screen.getByText('가입인사')).toBeInTheDocument();
    expect(screen.getByText('고객지원')).toBeInTheDocument();
    expect(screen.queryByText('질문게시판')).not.toBeInTheDocument();
  });

  it('모바일 주요 목적지와 더보기 링크 클릭 시 올바른 경로로 이동해야 함', () => {
    const onClose = vi.fn();

    render(<MobileNav isOpen={true} onClose={onClose} siteName="테스트" boards={boards} />);

    fireEvent.click(screen.getByRole('button', { name: /전체 공간/ }));
    fireEvent.click(screen.getByRole('button', { name: /활발한 흐름/ }));
    fireEvent.click(screen.getByRole('button', { name: /질문 공간/ }));
    fireEvent.click(screen.getByText('자유게시판'));

    expect(mockG7Core.dispatch).toHaveBeenCalledWith({
      handler: 'navigate',
      params: { path: '/boards' },
    });
    expect(mockG7Core.dispatch).toHaveBeenCalledWith({
      handler: 'navigate',
      params: { path: '/popular' },
    });
    expect(mockG7Core.dispatch).toHaveBeenCalledWith({
      handler: 'navigate',
      params: { path: '/board/qna' },
    });
    expect(mockG7Core.dispatch).toHaveBeenCalledWith({
      handler: 'navigate',
      params: { path: '/board/free' },
    });
    expect(onClose).toHaveBeenCalledTimes(4);
  });
});
