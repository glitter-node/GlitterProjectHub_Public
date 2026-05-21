import React from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createLayoutTest,
  createMockComponentRegistryWithBasics,
  screen,
} from '@core/template-engine/__tests__/utils/layoutTestUtils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.resolve(__dirname, '..', '..');

function readJson<T = any>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(templateRoot, relativePath), 'utf-8')) as T;
}

function loadTemplateTranslations(locale: 'en' | 'ko') {
  const manifest = readJson<Record<string, any>>(`lang/${locale}.json`);

  return Object.fromEntries(
    Object.entries(manifest).map(([key, value]) => {
      if (value && typeof value === 'object' && typeof value.$partial === 'string') {
        return [key, readJson(`lang/${value.$partial}`)];
      }

      return [key, value];
    })
  );
}

function resolvePartials<T = any>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => resolvePartials(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, any>;
  if (typeof record.partial === 'string') {
    return resolvePartials(readJson(path.join('layouts', record.partial)));
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => [key, resolvePartials(child)])
  ) as T;
}

function createRegistry() {
  const registry = createMockComponentRegistryWithBasics();

  registry.register('basic', 'Icon', ({ name, className }) => (
    <span className={className} data-icon={name} />
  ));
  registry.register('layout', 'Container', ({ children, className }) => (
    <div className={className}>{children}</div>
  ));

  return registry;
}

function createHomeLayoutTest(locale: 'en' | 'ko' = 'ko') {
  const homeLayout = resolvePartials(readJson('layouts/home.json'));
  const testUtils = createLayoutTest(homeLayout, {
    componentRegistry: createRegistry(),
    templateId: 'glitter-project_hub',
    locale,
    translations: loadTemplateTranslations(locale),
  });

  return testUtils;
}

describe('glitter-project_hub home board data bindings', () => {
  let testUtils: ReturnType<typeof createHomeLayoutTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('renders public board API data on the homepage', async () => {
    testUtils = createHomeLayoutTest();

    testUtils.mockApi('stats', {
      response: {
        data: {
          users: 11,
          boards: 6,
          posts: 1,
          comments: 0,
        },
      },
    });
    testUtils.mockApi('recent_posts', {
      response: {
        data: [
          {
            id: 6,
            board_slug: 'notice',
            board_name: '공지사항',
            title: 'Welcome to the notice board',
            created_at: '2026-05-03 05:51',
            created_at_formatted: '7분 전',
            comment_count: 0,
            is_secret: false,
            is_new: true,
          },
          {
            id: 8,
            board_slug: 'free',
            board_name: '자유게시판',
            title: 'Free board update',
            created_at: '2026-05-03 06:10',
            created_at_formatted: '3분 전',
            comment_count: 0,
            is_secret: false,
            is_new: true,
          },
        ],
      },
    });
    testUtils.mockApi('popular_boards', {
      response: {
        data: [
          { id: 30, name: '공지사항', slug: 'notice', posts_count: 1 },
          { id: 32, name: '질문게시판', slug: 'qna', posts_count: 0 },
          { id: 31, name: '자유게시판', slug: 'free', posts_count: 0 },
          { id: 33, name: '자료실', slug: 'resources', posts_count: 0 },
          { id: 34, name: '가입인사', slug: 'introductions', posts_count: 0 },
          { id: 35, name: '도움게시판', slug: 'support', posts_count: 0 },
        ],
      },
    });
    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('운영 업데이트').length).toBeGreaterThan(0);
    expect(screen.getAllByText('자유 논의').length).toBeGreaterThan(0);
    expect(screen.getAllByText('질문 공간').length).toBeGreaterThan(0);
    expect(screen.getAllByText('자료 아카이브').length).toBeGreaterThan(0);
    expect(screen.getByText('참여 경로')).toBeInTheDocument();
    expect(screen.getAllByText('운영 업데이트').length).toBeGreaterThan(0);
    expect(screen.getByText('지금 이어지는 활동')).toBeInTheDocument();
    expect(screen.getByText('활동 흐름')).toBeInTheDocument();
    expect(screen.getByText('답변 대기')).toBeInTheDocument();
    expect(screen.getByText('추천 공간')).toBeInTheDocument();
    expect(screen.getAllByText('질문 작성').length).toBeGreaterThan(0);
    expect(screen.getByText('질문부터 시작')).toBeInTheDocument();
    expect(screen.getAllByText('운영 지원').length).toBeGreaterThan(0);
    expect(screen.getByText('커뮤니티 정책')).toBeInTheDocument();
    expect(screen.queryByText('boards.notice')).not.toBeInTheDocument();
    expect(screen.queryByText('boards.free')).not.toBeInTheDocument();
    expect(screen.queryByText('boards.qna')).not.toBeInTheDocument();
    expect(screen.getAllByText('Welcome to the notice board')).toHaveLength(1);
    expect(screen.getAllByText('Free board update').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.queryByText('기타게시판')).not.toBeInTheDocument();

    const bodyText = document.body.textContent ?? '';
    expect(bodyText.indexOf('Welcome to the notice board')).toBeLessThan(bodyText.indexOf('Free board update'));
  });

  it('renders starter board names through the active locale', async () => {
    testUtils = createHomeLayoutTest('en');

    testUtils.mockApi('stats', {
      response: {
        data: {
          users: 11,
          boards: 6,
          posts: 1,
          comments: 0,
        },
      },
    });
    testUtils.mockApi('recent_posts', {
      response: {
        data: [
          {
            id: 6,
            board_slug: 'notice',
            board_name: '공지사항',
            title: 'Welcome to the notice board',
            created_at: '2026-05-03 05:51',
            created_at_formatted: '7 minutes ago',
            comment_count: 0,
            is_secret: false,
            is_new: true,
          },
        ],
      },
    });
    testUtils.mockApi('popular_boards', {
      response: {
        data: [
          { id: 30, name: '공지사항', slug: 'notice', posts_count: 1 },
          { id: 32, name: '질문게시판', slug: 'qna', posts_count: 0 },
          { id: 31, name: '자유게시판', slug: 'free', posts_count: 0 },
          { id: 33, name: '자료실', slug: 'resources', posts_count: 0 },
          { id: 34, name: '가입인사', slug: 'introductions', posts_count: 0 },
          { id: 35, name: '도움게시판', slug: 'support', posts_count: 0 },
        ],
      },
    });
    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('Operational Updates').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Open Discussion').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Question Space').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Resource Archive').length).toBeGreaterThan(0);
    expect(screen.getByText('Participation paths')).toBeInTheDocument();
    expect(screen.getAllByText('Operational Updates').length).toBeGreaterThan(0);
    expect(screen.getByText('Activity in progress')).toBeInTheDocument();
    expect(screen.getByText('Activity flow')).toBeInTheDocument();
    expect(screen.getByText('Awaiting answers')).toBeInTheDocument();
    expect(screen.getByText('Recommended Spaces')).toBeInTheDocument();
    expect(screen.getAllByText('Ask a question').length).toBeGreaterThan(0);
    expect(screen.getByText('Start with a question')).toBeInTheDocument();
    expect(screen.getByText('Operational support')).toBeInTheDocument();
    expect(screen.getByText('Community policy')).toBeInTheDocument();
    expect(screen.queryByText('boards.notice')).not.toBeInTheDocument();
    expect(screen.queryByText('boards.free')).not.toBeInTheDocument();
    expect(screen.queryByText('boards.qna')).not.toBeInTheDocument();
    expect(screen.queryByText('공지사항')).not.toBeInTheDocument();
    expect(screen.queryByText('자유게시판')).not.toBeInTheDocument();
    expect(screen.queryByText('질문게시판')).not.toBeInTheDocument();
  });

  it('preserves homepage empty states when board arrays are empty', async () => {
    testUtils = createHomeLayoutTest();

    testUtils.mockApi('stats', {
      response: { data: { users: 0, boards: 0, posts: 0, comments: 0 } },
    });
    testUtils.mockApi('recent_posts', { response: { data: [] } });
    testUtils.mockApi('popular_boards', { response: { data: [] } });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('활동 대기 중')).toBeInTheDocument();
    expect(screen.getByText('공간 정렬 대기 중')).toBeInTheDocument();
    expect(screen.getByText('활동이 늘어나면 참여하기 좋은 공간이 표시됩니다.')).toBeInTheDocument();
    expect(screen.getByText('추천 공간')).toBeInTheDocument();
    expect(screen.queryByText('설정 후 추천 공간이 표시됩니다')).not.toBeInTheDocument();
  });

  it('keeps homepage write choices limited to free and qna boards', () => {
    const startPost = readJson<any>('layouts/partials/home/_start_post.json');
    const choices = startPost.children[0].children[1].children;

    expect(choices).toHaveLength(2);
    expect(JSON.stringify(startPost)).toContain('/board/free/write');
    expect(JSON.stringify(startPost)).toContain('/board/qna/write');
    expect(JSON.stringify(startPost)).not.toContain('/board/notice/write');
    expect(JSON.stringify(startPost)).not.toContain('/board/resources/write');
    expect(JSON.stringify(startPost)).not.toContain('/board/introductions/write');
    expect(JSON.stringify(startPost)).not.toContain('/board/support/write');
    expect(JSON.stringify(startPost)).not.toContain('$t:boards.notice');
  });

  it('aligns below-hero home sections with the hero content width', () => {
    const home = readJson<any>('layouts/home.json');
    const sections = home.slots.content[0].children;
    const alignedClasses = ['-mx-4', 'sm:-mx-6', 'lg:-mx-8'];
    const sectionClassByPartial = new Map<string, string>();

    for (const section of sections) {
      const partials = JSON.stringify(section.children ?? []);

      if (partials.includes('partials/home/')) {
        sectionClassByPartial.set(partials, section.props?.className ?? '');
      }
    }

    for (const partial of [
      '_activity_compact.json',
      '_discovery_grid.json',
      '_archive_highlights.json',
      '_recommended_spaces.json',
      '_community_entry_strip.json',
    ]) {
      const wrapperClass = [...sectionClassByPartial.entries()].find(([partials]) => partials.includes(partial))?.[1] ?? '';

      for (const alignedClass of alignedClasses) {
        expect(wrapperClass).toContain(alignedClass);
      }
    }
  });

  it('keeps the homepage support entry compact and linked to existing routes', () => {
    const home = readJson<any>('layouts/home.json');
    const supportEntry = readJson<any>('layouts/partials/home/_community_entry_strip.json');
    const homeText = JSON.stringify(home);
    const supportText = JSON.stringify(supportEntry);

    expect(homeText).toContain('partials/home/_community_entry_strip.json');
    expect(supportText).toContain('/board/support');
    expect(supportText).toContain('/page/refund');
    expect(supportText).toContain('$t:home.community_entry_strip.support');
    expect(supportText).toContain('$t:home.community_entry_strip.policy');
    expect(supportText).toContain('grid grid-cols-1 gap-1.5');
    expect(supportText).not.toContain('Report & Support');
    expect(supportText).not.toContain('Community Policy');
  });

  it('renders refreshed homepage stats and recent posts after a free-board post is created', async () => {
    testUtils = createHomeLayoutTest();

    testUtils.mockApi('stats', {
      response: {
        data: {
          users: 11,
          boards: 3,
          posts: 2,
          comments: 0,
        },
      },
    });
    testUtils.mockApi('recent_posts', {
      response: {
        data: [
          {
            id: 77,
            board_slug: 'free',
            board_name: '자유게시판',
            title: '새 자유게시판 글',
            created_at: '2026-05-03 07:10',
            created_at_formatted: '방금 전',
            comment_count: 0,
            is_secret: false,
            is_new: true,
          },
        ],
      },
    });
    testUtils.mockApi('popular_boards', {
      response: {
        data: [
          { id: 31, name: '자유게시판', slug: 'free', posts_count: 1 },
          { id: 30, name: '공지사항', slug: 'notice', posts_count: 1 },
          { id: 32, name: '질문게시판', slug: 'qna', posts_count: 0 },
        ],
      },
    });
    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('자유 논의').length).toBeGreaterThan(0);
    expect(screen.getAllByText('새 자유게시판 글').length).toBeGreaterThan(0);
    expect(screen.getAllByText('방금 전').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.queryByText('첫 논의가 이 공간에 축적됩니다')).not.toBeInTheDocument();
  });
});
