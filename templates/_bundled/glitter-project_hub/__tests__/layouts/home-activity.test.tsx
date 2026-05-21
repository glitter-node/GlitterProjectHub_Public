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

function createHomeLayoutTest(locale: 'en' | 'ko' = 'ko') {
  const homeLayout = resolvePartials(readJson('layouts/home.json'));

  return createLayoutTest(homeLayout, {
    componentRegistry: createRegistry(),
    templateId: 'glitter-project_hub',
    locale,
    translations: loadTemplateTranslations(locale),
  });
}

function mockHomeApis(testUtils: ReturnType<typeof createHomeLayoutTest>, recentPosts: any[]) {
  testUtils.mockApi('stats', {
    response: {
      data: {
        users: 4,
        boards: 3,
        posts: recentPosts.length,
        comments: recentPosts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0),
      },
    },
  });
  testUtils.mockApi('recent_posts', { response: { data: recentPosts } });
  testUtils.mockApi('popular_boards', {
    response: {
      data: [
        { id: 31, name: '자유게시판', slug: 'free', posts_count: 2 },
        { id: 32, name: '질문게시판', slug: 'qna', posts_count: 1 },
      ],
    },
  });
}

describe('glitter-project_hub home live activity strip', () => {
  let testUtils: ReturnType<typeof createHomeLayoutTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('renders post and comment activity from recent board data', async () => {
    testUtils = createHomeLayoutTest();

    mockHomeApis(testUtils, [
      {
        id: 12,
        board_slug: 'free',
        board_name: '자유게시판',
        title: '첫 인사 글',
        author_name: '민수',
        created_at_formatted: '방금 전',
        comment_count: 0,
      },
      {
        id: 13,
        board_slug: 'qna',
        board_name: '질문게시판',
        title: '설치 질문',
        author: { name: '지현' },
        created_at_formatted: '3분 전',
        comment_count: 2,
      },
    ]);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('지금 이어지는 활동')).toBeInTheDocument();
    expect(screen.getByText('활동 흐름')).toBeInTheDocument();
    expect(screen.getAllByText('자유 논의').length).toBeGreaterThan(0);
    expect(screen.getAllByText('질문 공간').length).toBeGreaterThan(0);
    expect(screen.getAllByText('방금 전').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3분 전').length).toBeGreaterThan(0);
  });

  it('renders the live activity fallback when recent activity is empty', async () => {
    testUtils = createHomeLayoutTest();

    mockHomeApis(testUtils, []);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('활동 대기 중')).toBeInTheDocument();
    expect(screen.getByText('질문부터 시작')).toBeInTheDocument();
    expect(screen.getByText('첫 질문과 답변이 이곳에서 이어집니다.')).toBeInTheDocument();
  });

  it('resolves live activity translation keys in English', async () => {
    testUtils = createHomeLayoutTest('en');

    mockHomeApis(testUtils, [
      {
        id: 21,
        board_slug: 'free',
        board_name: 'Free Board',
        title: 'Community update',
        author_name: 'Alex',
        created_at_formatted: '1 minute ago',
        comment_count: 1,
      },
    ]);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('Activity in progress')).toBeInTheDocument();
    expect(screen.getByText('Activity flow')).toBeInTheDocument();
    expect(screen.queryByText('home.activity_compact.title')).not.toBeInTheDocument();
    expect(screen.queryByText('home.live_activity.new_comment')).not.toBeInTheDocument();
  });
});
