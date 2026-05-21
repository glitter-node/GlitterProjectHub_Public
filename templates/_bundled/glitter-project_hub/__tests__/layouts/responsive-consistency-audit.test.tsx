import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const layoutsDir = path.resolve(__dirname, '../../layouts');

function loadLayout(relativePath: string) {
  const filePath = path.join(layoutsDir, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function findById(layout: any, id: string): any {
  if (layout.id === id) return layout;
  const children = [
    ...(Array.isArray(layout.components) ? layout.components : []),
    ...(Array.isArray(layout.children) ? layout.children : []),
  ];

  for (const child of children) {
    const found = findById(child, id);
    if (found) return found;
  }

  return null;
}

describe('glitter-project_hub responsive layout consistency', () => {
  const userBase = loadLayout('_user_base.json');

  it('mobile header is hidden by default and shown on portable viewports', () => {
    const mobileHeader = findById(userBase, 'mobile_header');

    expect(mobileHeader).not.toBeNull();
    expect(mobileHeader.props.className).toBe('hidden');
    expect(mobileHeader.responsive?.portable?.props?.className).toContain('flex');
    expect(mobileHeader.responsive.portable.props.className).toContain('sticky');
  });

  it('desktop header is hidden by default and shown on desktop viewports', () => {
    const desktopHeader = findById(userBase, 'desktop_header');

    expect(desktopHeader).not.toBeNull();
    expect(desktopHeader.props.className).toBe('hidden');
    expect(desktopHeader.responsive?.desktop?.props?.className).toBe('block');
  });

  it('mobile overlay uses responsive condition instead of class toggling', () => {
    const mobileOverlay = findById(userBase, 'mobile_overlay');

    expect(mobileOverlay).not.toBeNull();
    expect(mobileOverlay.if).toBe('{{false}}');
    expect(mobileOverlay.responsive?.portable?.if).toBe('{{_global.mobileMenuOpen}}');
    expect(mobileOverlay.responsive?.portable?.props?.className).toBeUndefined();
  });

  it('main content widens only on desktop viewports', () => {
    const mainContent = findById(userBase, 'main_content');

    expect(mainContent).not.toBeNull();
    expect(mainContent.props.className).toBe('min-h-fit px-4');
    expect(mainContent.responsive?.desktop?.props?.className).toContain('max-w-7xl');
    expect(mainContent.responsive.desktop.props.className).toContain('px-8');
  });
});
