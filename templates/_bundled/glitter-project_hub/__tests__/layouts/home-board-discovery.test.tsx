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

function mockHomeApis(testUtils: ReturnType<typeof createHomeLayoutTest>, boards: any[]) {
  testUtils.mockApi('stats', {
    response: {
      data: {
        users: 4,
        boards: boards.length,
        posts: boards.reduce((sum, board) => sum + (board.posts_count ?? 0), 0),
        comments: 0,
      },
    },
  });
  testUtils.mockApi('recent_posts', { response: { data: [] } });
  testUtils.mockApi('popular_boards', { response: { data: boards } });
}

describe('glitter-project_hub home board discovery strip', () => {
  let testUtils: ReturnType<typeof createHomeLayoutTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('renders board discovery items from existing board data', async () => {
    testUtils = createHomeLayoutTest();

    mockHomeApis(testUtils, [
      { id: 31, name: '공지사항', slug: 'notice', posts_count: 5 },
      { id: 32, name: '자유게시판', slug: 'free', posts_count: 12 },
      { id: 33, name: '질문게시판', slug: 'qna', posts_count: 3 },
      { id: 34, name: '자료실', slug: 'resources', posts_count: 7 },
      { id: 35, name: '가입인사', slug: 'introductions', posts_count: 4 },
      { id: 36, name: '도움게시판', slug: 'support', posts_count: 2 },
    ]);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('추천 공간')).toBeInTheDocument();
    expect(screen.getByText('참여 경로')).toBeInTheDocument();
    expect(screen.getAllByText('운영 업데이트').length).toBeGreaterThan(0);
    expect(screen.getAllByText('자유 논의').length).toBeGreaterThan(0);
    expect(screen.getAllByText('질문 공간').length).toBeGreaterThan(0);
    expect(screen.getAllByText('자료 아카이브').length).toBeGreaterThan(0);
    expect(screen.getAllByText('소개 및 연결').length).toBeGreaterThan(0);
    expect(screen.getAllByText('운영 지원').length).toBeGreaterThan(0);
    expect(screen.getByText('운영 업데이트')).toBeInTheDocument();
    expect(screen.getByText('자유 논의')).toBeInTheDocument();
    expect(screen.getByText('질문 공간')).toBeInTheDocument();
    expect(screen.getAllByText('기록').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
  });

  it('renders the board discovery fallback when no boards are available', async () => {
    testUtils = createHomeLayoutTest();

    mockHomeApis(testUtils, []);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('공간 정렬 대기 중')).toBeInTheDocument();
    expect(screen.getByText('활동이 늘어나면 참여하기 좋은 공간이 표시됩니다.')).toBeInTheDocument();
  });

  it('resolves board discovery translation keys in English', async () => {
    testUtils = createHomeLayoutTest('en');

    mockHomeApis(testUtils, [
      { id: 41, name: 'Q&A Board', slug: 'qna', activity_count: 9 },
    ]);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByText('Recommended Spaces')).toBeInTheDocument();
    expect(screen.getByText('Participation paths')).toBeInTheDocument();
    expect(screen.getAllByText('Question Space').length).toBeGreaterThan(0);
    expect(screen.getByText('Question Space')).toBeInTheDocument();
    expect(screen.queryByText('home.recommended_spaces.title')).not.toBeInTheDocument();
    expect(screen.queryByText('home.board_discovery.purpose_qna')).not.toBeInTheDocument();
  });

  it('resolves the support and introductions board preset labels when shown', async () => {
    testUtils = createHomeLayoutTest('en');

    mockHomeApis(testUtils, [
      { id: 41, name: 'Introductions', slug: 'introductions', activity_count: 9 },
      { id: 42, name: 'Support', slug: 'support', activity_count: 5 },
    ]);

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getAllByText('Introductions & Connections').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operational Support').length).toBeGreaterThan(0);
    expect(screen.getByText('Introductions & Connections')).toBeInTheDocument();
    expect(screen.getByText('Operational Support')).toBeInTheDocument();
  });
});
