

import { describe, it, expect } from 'vitest';
import showLayout from '../../../layouts/board/show.json';
import indexLayout from '../../../layouts/board/index.json';

function getDataSource(layout: any, dataSourceId: string) {
  return (layout.data_sources ?? []).find((s: any) => s.id === dataSourceId) ?? null;
}

function getDataSourceErrorHandling(layout: any, dataSourceId: string) {
  const ds = getDataSource(layout, dataSourceId);
  return ds?.errorHandling ?? null;
}

describe('게시판 401 errorHandling — sequence + redirect 방식 (이슈 #228 B-5)', () => {
  describe('show.json — auth_mode 및 데이터소스 401', () => {
    
    const ds = getDataSource(showLayout, 'post');
    const dsErrorHandling = ds?.errorHandling ?? null;

    it('auth_mode가 optional이어야 한다 (auth_required 사용 금지)', () => {
      expect(ds?.auth_mode).toBe('optional');
      expect(ds?.auth_required).toBeUndefined();
    });

    it('데이터소스 errorHandling에 401이 정의되어야 한다', () => {
      expect(dsErrorHandling?.['401']).toBeDefined();
    });

    it('401 핸들러가 sequence 타입이어야 한다', () => {
      expect(dsErrorHandling?.['401']?.handler).toBe('sequence');
    });

    it('sequence actions 배열이 존재해야 한다', () => {
      expect(Array.isArray(dsErrorHandling?.['401']?.actions)).toBe(true);
      expect(dsErrorHandling?.['401']?.actions.length).toBeGreaterThanOrEqual(2);
    });

    it('첫 번째 action이 toast 핸들러이어야 한다', () => {
      const toastAction = dsErrorHandling?.['401']?.actions[0];
      expect(toastAction?.handler).toBe('toast');
    });

    it('두 번째 action이 navigate 핸들러이어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.handler).toBe('navigate');
    });

    it('navigate path가 /login이어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.params?.path).toBe('/login');
    });

    it('navigate query에 redirect 파라미터가 없어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.params?.query).toBeUndefined();
    });

    it('기존 403 핸들러가 유지되어야 한다', () => {
      expect(dsErrorHandling?.['403']).toBeDefined();
      expect(dsErrorHandling?.['403']?.handler).toBe('showErrorPage');
    });

    it('기존 404 핸들러가 유지되어야 한다', () => {
      expect(dsErrorHandling?.['404']).toBeDefined();
      expect(dsErrorHandling?.['404']?.handler).toBe('showErrorPage');
    });

    it('레이아웃 최상위에 errorHandling이 없어야 한다', () => {
      expect((showLayout as any).errorHandling).toBeUndefined();
    });
  });

  describe('index.json — auth_mode 및 데이터소스 401', () => {
    const ds = getDataSource(indexLayout, 'posts');
    const dsErrorHandling = ds?.errorHandling ?? null;

    it('auth_mode가 optional이어야 한다 (auth_required 사용 금지)', () => {
      expect(ds?.auth_mode).toBe('optional');
      expect(ds?.auth_required).toBeUndefined();
    });

    it('데이터소스 errorHandling에 401이 정의되어야 한다', () => {
      expect(dsErrorHandling?.['401']).toBeDefined();
    });

    it('401 핸들러가 sequence 타입이어야 한다', () => {
      expect(dsErrorHandling?.['401']?.handler).toBe('sequence');
    });

    it('sequence actions 배열이 존재해야 한다', () => {
      expect(Array.isArray(dsErrorHandling?.['401']?.actions)).toBe(true);
      expect(dsErrorHandling?.['401']?.actions.length).toBeGreaterThanOrEqual(2);
    });

    it('첫 번째 action이 toast 핸들러이어야 한다', () => {
      const toastAction = dsErrorHandling?.['401']?.actions[0];
      expect(toastAction?.handler).toBe('toast');
    });

    it('두 번째 action이 navigate 핸들러이어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.handler).toBe('navigate');
    });

    it('navigate path가 /login이어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.params?.path).toBe('/login');
    });

    it('navigate query에 redirect 파라미터가 없어야 한다', () => {
      const navigateAction = dsErrorHandling?.['401']?.actions[1];
      expect(navigateAction?.params?.query).toBeUndefined();
    });

    it('기존 403 핸들러가 유지되어야 한다', () => {
      expect(dsErrorHandling?.['403']).toBeDefined();
      expect(dsErrorHandling?.['403']?.handler).toBe('showErrorPage');
    });

    it('레이아웃 최상위에 errorHandling이 없어야 한다', () => {
      expect((indexLayout as any).errorHandling).toBeUndefined();
    });
  });
});
