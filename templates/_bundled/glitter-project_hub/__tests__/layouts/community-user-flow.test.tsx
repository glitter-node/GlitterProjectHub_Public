import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
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

function loadTemplateTranslations(locale: 'en' | 'ko' = 'ko') {
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

function resolvePartials<T = any>(value: T, currentDir = 'layouts'): T {
  if (Array.isArray(value)) {
    return value.map((item) => resolvePartials(item, currentDir)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, any>;
  if (typeof record.partial === 'string') {
    const partialPath = record.partial.startsWith('partials/')
      ? path.posix.join('layouts', record.partial)
      : path.posix.normalize(path.posix.join(currentDir, record.partial));
    return resolvePartials(readJson(partialPath), path.posix.dirname(partialPath));
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => [key, resolvePartials(child, currentDir)])
  ) as T;
}

function createRegistry() {
  const registry = createMockComponentRegistryWithBasics();

  const Icon = ({ name, className }: { name?: string; className?: string }) => (
    <span className={className} data-icon={name} />
  );
  const HtmlContent = ({ content }: { content?: string }) => (
    <div data-testid="html-content" dangerouslySetInnerHTML={{ __html: content ?? '' }} />
  );
  const HtmlEditor = ({ name, label }: { name?: string; label?: string }) => (
    <label>
      <span>{label}</span>
      <textarea data-testid={`html-editor-${name ?? 'content'}`} />
    </label>
  );
  const Passthrough = ({ children, text }: { children?: React.ReactNode; text?: string }) => (
    <div>{children ?? text}</div>
  );

  registry.register('basic', 'Icon', Icon);
  registry.register('layout', 'Container', ({ children, className }) => (
    <div className={className}>{children}</div>
  ));
  registry.register('composite', 'Icon', Icon);
  registry.register('composite', 'HtmlContent', HtmlContent);
  registry.register('composite', 'html_content', HtmlContent);
  registry.register('composite', 'HtmlEditor', HtmlEditor);
  registry.register('composite', 'html_editor', HtmlEditor);
  registry.register('composite', 'Avatar', Passthrough);
  registry.register('composite', 'UserInfo', ({ name }: { name?: string }) => <span>{name}</span>);
  registry.register('composite', 'FileUploader', Passthrough);
  registry.register('composite', 'Pagination', Passthrough);

  return registry;
}

function createTemplateLayoutTest(layoutPath: string, options: Record<string, any> = {}) {
  const layout = resolvePartials(readJson(layoutPath));

  return createLayoutTest(layout, {
    componentRegistry: createRegistry(),
    templateId: 'glitter-project_hub',
    locale: options.locale ?? 'ko',
    translations: loadTemplateTranslations(options.locale ?? 'ko'),
    ...options,
  });
}

function boardInfo(slug: string, name: string, overrides: Record<string, any> = {}) {
  return {
    slug,
    name,
    description: `${name} 설명`,
    type: 'basic',
    categories: [],
    show_category: false,
    settings: {
      use_file_upload: false,
      use_comment: true,
      use_reply: false,
      use_report: true,
      secret_mode: 'disabled',
      show_view_count: true,
      per_page: 20,
      posts_per_page: 20,
      posts_per_page_mobile: 15,
      new_display_hours: 24,
      order_by: 'created_at',
      order_direction: 'DESC',
    },
    ...overrides,
  };
}

describe('glitter-project_hub community board user flow layouts', () => {
  let testUtils: ReturnType<typeof createTemplateLayoutTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('renders the board post list with localized board title, posts, pagination metadata, and write affordance', async () => {
    testUtils = createTemplateLayoutTest('layouts/board/index.json', {
      routeParams: { slug: 'free' },
    });

    testUtils.mockApi('posts', {
      response: {
        data: {
          data: [
            {
              id: 77,
              title: '새 자유게시판 글',
              author: { name: 'tester', uuid: 'user-1', is_guest: false },
              created_at: '2026-05-03 07:10',
              created_at_formatted: '방금 전',
              view_count: 3,
              comment_count: 0,
              is_notice: false,
              is_new: true,
              is_secret: false,
              row_type: 'normal',
              number: 1,
            },
          ],
          pagination: {
            total: 1,
            all_total: 1,
            count: 1,
            per_page: 20,
            current_page: 1,
            last_page: 1,
            from: 1,
            to: 1,
            has_more_pages: false,
          },
          board: boardInfo('free', '자유게시판'),
          abilities: {
            can_read: true,
            can_write: true,
            can_read_comments: true,
            can_write_comments: true,
            can_manage: false,
          },
        },
      },
    });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('자유게시판').length).toBeGreaterThan(0);
    expect(screen.getAllByText('새 자유게시판 글').length).toBeGreaterThan(0);
    expect(screen.getAllByText('논의 시작').length).toBeGreaterThan(0);

    const listLayout = readJson<any>('layouts/board/index.json');
    expect(listLayout.data_sources[0].endpoint).toBe('/api/modules/sirsoft-board/boards/{{route.slug}}/posts');
  });

  it('renders an empty qna board list without breaking pagination or the empty state', async () => {
    testUtils = createTemplateLayoutTest('layouts/board/index.json', {
      routeParams: { slug: 'qna' },
    });

    testUtils.mockApi('posts', {
      response: {
        data: {
          data: [],
          pagination: {
            total: 0,
            all_total: 0,
            count: 0,
            per_page: 20,
            current_page: 1,
            last_page: 1,
            from: 0,
            to: 0,
            has_more_pages: false,
          },
          board: boardInfo('qna', '질문게시판', {
            categories: ['일반문의', '기술문의', '기타'],
            show_category: true,
            settings: {
              ...boardInfo('qna', '질문게시판').settings,
              secret_mode: 'enabled',
              use_reply: true,
            },
          }),
          abilities: {
            can_read: true,
            can_write: false,
            can_read_comments: true,
            can_write_comments: false,
            can_manage: false,
          },
        },
      },
    });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('질문게시판').length).toBeGreaterThan(0);
    expect(screen.getAllByText('아직 질문이 없습니다. 첫 질문을 남겨보세요.').length).toBeGreaterThan(0);
    expect(screen.getByText('질문하기')).toBeInTheDocument();

    await testUtils.user.click(screen.getByText('질문하기'));

    expect(testUtils.getNavigationHistory()).toContain('/login?redirect=%2Fboard%2Fqna%2Fwrite');
  });

  it('routes authenticated users from an empty free board to the write form', async () => {
    testUtils = createTemplateLayoutTest('layouts/board/index.json', {
      routeParams: { slug: 'free' },
      initialState: {
        _global: {
          currentUser: {
            uuid: 'user-1',
            name: 'tester',
          },
        },
      },
    });

    testUtils.mockApi('posts', {
      response: {
        data: {
          data: [],
          pagination: {
            total: 0,
            all_total: 0,
            count: 0,
            per_page: 20,
            current_page: 1,
            last_page: 1,
            from: 0,
            to: 0,
            has_more_pages: false,
          },
          board: boardInfo('free', '자유게시판'),
          abilities: {
            can_read: true,
            can_write: true,
            can_read_comments: true,
            can_write_comments: true,
            can_manage: false,
          },
        },
      },
    });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('자유게시판').length).toBeGreaterThan(0);
    expect(screen.getByText('아직 기록이 없습니다. 첫 논의를 시작해보세요.')).toBeInTheDocument();
    expect(screen.getByText('논의 시작하기')).toBeInTheDocument();

    await testUtils.user.click(screen.getByText('논의 시작하기'));

    expect(testUtils.getNavigationHistory()).toContain('/board/free/write');
  });

  it('keeps empty board engagement actions scoped to the empty state component', () => {
    const emptyStates = readFileSync(
      path.join(templateRoot, 'layouts/partials/board/index/_empty_states.json'),
      'utf-8'
    );

    expect(emptyStates).toContain('(posts?.data?.data ?? []).length === 0');
    expect(emptyStates).toContain('$t:board.empty.free.title');
    expect(emptyStates).toContain('$t:board.empty.free.cta');
    expect(emptyStates).toContain('$t:board.empty.qna.title');
    expect(emptyStates).toContain('$t:board.empty.qna.cta');
    expect(emptyStates).toContain('/board/free/write');
    expect(emptyStates).toContain('/board/qna/write');
    expect(emptyStates).not.toContain('/board/notice/write');
  });

  it('renders existing notice post detail with body, author, date, board name, empty comments, and list navigation', async () => {
    testUtils = createTemplateLayoutTest('layouts/board/show.json', {
      routeParams: { slug: 'notice', id: '6' },
    });

    testUtils.mockApi('post', {
      response: {
        data: {
          id: 6,
          title: 'Welcome to the notice board',
          content: '<p>This board is ready for site-wide announcements.</p>',
          content_mode: 'html',
          author: { name: 'humanpc', uuid: 'user-1', is_guest: false },
          created_at: '2026-05-03 일요일 05:51',
          created_at_formatted: '1시간 전',
          board: {
            slug: 'notice',
            name: '공지사항',
            type: 'basic',
            use_comment: true,
            use_reply: false,
            use_report: false,
            show_view_count: true,
            max_reply_depth: 5,
            max_comment_depth: 10,
          },
          abilities: {
            can_write: false,
            can_manage: false,
            can_read_comments: true,
            can_write_comments: false,
          },
          comments: [],
          replies: [],
          attachments: [],
          is_notice: true,
          is_secret: false,
          is_new: true,
          status: 'published',
          view_count: 1,
          comment_count: 0,
          depth: 0,
          is_author: false,
          is_guest_post: false,
        },
      },
    });
    testUtils.mockApi('navigation', {
      response: {
        data: {
          prev: null,
          next: null,
        },
      },
    });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('Welcome to the notice board')).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.getByText('1시간 전')).toBeInTheDocument();
    expect(screen.getByText('댓글')).toBeInTheDocument();
    expect(screen.getAllByText('기록 목록').length).toBeGreaterThan(0);

    const showLayout = readJson<any>('layouts/board/show.json');
    expect(showLayout.data_sources[0].endpoint).toBe('/api/modules/sirsoft-board/boards/{{route.slug}}/posts/{{route.id}}');
    expect(showLayout.data_sources[1].endpoint).toBe('/api/modules/sirsoft-board/boards/{{route.slug}}/posts/{{route.id}}/navigation');
  });

  it('renders the free-board write form and redirects guests to login on write API 401', async () => {
    testUtils = createTemplateLayoutTest('layouts/board/form.json', {
      routeParams: { slug: 'free' },
    });

    testUtils.mockApi('form_data', {
      response: {
        data: {
          title: '',
          content: '',
          content_mode: 'text',
          category: null,
          is_notice: false,
          is_secret: false,
          parent_id: null,
        },
      },
    });
    testUtils.mockApi('form_meta', {
      response: {
        data: {
          board: {
            name: '자유게시판',
            type: 'basic',
            categories: [],
            secret_mode: 'disabled',
            use_file_upload: false,
            user_abilities: {
              can_write: true,
              can_upload: false,
              can_manage: false,
            },
          },
          requires_password: false,
          parent_post: null,
          author: null,
          attachments: [],
        },
      },
    });

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('논의 시작').length).toBeGreaterThan(0);
    expect(screen.getAllByText('자유게시판').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
    expect(document.querySelector('#content_section')).toBeInTheDocument();

    const formLayout = readJson<any>('layouts/board/form.json');
    for (const source of formLayout.data_sources) {
      expect(source.errorHandling['401']).toMatchObject({
        handler: 'sequence',
      });
      expect(source.errorHandling['401'].actions[1].params).toEqual({
        path: '/login',
        query: {
          redirect: '/board/{{route.slug}}/write',
        },
      });
    }
  });
});
