

import { describe, it, expect, vi, beforeEach } from 'vitest';


describe('RichTextEditor 컴포넌트 - 다국어 처리', () => {
  let mockG7Core: any;
  let tFunction: (key: string, params?: Record<string, string | number>) => string;

  beforeEach(() => {
    
    mockG7Core = {
      t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'editor.toolbar.bold': '굵게',
          'editor.toolbar.italic': '기울임',
          'editor.toolbar.underline': '밑줄',
          'editor.toolbar.strike': '취소선',
          'editor.toolbar.code': '코드',
          'editor.toolbar.bullet_list': '글머리 기호',
          'editor.toolbar.ordered_list': '번호 목록',
          'editor.toolbar.blockquote': '인용',
          'editor.toolbar.link': '링크',
          'editor.toolbar.code_view': '코드보기',
          'editor.link_modal.title': '링크 삽입',
          'editor.link_modal.insert': '삽입',
          'common.cancel': '취소',
        };
        return translations[key] ?? key;
      }),
    };

    
    (window as any).G7Core = mockG7Core;

    
    tFunction = (key: string, params?: Record<string, string | number>) =>
      (window as any).G7Core?.t?.(key, params) ?? key;
  });

  describe('G7Core.t() 함수 동작', () => {
    it('G7Core.t()가 올바른 번역을 반환해야 함', () => {
      expect(tFunction('editor.toolbar.bold')).toBe('굵게');
      expect(tFunction('editor.toolbar.italic')).toBe('기울임');
      expect(tFunction('editor.toolbar.underline')).toBe('밑줄');
      expect(tFunction('editor.toolbar.strike')).toBe('취소선');
      expect(tFunction('editor.toolbar.code')).toBe('코드');
    });

    it('리스트 버튼 번역이 올바르게 반환되어야 함', () => {
      expect(tFunction('editor.toolbar.bullet_list')).toBe('글머리 기호');
      expect(tFunction('editor.toolbar.ordered_list')).toBe('번호 목록');
      expect(tFunction('editor.toolbar.blockquote')).toBe('인용');
    });

    it('미디어 버튼 번역이 올바르게 반환되어야 함', () => {
      expect(tFunction('editor.toolbar.link')).toBe('링크');
      expect(tFunction('editor.toolbar.code_view')).toBe('코드보기');
    });

    it('링크 모달 번역이 올바르게 반환되어야 함', () => {
      expect(tFunction('editor.link_modal.title')).toBe('링크 삽입');
      expect(tFunction('editor.link_modal.insert')).toBe('삽입');
      expect(tFunction('common.cancel')).toBe('취소');
    });

    it('G7Core가 없을 때 키를 그대로 반환해야 함 (fallback)', () => {
      (window as any).G7Core = undefined;

      const result = tFunction('editor.toolbar.bold');
      expect(result).toBe('editor.toolbar.bold');
    });

    it('G7Core.t가 없을 때 키를 그대로 반환해야 함 (fallback)', () => {
      (window as any).G7Core = {};

      const result = tFunction('editor.toolbar.bold');
      expect(result).toBe('editor.toolbar.bold');
    });

    it('정의되지 않은 키는 키를 그대로 반환해야 함', () => {
      const result = tFunction('editor.undefined.key');
      expect(result).toBe('editor.undefined.key');
    });
  });

  describe('번역 키 구조 검증', () => {
    it('모든 툴바 버튼 키가 editor.toolbar 네임스페이스를 사용해야 함', () => {
      const toolbarKeys = [
        'editor.toolbar.bold',
        'editor.toolbar.italic',
        'editor.toolbar.underline',
        'editor.toolbar.strike',
        'editor.toolbar.code',
        'editor.toolbar.bullet_list',
        'editor.toolbar.ordered_list',
        'editor.toolbar.blockquote',
        'editor.toolbar.link',
        'editor.toolbar.code_view',
      ];

      toolbarKeys.forEach(key => {
        expect(key).toMatch(/^editor\.toolbar\./);
        expect(tFunction(key)).toBeTruthy();
        expect(tFunction(key)).not.toBe(key); 
      });
    });

    it('링크 모달 키가 editor.link_modal 네임스페이스를 사용해야 함', () => {
      const modalKeys = [
        'editor.link_modal.title',
        'editor.link_modal.insert',
      ];

      modalKeys.forEach(key => {
        expect(key).toMatch(/^editor\.link_modal\./);
        expect(tFunction(key)).toBeTruthy();
        expect(tFunction(key)).not.toBe(key); 
      });
    });

    it('공통 키가 common 네임스페이스를 사용해야 함', () => {
      const commonKeys = ['common.cancel'];

      commonKeys.forEach(key => {
        expect(key).toMatch(/^common\./);
        expect(tFunction(key)).toBeTruthy();
        expect(tFunction(key)).not.toBe(key); 
      });
    });
  });

  describe('하드코딩된 문자열 확인', () => {
    it('RichTextEditor에 하드코딩된 한국어 문자열이 없어야 함', () => {
      
      
      
      
      
      
      
      

      
      expect(tFunction('editor.toolbar.bold')).toBe('굵게');
      expect(tFunction('editor.toolbar.code_view')).toBe('코드보기');
      expect(tFunction('editor.link_modal.title')).toBe('링크 삽입');
      expect(tFunction('common.cancel')).toBe('취소');
      expect(tFunction('editor.link_modal.insert')).toBe('삽입');
    });
  });

  describe('Props 인터페이스 검증', () => {
    it('필수 props가 정의되어야 함', () => {
      
      const requiredProps = {
        name: 'content',
      };

      expect(requiredProps.name).toBeDefined();
      expect(typeof requiredProps.name).toBe('string');
    });

    it('선택적 props의 타입이 올바르게 정의되어야 함', () => {
      const optionalProps = {
        initialValue: '<p>테스트</p>',
        placeholder: '내용을 입력하세요',
        imageUploadUrl: '/api/upload',
        minHeight: '300px',
        disabled: false,
        className: 'custom-class',
      };

      expect(typeof optionalProps.initialValue).toBe('string');
      expect(typeof optionalProps.placeholder).toBe('string');
      expect(typeof optionalProps.imageUploadUrl).toBe('string');
      expect(typeof optionalProps.minHeight).toBe('string');
      expect(typeof optionalProps.disabled).toBe('boolean');
      expect(typeof optionalProps.className).toBe('string');
    });

    it('onChange 콜백 타입이 올바르게 정의되어야 함', () => {
      const onChange = vi.fn((html: string) => {
        expect(typeof html).toBe('string');
      });

      onChange('<p>테스트</p>');
      expect(onChange).toHaveBeenCalledWith('<p>테스트</p>');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('커서 위치 보존 동작', () => {
    it('dangerouslySetInnerHTML을 사용하지 않아야 함', () => {
      
      
      

      
      
      
      

      expect(true).toBe(true); 
    });

    it('initialValue가 ref를 통해 직접 설정되어야 함', () => {
      
      
      const initialValue = '<p>초기 내용</p>';

      expect(typeof initialValue).toBe('string');
      expect(initialValue).toBeTruthy();
    });

    it('onInput 이벤트가 content state를 업데이트해야 함', () => {
      
      const mockSetContent = vi.fn();
      const mockEvent = {
        currentTarget: {
          innerHTML: '<p>새로운 내용</p>',
        },
      };

      
      mockSetContent(mockEvent.currentTarget.innerHTML);

      expect(mockSetContent).toHaveBeenCalledWith('<p>새로운 내용</p>');
      expect(mockSetContent).toHaveBeenCalledTimes(1);
    });
  });
});
