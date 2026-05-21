import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const depthVariants = {
  '0': 'ml-0',
  '1': 'ml-4',
  '2': 'ml-8',
  '3': 'ml-12',
  '4': 'ml-16',
  '5': 'ml-20',
  '6': 'ml-24',
  '7': 'ml-28',
  '8': 'ml-32',
  '9': 'ml-36',
  '10': 'ml-40',
};

function readJson(path: string) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}

function collectNodes(value: unknown): Record<string, any>[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectNodes);
  }

  const current = value as Record<string, any>;

  return [
    current,
    ...Object.values(current).flatMap(collectNodes),
  ];
}

describe('board depth indentation', () => {
  it('comment item uses classMap depth indentation without inline style', () => {
    const layout = readJson('../../../layouts/partials/board/show/_comment_item.json');

    expect(layout.props.style).toBeUndefined();
    expect(layout.classMap).toEqual({
      variants: depthVariants,
      key: '{{Math.min(comment?.depth ?? 0, 10)}}',
      default: 'ml-0',
    });
  });

  it('basic index title areas use classMap depth indentation without inline style', () => {
    const layout = readJson('../../../layouts/partials/board/types/basic/index.json');
    const nodes = collectNodes(layout);
    const depthNodes = nodes.filter((node) => node.classMap?.key === '{{Math.min(post?.depth ?? 0, 10)}}');

    expect(depthNodes).toHaveLength(2);

    depthNodes.forEach((node) => {
      expect(node.props.style).toBeUndefined();
      expect(node.classMap).toEqual({
        variants: depthVariants,
        key: '{{Math.min(post?.depth ?? 0, 10)}}',
        default: 'ml-0',
      });
    });
  });

  it('safelists all depth indentation classes through 10rem', () => {
    const safelist = readFileSync(path.join(process.cwd(), 'src/styles/safelist.txt'), 'utf8');

    Object.values(depthVariants).forEach((className) => {
      expect(safelist).toContain(className);
    });
  });
});
