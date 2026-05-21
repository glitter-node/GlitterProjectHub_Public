import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).G7Core;
  });

  it('applies the default variant and size classes', () => {
    render(<Button>Confirm</Button>);

    const button = screen.getByRole('button', { name: 'Confirm' });
    expect(button).toHaveClass('btn', 'variant-primary', 'px-4', 'py-2', 'text-sm');
  });

  it('applies every canonical variant class', () => {
    const variants = [
      ['primary', 'variant-primary'],
      ['secondary', 'variant-secondary'],
      ['success', 'variant-success'],
      ['warning', 'variant-warning'],
      ['danger', 'variant-danger'],
      ['neutral', 'variant-neutral'],
      ['ghost', 'variant-ghost'],
      ['outline', 'variant-outline'],
    ] as const;

    variants.forEach(([variant, expectedClass]) => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant })).toHaveClass(expectedClass);
      unmount();
    });
  });

  it('applies every documented size class', () => {
    render(
      <>
        <Button size="sm">small</Button>
        <Button size="md">medium</Button>
        <Button size="lg">large</Button>
      </>
    );

    expect(screen.getByRole('button', { name: 'small' })).toHaveClass('px-3', 'py-1.5', 'text-sm');
    expect(screen.getByRole('button', { name: 'medium' })).toHaveClass('px-4', 'py-2', 'text-sm');
    expect(screen.getByRole('button', { name: 'large' })).toHaveClass('px-5', 'py-3', 'text-sm');
  });

  it('merges external className through G7Core mergeClasses', () => {
    const mergeClasses = vi.fn((baseClasses: string, overrideClasses?: string) => `${baseClasses} ${overrideClasses ?? ''}`.trim());
    (window as any).G7Core = {
      style: {
        mergeClasses,
      },
    };

    render(<Button variant="primary" className="gap-2 cursor-pointer">Move</Button>);

    expect(mergeClasses).toHaveBeenCalledWith('btn variant-primary px-4 py-2 text-sm', 'gap-2 cursor-pointer');
    expect(screen.getByRole('button', { name: 'Move' })).toHaveClass('variant-primary', 'gap-2', 'cursor-pointer');
  });

  it('preserves legacy custom className styling when no variant is provided', () => {
    render(<Button className="text-slate-700 hover:bg-slate-100">Menu</Button>);

    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center', 'text-slate-700', 'hover:bg-slate-100');
    expect(button).not.toHaveClass('variant-primary');
  });
});
