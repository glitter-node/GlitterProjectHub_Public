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

function createRegistry() {
  const registry = createMockComponentRegistryWithBasics();

  registry.register('layout', 'Container', ({ children, className }) => (
    <div className={className}>{children}</div>
  ));

  return registry;
}

function createPolicyTest(locale: 'en' | 'ko') {
  return createLayoutTest(readJson('layouts/page/policy.json'), {
    componentRegistry: createRegistry(),
    templateId: 'glitter-project_hub',
    locale,
    translations: loadTemplateTranslations(locale),
  });
}

describe('glitter-project_hub policy page layout', () => {
  let testUtils: ReturnType<typeof createPolicyTest> | null = null;

  afterEach(() => {
    testUtils?.cleanup();
    testUtils = null;
  });

  it('renders Korean policy content from template translations', async () => {
    testUtils = createPolicyTest('ko');

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByRole('heading', { name: '커뮤니티 정책' })).toBeInTheDocument();
    expect(screen.getByText('소개')).toBeInTheDocument();
    expect(screen.getByText('이용 규칙')).toBeInTheDocument();
    expect(screen.getByText('금지 행위')).toBeInTheDocument();
    expect(screen.getByText('신고 및 운영 조치')).toBeInTheDocument();
    expect(screen.getByText('기록과 댓글은 해당 공간의 주제와 목적에 맞게 작성합니다.')).toBeInTheDocument();
    expect(screen.queryByText('Community Policy')).not.toBeInTheDocument();
  });

  it('renders English policy content from template translations', async () => {
    testUtils = createPolicyTest('en');

    await testUtils.render();
    testUtils.assertNoValidationErrors();

    expect(screen.getByRole('heading', { name: 'Community Policy' })).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Usage Rules')).toBeInTheDocument();
    expect(screen.getByText('Prohibited Behavior')).toBeInTheDocument();
    expect(screen.getByText('Reporting and Enforcement')).toBeInTheDocument();
    expect(screen.getByText('Write records and comments in the space that best matches the topic and purpose.')).toBeInTheDocument();
    expect(screen.queryByText('커뮤니티 정책')).not.toBeInTheDocument();
  });

  it('routes /page/refund before the generic DB-backed page route', () => {
    const routes = readJson<{ routes: Array<{ path: string; layout?: string }> }>('routes.json');
    const refundRouteIndex = routes.routes.findIndex((route) => route.path === '/page/refund');
    const genericPageRouteIndex = routes.routes.findIndex((route) => route.path === '/page/:slug');

    expect(refundRouteIndex).toBeGreaterThanOrEqual(0);
    expect(genericPageRouteIndex).toBeGreaterThanOrEqual(0);
    expect(refundRouteIndex).toBeLessThan(genericPageRouteIndex);
    expect(routes.routes[refundRouteIndex].layout).toBe('page/policy');
  });
});
