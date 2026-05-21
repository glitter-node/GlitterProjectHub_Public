import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageSkeleton } from '../PageSkeleton';

describe('PageSkeleton', () => {
    const defaultOptions = { animation: 'pulse' as const, iteration_count: 3 };

    it('빈 components 배열 시 컨테이너만 렌더링해야 한다', () => {
        render(<PageSkeleton components={[]} options={defaultOptions} />);

        const container = screen.getByRole('status');
        expect(container).toBeTruthy();
        expect(container.getAttribute('aria-busy')).toBe('true');
        expect(container.children.length).toBe(0);
    });

    it('레이아웃 컨테이너(Div)는 props.className을 유지하고 자식을 순회해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: { className: 'flex gap-4' },
                children: [
                    { name: 'H1', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const wrapper = container.querySelector('.flex.gap-4');
        expect(wrapper).toBeTruthy();
        
        expect(wrapper!.children.length).toBe(2);
    });

    it('텍스트 컴포넌트(H1, P 등)를 회색 바로 치환해야 한다', () => {
        const components = [
            { name: 'H1', type: 'basic' },
            { name: 'P', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const bars = status.children;
        
        expect(bars[0].className).toContain('h-7');
        expect(bars[0].className).toContain('w-3/5');
        expect(bars[1].className).toContain('h-3');
        expect(bars[1].className).toContain('w-full');
    });

    it('인풋 컴포넌트(Input)를 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Input', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const input = status.children[0];
        expect(input.className).toContain('h-9');
        expect(input.className).toContain('border');
    });

    it('Textarea를 큰 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Textarea', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-20');
    });

    it('Avatar를 원형으로 치환해야 한다', () => {
        const components = [
            { name: 'Avatar', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('rounded-full');
        expect(status.children[0].className).toContain('h-10');
        expect(status.children[0].className).toContain('w-10');
    });

    it('Button을 작은 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Button', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-9');
        expect(status.children[0].className).toContain('w-24');
    });

    it('iteration 블록을 iteration_count만큼 반복해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: { className: 'item-container' },
                iteration: {
                    source: 'products?.data?.data',
                    item_var: 'product',
                },
                children: [
                    { name: 'H2', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={{ animation: 'pulse', iteration_count: 4 }} />
        );

        
        const items = container.querySelectorAll('.item-container');
        expect(items.length).toBe(4);
    });

    it('DataGrid를 테이블 형태 스켈레톤으로 치환해야 한다', () => {
        const components = [
            { name: 'DataGrid', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        const gridContainer = status.children[0];
        expect(gridContainer).toBeTruthy();
    });

    it('Modal/Toast/ConfirmDialog는 빈 Fragment로 렌더링해야 한다', () => {
        const components = [
            { name: 'Modal', type: 'composite' },
            { name: 'Toast', type: 'composite' },
            { name: 'ConfirmDialog', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        
        
        const children = Array.from(status.children);
        children.forEach((child) => {
            
            expect(child.textContent).toBe('');
        });
    });

    it('pulse 애니메이션 시 animate-pulse 클래스가 포함되어야 한다', () => {
        const components = [
            { name: 'P', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={{ animation: 'pulse', iteration_count: 3 }} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('animate-pulse');
    });

    it('none 애니메이션 시 animate-pulse 클래스가 없어야 한다', () => {
        const components = [
            { name: 'P', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={{ animation: 'none', iteration_count: 3 }} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).not.toContain('animate-pulse');
    });

    it('깊은 중첩 컴포넌트 트리를 올바르게 순회해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: { className: 'level-1' },
                children: [
                    {
                        name: 'Flex',
                        type: 'layout',
                        props: { className: 'level-2' },
                        children: [
                            {
                                name: 'Grid',
                                type: 'layout',
                                props: { className: 'level-3' },
                                children: [
                                    { name: 'Span', type: 'basic' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const level1 = container.querySelector('.level-1');
        const level2 = level1?.querySelector('.level-2');
        const level3 = level2?.querySelector('.level-3');
        expect(level3).toBeTruthy();
        expect(level3!.children.length).toBe(1); 
    });

    it('다크 모드 클래스가 포함되어야 한다', () => {
        const components = [
            { name: 'P', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.children[0].className).toContain('dark:bg-slate-700');
    });

    it('name이 없는 컴포넌트는 건너뛰어야 한다', () => {
        const components = [
            { type: 'basic' } as any,
            { name: 'P', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.children.length).toBe(1);
    });

    it('미인식 컴포넌트(children 있음)를 컨테이너로 처리해야 한다', () => {
        const components = [
            {
                name: 'CustomWidget',
                type: 'composite',
                props: { className: 'custom-class' },
                children: [
                    { name: 'H2', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const customEl = container.querySelector('.custom-class');
        expect(customEl).toBeTruthy();
        expect(customEl!.children.length).toBe(1);
    });

    it('미인식 컴포넌트(children 없음)를 범용 바로 치환해야 한다', () => {
        const components = [
            { name: 'UnknownComponent', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-3');
        expect(status.children[0].className).toContain('bg-slate-200');
    });

    it('Checkbox/Radio/Toggle을 작은 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Checkbox', type: 'basic' },
            { name: 'Toggle', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-5');
        expect(status.children[0].className).toContain('w-5');
        expect(status.children[1].className).toContain('h-5');
        expect(status.children[1].className).toContain('w-5');
    });

    it('Icon을 작은 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Icon', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-5');
        expect(status.children[0].className).toContain('w-5');
    });

    it('Img를 큰 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'Img', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-40');
        expect(status.children[0].className).toContain('w-full');
    });

    it('Flex 컨테이너의 레이아웃 클래스를 유지하고 시각적 클래스를 제거해야 한다', () => {
        const components = [
            {
                name: 'Flex',
                type: 'layout',
                props: {
                    className: 'flex items-center justify-between gap-4 bg-white text-slate-800 shadow-md',
                },
                children: [
                    { name: 'H2', type: 'basic' },
                    { name: 'Button', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const flex = container.querySelector('.flex.items-center');
        expect(flex).toBeTruthy();
        
        expect(flex!.className).toContain('justify-between');
        expect(flex!.className).toContain('gap-4');
        
        expect(flex!.className).not.toContain('bg-white');
        expect(flex!.className).not.toContain('text-slate-800');
        expect(flex!.className).not.toContain('shadow-md');
    });

    it('Grid 컬럼 수를 유지해야 한다 (4 이하)', () => {
        const components = [
            {
                name: 'Grid',
                type: 'layout',
                props: {
                    className: 'grid grid-cols-3 gap-4',
                },
                children: [
                    { name: 'P', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeTruthy();
        
        expect(grid!.className).toContain('grid-cols-3');
    });

    it('Grid 컬럼 수가 5 이상이면 절반으로 축소해야 한다', () => {
        const components = [
            {
                name: 'Grid',
                type: 'layout',
                props: {
                    className: 'grid grid-cols-6 gap-4',
                },
                children: [
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeTruthy();
        
        expect(grid!.className).toContain('grid-cols-3');
    });

    it('props.className에서 className을 올바르게 읽어야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'max-w-7xl mx-auto px-8',
                },
                children: [
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const div = container.querySelector('.max-w-7xl');
        expect(div).toBeTruthy();
        expect(div!.className).toContain('mx-auto');
        expect(div!.className).toContain('px-8');
    });

    it('루트 컨테이너에 불필요한 배경/패딩이 없어야 한다', () => {
        const { container } = render(
            <PageSkeleton components={[]} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.className).not.toContain('bg-slate-50');
        expect(status.className).not.toContain('py-6');
        expect(status.className).not.toContain('min-h-full');
    });

    

    it('Flex 컴포넌트의 justify/align props를 Tailwind 클래스로 변환해야 한다', () => {
        const components = [
            {
                name: 'Flex',
                type: 'layout',
                props: {
                    justify: 'center',
                    align: 'start',
                    className: 'min-h-[60vh] py-12',
                },
                children: [
                    { name: 'H2', type: 'basic' },
                    { name: 'Input', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const flex = container.querySelector('.flex');
        expect(flex).toBeTruthy();
        
        expect(flex!.className).toContain('justify-center');
        expect(flex!.className).toContain('items-start');
        expect(flex!.className).toContain('flex-row');
        
        expect(flex!.className).toContain('py-12');
        
        expect(flex!.children.length).toBe(2);
    });

    it('Flex 컴포넌트의 direction/wrap/gap props를 Tailwind 클래스로 변환해야 한다', () => {
        const components = [
            {
                name: 'Flex',
                type: 'layout',
                props: {
                    direction: 'col',
                    wrap: 'wrap',
                    gap: 6,
                    className: 'p-4',
                },
                children: [
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const flex = container.querySelector('.flex');
        expect(flex).toBeTruthy();
        expect(flex!.className).toContain('flex-col');
        expect(flex!.className).toContain('flex-wrap');
        expect(flex!.className).toContain('gap-6');
        expect(flex!.className).toContain('p-4');
    });

    it('Grid 컴포넌트의 cols/gap props를 Tailwind 클래스로 변환해야 한다', () => {
        const components = [
            {
                name: 'Grid',
                type: 'layout',
                props: {
                    cols: 3,
                    gap: 4,
                    className: 'mt-4',
                },
                children: [
                    { name: 'P', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeTruthy();
        expect(grid!.className).toContain('grid-cols-3');
        expect(grid!.className).toContain('gap-4');
        expect(grid!.className).toContain('mt-4');
    });

    it('Grid 컴포넌트의 반응형 cols props를 Tailwind 클래스로 변환해야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Grid',
                type: 'layout',
                props: {
                    cols: 1,
                    responsive: { sm: 2, md: 3, lg: 4 },
                    gap: 6,
                    rowGap: 8,
                },
                children: [
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const grid = container.querySelector('.grid');
        expect(grid).toBeTruthy();
        expect(grid!.className).toContain('grid-cols-1');
        expect(grid!.className).toContain('gap-6');
        
        
        expect(grid!.className).toContain('grid-cols-4'); 

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    it('Flex props 없이 className만 있는 경우 기존 동작을 유지해야 한다', () => {
        const components = [
            {
                name: 'Flex',
                type: 'layout',
                props: {
                    className: 'flex items-center justify-between gap-4',
                },
                children: [
                    { name: 'H2', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const flex = container.querySelector('.flex');
        expect(flex).toBeTruthy();
        
        expect(flex!.className).toContain('items-center');
        expect(flex!.className).toContain('justify-between');
        expect(flex!.className).toContain('gap-4');
    });

    

    it('자식 없는 Div(leaf 컨테이너)를 스켈레톤 바로 표시해야 한다', () => {
        const components = [
            { name: 'Div', type: 'basic', props: { className: 'h-8 w-48' } },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const bar = status.children[0];
        expect(bar.className).toContain('h-8');
        expect(bar.className).toContain('w-48');
        expect(bar.className).toContain('bg-slate-200');
    });

    it('자식 없는 Div에 크기 클래스 없으면 기본 크기 바를 렌더해야 한다', () => {
        const components = [
            { name: 'Div', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const bar = status.children[0];
        expect(bar.className).toContain('h-3.5');
        expect(bar.className).toContain('w-full');
        expect(bar.className).toContain('bg-slate-200');
    });

    

    it('부정 조건(!)의 if 분기를 스킵해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                if: '{{!posts?.data}}',
                children: [
                    { name: 'P', type: 'basic' },
                ],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{posts?.data}}',
                props: { className: 'content-branch' },
                children: [
                    { name: 'H1', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        const contentBranch = status.querySelector('.content-branch');
        expect(contentBranch).toBeTruthy();
        expect(contentBranch!.children.length).toBe(2); 
    });

    it('hasError 조건의 if 분기를 스킵해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                if: '{{_global.hasError}}',
                children: [
                    { name: 'H2', type: 'basic' },
                ],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{posts?.data?.board}}',
                props: { className: 'main-content' },
                children: [
                    { name: 'H1', type: 'basic' },
                    { name: 'P', type: 'basic' },
                    { name: 'Button', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const mainContent = status.querySelector('.main-content');
        expect(mainContent).toBeTruthy();
        expect(mainContent!.children.length).toBe(3); 
    });

    it('상호 배타적 긍정 분기 중 가장 풍부한 것을 선택해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                if: '{{type === "basic"}}',
                props: { className: 'basic-branch' },
                children: [
                    { name: 'H1', type: 'basic' },
                    { name: 'P', type: 'basic' },
                    { name: 'Div', type: 'basic', children: [
                        { name: 'Span', type: 'basic' },
                        { name: 'Span', type: 'basic' },
                    ]},
                ],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{type === "gallery"}}',
                props: { className: 'gallery-branch' },
                children: [
                    { name: 'H1', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.querySelector('.basic-branch')).toBeTruthy();
        expect(status.querySelector('.gallery-branch')).toBeFalsy();
    });

    it('if 없는 컴포넌트와 if 있는 컴포넌트가 혼재하면 둘 다 렌더해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: { className: 'always-visible' },
                children: [{ name: 'H1', type: 'basic' }],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{posts?.data}}',
                props: { className: 'conditional-content' },
                children: [{ name: 'P', type: 'basic' }],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.querySelector('.always-visible')).toBeTruthy();
        expect(status.querySelector('.conditional-content')).toBeTruthy();
    });

    it('혼재(withoutIf + withIf) 시 상호 배타적 값 분기(=== value)는 richest만 선택해야 한다', () => {
        
        const components = [
            {
                name: 'Div',
                type: 'basic',
                children: [
                    {
                        name: 'Div',
                        type: 'basic',
                        props: { className: 'navigation' },
                        children: [{ name: 'Button', type: 'basic' }],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        if: "{{post?.data?.board?.type === 'basic'}}",
                        props: { className: 'basic-type' },
                        children: [
                            { name: 'H1', type: 'basic' },
                            { name: 'P', type: 'basic' },
                            { name: 'Div', type: 'basic', children: [
                                { name: 'Span', type: 'basic' },
                            ]},
                        ],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        if: "{{post?.data?.board?.type === 'gallery'}}",
                        props: { className: 'gallery-type' },
                        children: [
                            { name: 'H1', type: 'basic' },
                        ],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        if: "{{post?.data?.board?.type === 'card'}}",
                        props: { className: 'card-type' },
                        children: [
                            { name: 'H1', type: 'basic' },
                        ],
                    },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.querySelector('.navigation')).toBeTruthy();
        
        expect(status.querySelector('.basic-type')).toBeTruthy();
        
        expect(status.querySelector('.gallery-type')).toBeFalsy();
        expect(status.querySelector('.card-type')).toBeFalsy();
    });

    it('혼재 시 비-상호배타적 조건(독립 조건)은 모두 렌더해야 한다', () => {
        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: { className: 'always-shown' },
                children: [{ name: 'H1', type: 'basic' }],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{user?.isLoggedIn}}',
                props: { className: 'logged-in-content' },
                children: [{ name: 'P', type: 'basic' }],
            },
            {
                name: 'Div',
                type: 'basic',
                if: '{{post?.data?.hasAttachments}}',
                props: { className: 'attachments' },
                children: [{ name: 'Span', type: 'basic' }],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.querySelector('.always-shown')).toBeTruthy();
        expect(status.querySelector('.logged-in-content')).toBeTruthy();
        expect(status.querySelector('.attachments')).toBeTruthy();
    });

    

    it('ProductCard를 이미지+텍스트 카드 스켈레톤으로 치환해야 한다', () => {
        const components = [
            { name: 'ProductCard', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0]).toBeTruthy();
        
        const card = status.children[0];
        expect(card.querySelector('.h-48')).toBeTruthy(); 
    });

    it('UserInfo를 작은 텍스트 바로 치환해야 한다', () => {
        const components = [
            { name: 'UserInfo', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const userInfo = status.children[0].children[0];
        expect(userInfo.className).toContain('h-3');
        expect(userInfo.className).toContain('w-14');
    });

    it('QuantitySelector를 인풋 형태 스켈레톤으로 치환해야 한다', () => {
        const components = [
            { name: 'QuantitySelector', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const qty = status.children[0].children[0];
        expect(qty.className).toContain('h-9');
        expect(qty.className).toContain('w-28');
    });

    it('ProductImageViewer를 큰 이미지 사각형으로 치환해야 한다', () => {
        const components = [
            { name: 'ProductImageViewer', type: 'composite' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        expect(status.children[0].className).toContain('h-80');
        expect(status.children[0].className).toContain('bg-slate-200');
    });

    

    it('hidden lg:grid 패턴을 데스크톱에서 grid로 해석해야 한다', () => {
        
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'hidden lg:grid gap-4 px-4 py-3',
                },
                children: [
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        const gridDiv = status.querySelector('.grid');
        expect(gridDiv).toBeTruthy();
        expect(gridDiv!.className).toContain('gap-4');
        expect(gridDiv!.className).not.toContain('hidden');
        expect(gridDiv!.children.length).toBe(2);

        
        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    it('lg:hidden 패턴을 데스크톱에서 숨겨야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'flex flex-col gap-2 px-4 py-3 lg:hidden',
                },
                children: [
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.children.length).toBe(0);

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    it('모바일에서 hidden lg:grid 패턴을 숨겨야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'hidden lg:grid gap-4 px-4',
                },
                children: [
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.children.length).toBe(0);

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    it('모바일에서 lg:hidden 패턴을 표시해야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'flex flex-col gap-2 lg:hidden',
                },
                children: [
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        const flexDiv = status.querySelector('.flex');
        expect(flexDiv).toBeTruthy();
        expect(flexDiv!.className).toContain('flex-col');

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    

    it('arbitrary grid-cols-[...] 값을 inline gridTemplateColumns style로 변환해야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: 'grid grid-cols-[60px_minmax(300px,1fr)_160px_100px_70px] gap-4 px-4',
                },
                children: [
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const gridDiv = container.querySelector('.grid')!;
        expect(gridDiv).toBeTruthy();
        
        expect(gridDiv.className).not.toContain('grid-cols-[');
        
        expect((gridDiv as HTMLElement).style.gridTemplateColumns).toBe(
            '60px minmax(300px,1fr) 160px 100px 70px'
        );

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    

    it('모든 자식이 부정 조건이면 컨테이너 자체를 스킵해야 한다 (_loading_error 패턴)', () => {
        
        const components = [
            {
                name: 'Div',
                type: 'basic',
                children: [
                    {
                        name: 'Container',
                        type: 'layout',
                        if: '{{!posts?.data?.board && !_global.hasError}}',
                        children: [
                            { name: 'Div', type: 'basic', props: { className: 'h-8 w-48' } },
                        ],
                    },
                    {
                        name: 'Container',
                        type: 'layout',
                        if: '{{_global.hasError}}',
                        children: [
                            { name: 'H2', type: 'basic' },
                        ],
                    },
                ],
            },
            {
                name: 'Container',
                type: 'layout',
                if: '{{posts?.data?.board}}',
                props: { className: 'actual-content' },
                children: [
                    { name: 'H1', type: 'basic' },
                    { name: 'P', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        
        const actualContent = status.querySelector('.actual-content');
        expect(actualContent).toBeTruthy();
        
        expect(actualContent!.children.length).toBe(2);
        
        expect(status.querySelector('.h-8.w-48')).toBeFalsy();
    });

    

    it('{{...}} 삼항 표현식과 hidden lg:grid를 함께 처리해야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Div',
                type: 'basic',
                props: {
                    className: "hidden lg:grid {{condition ? 'grid-cols-[60px_1fr_160px]' : 'grid-cols-[60px_1fr]'}} gap-4 px-4",
                },
                children: [
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                    { name: 'Span', type: 'basic' },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const gridDiv = container.querySelector('.grid')!;
        expect(gridDiv).toBeTruthy();
        
        expect((gridDiv as HTMLElement).style.gridTemplateColumns).toBe('60px 1fr 160px');
        expect(gridDiv.className).not.toContain('hidden');

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    

    it('empty state 조건(=== 0)을 부정 조건으로 감지하여 스킵해야 한다', () => {
        
        const components = [
            {
                name: 'Div',
                type: 'basic',
                children: [
                    {
                        name: 'Div',
                        type: 'basic',
                        if: '{{posts?.data?.data?.length === 0}}',
                        children: [
                            { name: 'P', type: 'basic' },
                            { name: 'Button', type: 'basic' },
                        ],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        if: '{{posts?.data?.pagination?.total === 0}}',
                        children: [
                            { name: 'P', type: 'basic' },
                        ],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        if: '{{(query.search || query.category) && posts?.data?.pagination?.total === 0}}',
                        children: [
                            { name: 'P', type: 'basic' },
                            { name: 'Button', type: 'basic' },
                        ],
                    },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        expect(status.children.length).toBe(0);
    });

    

    it('children이 있는 Button은 컨테이너로 처리하여 자식을 렌더해야 한다', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

        const components = [
            {
                name: 'Button',
                type: 'basic',
                props: { className: 'block w-full text-left' },
                children: [
                    {
                        name: 'Div',
                        type: 'basic',
                        props: { className: 'hidden lg:grid gap-4 px-4' },
                        children: [
                            { name: 'Span', type: 'basic' },
                            { name: 'Span', type: 'basic' },
                        ],
                    },
                    {
                        name: 'Div',
                        type: 'basic',
                        props: { className: 'flex flex-col lg:hidden' },
                        children: [
                            { name: 'Span', type: 'basic' },
                        ],
                    },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        const buttonWrapper = status.firstElementChild as HTMLElement;
        expect(buttonWrapper).toBeTruthy();
        
        const gridChild = buttonWrapper.querySelector('.grid');
        expect(gridChild).toBeTruthy();
        expect(gridChild!.children.length).toBe(2);

        Object.defineProperty(window, 'innerWidth', { value: 0, writable: true });
    });

    it('children이 없는 Button은 고정 크기 바로 렌더해야 한다', () => {
        const components = [
            { name: 'Button', type: 'basic' },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={defaultOptions} />
        );

        const status = container.querySelector('[role="status"]')!;
        const btn = status.firstElementChild as HTMLElement;
        expect(btn).toBeTruthy();
        expect(btn.className).toContain('h-9');
        expect(btn.className).toContain('w-24');
    });

    

    it('게시판 목록 레이아웃 구조를 올바르게 반영해야 한다', () => {
        
        const components = [
            {
                name: 'Container',
                type: 'layout',
                children: [
                    
                    {
                        name: 'Div',
                        type: 'basic',
                        if: '{{!posts?.data?.board}}',
                        children: [
                            { name: 'Div', type: 'basic', props: { className: 'h-8 w-48' } },
                        ],
                    },
                    
                    {
                        name: 'Div',
                        type: 'basic',
                        if: '{{_global.hasError}}',
                        children: [
                            { name: 'H2', type: 'basic' },
                        ],
                    },
                    
                    {
                        name: 'Container',
                        type: 'layout',
                        if: '{{posts?.data?.board}}',
                        children: [
                            
                            {
                                name: 'Div',
                                type: 'basic',
                                props: { className: 'flex justify-between items-start mb-6' },
                                children: [
                                    { name: 'H1', type: 'basic' },
                                    { name: 'Button', type: 'basic' },
                                ],
                            },
                            
                            {
                                name: 'Div',
                                type: 'basic',
                                props: { className: 'flex mb-4' },
                                children: [
                                    { name: 'SearchBar', type: 'composite' },
                                ],
                            },
                            
                            {
                                name: 'Div',
                                type: 'basic',
                                children: [
                                    {
                                        name: 'Div',
                                        type: 'basic',
                                        iteration: { source: 'posts?.data?.data', item_var: 'post' },
                                        children: [
                                            { name: 'Span', type: 'basic' },
                                            { name: 'Span', type: 'basic' },
                                            { name: 'Avatar', type: 'composite' },
                                        ],
                                    },
                                ],
                            },
                            
                            { name: 'Pagination', type: 'composite' },
                        ],
                    },
                ],
            },
        ];

        const { container } = render(
            <PageSkeleton components={components} options={{ animation: 'pulse', iteration_count: 3 }} />
        );

        const status = container.querySelector('[role="status"]')!;
        
        
        const h1Bar = status.querySelector('.h-7');
        expect(h1Bar).toBeTruthy();
        
        const searchBar = status.querySelector('.h-9');
        expect(searchBar).toBeTruthy();
        
        const avatars = status.querySelectorAll('.rounded-full');
        expect(avatars.length).toBe(3);
        
        const paginationBtns = status.querySelectorAll('.w-8.h-8');
        expect(paginationBtns.length).toBe(5);
    });
});
