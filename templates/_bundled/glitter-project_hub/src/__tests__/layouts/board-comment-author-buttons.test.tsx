

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createLayoutTest, screen } from '@/core/template-engine/__tests__/utils/layoutTestUtils';
import { ComponentRegistry } from '@/core/template-engine/ComponentRegistry';





const TestDiv: React.FC<{
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}> = ({ className, children, 'data-testid': testId }) => (
  <div className={className} data-testid={testId}>
    {children}
  </div>
);

const TestButton: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
  type?: string;
  onClick?: () => void;
  'data-testid'?: string;
}> = ({ className, children, text, onClick, 'data-testid': testId }) => (
  <button className={className} onClick={onClick} data-testid={testId}>
    {children || text}
  </button>
);

const TestSpan: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
}> = ({ className, children, text }) => (
  <span className={className}>{children || text}</span>
);





function setupTestRegistry(): ComponentRegistry {
  const registry = ComponentRegistry.getInstance();

  const Fragment: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

  (registry as any).registry = {
    Fragment: { component: Fragment, metadata: { name: 'Fragment', type: 'layout' } },
    Div: { component: TestDiv, metadata: { name: 'Div', type: 'basic' } },
    Button: { component: TestButton, metadata: { name: 'Button', type: 'basic' } },
    Span: { component: TestSpan, metadata: { name: 'Span', type: 'basic' } },
  };

  return registry;
}






const commentButtonLayout = {
  version: '1.0.0',
  layout_name: 'comment_author_buttons_test',
  components: [
    {
      type: 'basic',
      name: 'Div',
      props: { 'data-testid': 'comment-item' },
      children: [
        {
          comment: '더보기 드롭다운 컨테이너 (버튼들을 감싸는 부모)',
          type: 'basic',
          name: 'Div',
          if: '{{!comment?.deleted_at && comment?.status !== \'blinded\' && ((comment?.is_author && post?.data?.abilities?.can_write_comments) || comment?.is_guest_comment || post?.data?.abilities?.can_manage || (post?.data?.abilities?.can_write_comments && (comment?.depth ?? 0) < (post?.data?.board?.max_comment_depth ?? 10)))}}',
          props: { 'data-testid': 'dropdown-menu' },
          children: [
            {
              comment: '수정 버튼 ((본인 + 권한) || 비회원 || manager)',
              type: 'basic',
              name: 'Button',
              if: '{{(comment?.is_author && post?.data?.abilities?.can_write_comments) || comment?.is_guest_comment || post?.data?.abilities?.can_manage}}',
              props: { 'data-testid': 'btn-edit' },
              children: [{ type: 'basic', name: 'Span', text: '수정' }],
            },
            {
              comment: '삭제 버튼 ((본인 + 권한) || 비회원 || manager)',
              type: 'basic',
              name: 'Button',
              if: '{{(comment?.is_author && post?.data?.abilities?.can_write_comments) || comment?.is_guest_comment || post?.data?.abilities?.can_manage}}',
              props: { 'data-testid': 'btn-delete' },
              children: [{ type: 'basic', name: 'Span', text: '삭제' }],
            },
          ],
        },
      ],
    },
  ],
};

function makeInitialData(comment: Record<string, any>, postAbilities: Record<string, any>) {
  return {
    comment,
    post: {
      data: {
        abilities: postAbilities,
      },
    },
  };
}





describe('댓글 수정/삭제 버튼 표시 조건 (이슈 #228 B-4)', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = setupTestRegistry();
  });

  it('본인 댓글 + can_write_comments=true → 수정/삭제 버튼 표시', async () => {
    const initialData = makeInitialData(
      { is_author: true, is_guest_comment: false },
      { can_write_comments: true, can_manage: false },
    );

    const testUtils = createLayoutTest(commentButtonLayout as any, { componentRegistry: registry, initialData });
    await testUtils.render();

    expect(screen.getByTestId('btn-edit')).toBeInTheDocument();
    expect(screen.getByTestId('btn-delete')).toBeInTheDocument();

    testUtils.cleanup();
  });

  it('본인 댓글 + can_write_comments=false → 수정/삭제 버튼 미표시', async () => {
    const initialData = makeInitialData(
      { is_author: true, is_guest_comment: false },
      { can_write_comments: false, can_manage: false },
    );

    const testUtils = createLayoutTest(commentButtonLayout as any, { componentRegistry: registry, initialData });
    await testUtils.render();

    expect(screen.queryByTestId('btn-edit')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-delete')).not.toBeInTheDocument();

    testUtils.cleanup();
  });

  it('타인 댓글 + 권한 없음 → 수정/삭제 버튼 미표시', async () => {
    const initialData = makeInitialData(
      { is_author: false, is_guest_comment: false },
      { can_write_comments: true, can_manage: false },
    );

    const testUtils = createLayoutTest(commentButtonLayout as any, { componentRegistry: registry, initialData });
    await testUtils.render();

    expect(screen.queryByTestId('btn-edit')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-delete')).not.toBeInTheDocument();

    testUtils.cleanup();
  });

  it('비회원 댓글 (is_guest_comment=true) → 수정/삭제 버튼 표시', async () => {
    const initialData = makeInitialData(
      { is_author: false, is_guest_comment: true },
      { can_write_comments: false, can_manage: false },
    );

    const testUtils = createLayoutTest(commentButtonLayout as any, { componentRegistry: registry, initialData });
    await testUtils.render();

    expect(screen.getByTestId('btn-edit')).toBeInTheDocument();
    expect(screen.getByTestId('btn-delete')).toBeInTheDocument();

    testUtils.cleanup();
  });

  it('manager 권한 (can_manage=true) → 타인 댓글도 수정/삭제 버튼 표시', async () => {
    const initialData = makeInitialData(
      { is_author: false, is_guest_comment: false },
      { can_write_comments: false, can_manage: true },
    );

    const testUtils = createLayoutTest(commentButtonLayout as any, { componentRegistry: registry, initialData });
    await testUtils.render();

    expect(screen.getByTestId('btn-edit')).toBeInTheDocument();
    expect(screen.getByTestId('btn-delete')).toBeInTheDocument();

    testUtils.cleanup();
  });
});
