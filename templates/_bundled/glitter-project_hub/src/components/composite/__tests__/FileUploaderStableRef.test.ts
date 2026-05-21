

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef, useMemo } from 'react';


interface Attachment {
    id: number;
    [key: string]: any;
}

function useStableInitialFiles(initialFiles: Attachment[]) {
    const prevRef = useRef<Attachment[]>(initialFiles);

    const stable = useMemo(() => {
        const prev = prevRef.current;
        if (prev === initialFiles) return prev;
        if (prev.length !== initialFiles.length) {
            prevRef.current = initialFiles;
            return initialFiles;
        }
        if (prev.length === 0 && initialFiles.length === 0) return prev;
        const changed = initialFiles.some((f, i) => f.id !== prev[i]?.id);
        if (changed) {
            prevRef.current = initialFiles;
            return initialFiles;
        }
        return prev;
    }, [initialFiles]);

    return stable;
}

describe('FileUploader initialFiles 참조 안정성', () => {
    describe('빈 배열 안정화', () => {
        it('매 렌더마다 새 빈 배열 전달 시 동일 참조 유지', () => {
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: [] as Attachment[] } }
            );

            const firstRef = result.current;

            
            rerender({ files: [] });
            expect(result.current).toBe(firstRef);

            
            rerender({ files: [] });
            expect(result.current).toBe(firstRef);
        });

        it('동일 참조 전달 시 그대로 반환', () => {
            const STABLE: Attachment[] = [];
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: STABLE } }
            );

            const firstRef = result.current;

            rerender({ files: STABLE });
            expect(result.current).toBe(firstRef);
        });
    });

    describe('실제 변경 감지', () => {
        it('파일이 추가되면 새 참조 반환', () => {
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: [] as Attachment[] } }
            );

            const firstRef = result.current;

            
            rerender({ files: [{ id: 1, name: 'test.jpg' }] });
            expect(result.current).not.toBe(firstRef);
            expect(result.current).toHaveLength(1);
        });

        it('파일 ID가 변경되면 새 참조 반환', () => {
            const files1 = [{ id: 1, name: 'a.jpg' }, { id: 2, name: 'b.jpg' }];
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: files1 } }
            );

            const firstRef = result.current;

            
            const files2 = [{ id: 1, name: 'a.jpg' }, { id: 3, name: 'c.jpg' }];
            rerender({ files: files2 });
            expect(result.current).not.toBe(firstRef);
        });

        it('동일 ID 배열은 새 참조여도 이전 참조 유지', () => {
            const files1 = [{ id: 1, name: 'a.jpg' }, { id: 2, name: 'b.jpg' }];
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: files1 } }
            );

            const firstRef = result.current;

            
            const files2 = [{ id: 1, name: 'a.jpg' }, { id: 2, name: 'b.jpg' }];
            rerender({ files: files2 });
            expect(result.current).toBe(firstRef);
        });

        it('파일 개수가 줄어들면 새 참조 반환', () => {
            const files1 = [{ id: 1 }, { id: 2 }] as Attachment[];
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: files1 } }
            );

            const firstRef = result.current;

            rerender({ files: [{ id: 1 }] as Attachment[] });
            expect(result.current).not.toBe(firstRef);
        });
    });

    describe('무한 루프 방지 시나리오', () => {
        it('100회 연속 새 빈 배열 전달에도 참조 안정 유지', () => {
            const { result, rerender } = renderHook(
                ({ files }) => useStableInitialFiles(files),
                { initialProps: { files: [] as Attachment[] } }
            );

            const firstRef = result.current;

            for (let i = 0; i < 100; i++) {
                rerender({ files: [] }); 
            }

            
            expect(result.current).toBe(firstRef);
        });
    });
});
