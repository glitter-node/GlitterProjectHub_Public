import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLayoutTest, screen } from '@/core/template-engine/__tests__/utils/layoutTestUtils';
import { ComponentRegistry } from '@/core/template-engine/ComponentRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.resolve(__dirname, '..', '..', '..');

const TestDiv: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => <div className={className}>{children}</div>;

const TestSpan: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
}> = ({ className, children, text }) => <span className={className}>{children || text}</span>;

const TestBadge: React.FC<{
  variant?: string;
  className?: string;
  children?: React.ReactNode;
  text?: string;
}> = ({ variant, className, children, text }) => (
  <span className={className} data-testid={`badge-${variant}`} data-variant={variant}>
    {children || text}
  </span>
);

const TestIcon: React.FC<{
  name?: string;
  className?: string;
}> = ({ name, className }) => <i className={className} data-icon={name} />;

const TestH4: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
}> = ({ className, children, text }) => <h4 className={className}>{children || text}</h4>;

const TestA: React.FC<{
  className?: string;
  href?: string;
  title?: string;
  children?: React.ReactNode;
}> = ({ className, href, title, children }) => (
  <a className={className} href={href} title={title}>
    {children}
  </a>
);

function setupTestRegistry(): ComponentRegistry {
  const registry = ComponentRegistry.getInstance();
  const Fragment: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

  (registry as any).registry = {
    Fragment: { component: Fragment, metadata: { name: 'Fragment', type: 'layout' } },
    Div: { component: TestDiv, metadata: { name: 'Div', type: 'basic' } },
    Span: { component: TestSpan, metadata: { name: 'Span', type: 'basic' } },
    Badge: { component: TestBadge, metadata: { name: 'Badge', type: 'basic' } },
    Icon: { component: TestIcon, metadata: { name: 'Icon', type: 'basic' } },
    H4: { component: TestH4, metadata: { name: 'H4', type: 'basic' } },
    A: { component: TestA, metadata: { name: 'A', type: 'basic' } },
  };

  return registry;
}

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(path.join(templateRoot, relativePath), 'utf-8'));
}

describe('parent post badge layout', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = setupTestRegistry();
  });

  it('renders notice and secret markers through Badge variants', async () => {
    const parentPostCard = readJson('layouts/partials/board/form/_parent_post.json');
    delete parentPostCard.if;
    const layout = {
      version: '1.0.0',
      layout_name: 'parent_post_badge_test',
      components: [parentPostCard],
    };

    const testUtils = createLayoutTest(layout as any, {
      componentRegistry: registry,
      initialData: {
        form_data: { data: { parent_id: 10 } },
        query: {},
        route: { slug: 'free' },
        form_meta: {
          data: {
            parent_post: {
              id: 10,
              title: 'Parent post',
              is_notice: true,
              is_secret: true,
              author: { name: 'Author' },
              created_at_human: 'Today',
            },
          },
        },
      },
    });

    await testUtils.render();

    expect(screen.getByTestId('badge-danger')).toHaveAttribute('data-variant', 'danger');
    expect(screen.getByTestId('badge-warning')).toHaveAttribute('data-variant', 'warning');

    testUtils.cleanup();
  });
});
