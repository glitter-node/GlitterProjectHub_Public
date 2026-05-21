import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).G7Core;
  });

  it('applies the default neutral variant', () => {
    render(<Badge>Status</Badge>);

    expect(screen.getByText('Status')).toHaveClass('badge', 'variant-neutral');
  });

  it('applies every canonical variant class', () => {
    const variants = [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'neutral',
      'ghost',
      'outline',
    ] as const;

    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toHaveClass('badge', `variant-${variant}`);
      unmount();
    });
  });

  it('merges external className through G7Core mergeClasses', () => {
    const mergeClasses = vi.fn((baseClasses: string, overrideClasses?: string) => `${baseClasses} ${overrideClasses ?? ''}`.trim());
    (window as any).G7Core = {
      style: {
        mergeClasses,
      },
    };

    render(<Badge variant="warning" className="uppercase">Secret</Badge>);

    expect(mergeClasses).toHaveBeenCalledWith('badge variant-warning', 'uppercase');
    expect(screen.getByText('Secret')).toHaveClass('badge', 'variant-warning', 'uppercase');
  });
});
