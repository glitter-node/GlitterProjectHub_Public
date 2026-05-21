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

function createHomeLayoutTest(initialState: Record<string, any> = {}) {
  const homeLayout = resolvePartials(readJson('layouts/home.json'));

  return createLayoutTest(homeLayout, {
    componentRegistry: createRegistry(),
    templateId: 'glitter-project_hub',
    locale: 'ko',
    translations: loadTemplateTranslations('ko'),
    initialState,
  });
}

function mockHomeApis(testUtils: ReturnType<typeof createHomeLayoutTest>) {
  testUtils.mockApi('stats', {
    response: {
      data: {
        users: 4,
        boards: 2,
        posts: 3,
        comments: 1,
      },
    },
  });
  testUtils.mockApi('recent_posts', {
    response: {
      data: [
        {
          id: 11,
          board_slug: 'free',
          board_name: '자유게시판',
          title: '최근 글',
          author_name: '민수',
          created_at_formatted: '방금 전',
          comment_count: 1,
        },
      ],
    },
  });
  testUtils.mockApi('popular_boards', {
    response: {
      data: [
        { id: 31, name: '자유게시판', slug: 'free', posts_count: 2 },
        { id: 32, name: '질문게시판', slug: 'qna', posts_count: 1 },
      ],
    },
  });
}

describe('glitter-project_hub home smart CTA layer', () => {
  let testUtils: ReturnType<typeof createHomeLayoutTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('routes guests into the login flow before asking a question', async () => {
    testUtils = createHomeLayoutTest();
    mockHomeApis(testUtils);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('로그인 후 질문을 남길 수 있습니다.')).toBeInTheDocument();
    expect(screen.getByText('로그인하고 질문하기')).toBeInTheDocument();
    expect(screen.queryByText('질문 남기기')).not.toBeInTheDocument();

    await testUtils.user.click(screen.getByText('로그인하고 질문하기'));

    expect(testUtils.getNavigationHistory()).toContain('/login?redirect=%2Fboard%2Fqna%2Fwrite');
  });

  it('routes logged-in users without activity to the Q&A write screen', async () => {
    testUtils = createHomeLayoutTest({
      _global: {
        currentUser: {
          uuid: 'user-new',
          name: '신규 회원',
          posts_count: 0,
          comments_count: 0,
        },
      },
    });
    mockHomeApis(testUtils);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('맥락이 필요하면 질문부터 시작하세요.')).toBeInTheDocument();
    expect(screen.getByText('질문 남기기')).toBeInTheDocument();
    expect(screen.queryByText('로그인하고 질문하기')).not.toBeInTheDocument();

    await testUtils.user.click(screen.getByText('질문 남기기'));

    expect(testUtils.getNavigationHistory()).toContain('/board/qna/write');
  });

  it('routes logged-in users with activity back to their active board', async () => {
    testUtils = createHomeLayoutTest({
      _global: {
        currentUser: {
          uuid: 'user-active',
          name: '활동 회원',
          posts_count: 2,
          comments_count: 3,
        },
        lastVisitedBoardSlug: 'qna',
      },
    });
    mockHomeApis(testUtils);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('진행 중인 논의로 돌아가세요.')).toBeInTheDocument();
    expect(screen.getByText('활동 이어가기')).toBeInTheDocument();
    expect(screen.queryByText('질문 남기기')).not.toBeInTheDocument();

    await testUtils.user.click(screen.getByText('활동 이어가기'));

    expect(testUtils.getNavigationHistory()).toContain('/board/qna');
  });
});
