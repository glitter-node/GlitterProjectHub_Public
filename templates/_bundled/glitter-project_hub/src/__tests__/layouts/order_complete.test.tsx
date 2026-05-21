

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createLayoutTest,
  screen,
  waitFor,
} from '@/core/template-engine/__tests__/utils/layoutTestUtils';
import { ComponentRegistry } from '@/core/template-engine/ComponentRegistry';



const TestDiv: React.FC<{
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}> = ({ className, children, 'data-testid': testId }) => (
  <div className={className} data-testid={testId}>{children}</div>
);

const TestSpan: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
  'data-testid'?: string;
}> = ({ className, children, text, 'data-testid': testId }) => (
  <span className={className} data-testid={testId}>{children || text}</span>
);

const TestButton: React.FC<{
  type?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  text?: string;
  onClick?: () => void;
  'data-testid'?: string;
}> = ({ type, className, disabled, children, text, onClick, 'data-testid': testId }) => (
  <button
    type={type as 'button' | 'submit' | 'reset'}
    className={className}
    disabled={disabled}
    onClick={onClick}
    data-testid={testId}
  >
    {children || text}
  </button>
);

const TestH1: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
  'data-testid'?: string;
}> = ({ className, children, text, 'data-testid': testId }) => (
  <h1 className={className} data-testid={testId}>{children || text}</h1>
);

const TestP: React.FC<{
  className?: string;
  children?: React.ReactNode;
  text?: string;
  'data-testid'?: string;
}> = ({ className, children, text, 'data-testid': testId }) => (
  <p className={className} data-testid={testId}>{children || text}</p>
);

const TestIcon: React.FC<{
  name?: string;
  className?: string;
  'data-testid'?: string;
}> = ({ name, className, 'data-testid': testId }) => (
  <i className={className} data-testid={testId} data-icon={name} />
);

const TestImg: React.FC<{
  src?: string;
  alt?: string;
  className?: string;
  'data-testid'?: string;
}> = ({ src, alt, className, 'data-testid': testId }) => (
  <img src={src} alt={alt} className={className} data-testid={testId} />
);



const mockOrderDataCard = {
  data: {
    id: 1,
    order_number: 'ORD-20260205-001',
    status: 'confirmed',
    total_amount: 33000,
    total_amount_formatted: '33,000원',
    subtotal_formatted: '30,000원',
    total_shipping_fee_formatted: '3,000원',
    total_discount: 0,
    payment: {
      payment_method: 'card',
      status: 'completed',
    },
    shipping_address: {
      recipient_name: '김철수',
      recipient_phone: '010-1234-5678',
      country_code: 'KR',
      zipcode: '12345',
      address1: '서울시 강남구 테헤란로 123',
      address2: '101동 1001호',
    },
    options: [
      {
        id: 1,
        product_name: '테스트 상품',
        option_name: '기본 옵션',
        quantity: 2,
        unit_price_formatted: '15,000원',
        subtotal_formatted: '30,000원',
        product_image: '/images/placeholder.png',
      },
    ],
  },
};

const mockOrderDataDbank = {
  data: {
    ...mockOrderDataCard.data,
    payment: {
      payment_method: 'dbank',
      status: 'pending',
      dbank_name: '국민은행',
      dbank_account: '123-456-789012',
      dbank_holder: '주식회사 테스트',
      deposit_due_at: '2026-02-07 23:59:59',
    },
  },
};

const mockOrderDataVbank = {
  data: {
    ...mockOrderDataCard.data,
    payment: {
      payment_method: 'vbank',
      status: 'pending',
      vbank_name: '신한은행',
      vbank_number: '110-123-456789',
      vbank_holder: '홍길동',
      vbank_due_at: '2026-02-07 23:59:59',
    },
  },
};



describe('주문 완료 페이지 레이아웃', () => {
  let testUtils: ReturnType<typeof createLayoutTest>;

  beforeEach(() => {
    const registry = ComponentRegistry.getInstance();
    const Fragment: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
    (registry as any).registry = {
      Fragment: { component: Fragment, metadata: { name: 'Fragment', type: 'layout' } },
      Div: { component: TestDiv, metadata: { name: 'Div', type: 'basic' } },
      Span: { component: TestSpan, metadata: { name: 'Span', type: 'basic' } },
      Button: { component: TestButton, metadata: { name: 'Button', type: 'basic' } },
      H1: { component: TestH1, metadata: { name: 'H1', type: 'basic' } },
      H3: { component: TestH1, metadata: { name: 'H3', type: 'basic' } },
      P: { component: TestP, metadata: { name: 'P', type: 'basic' } },
      Icon: { component: TestIcon, metadata: { name: 'Icon', type: 'basic' } },
      Img: { component: TestImg, metadata: { name: 'Img', type: 'basic' } },
      Container: { component: TestDiv, metadata: { name: 'Container', type: 'layout' } },
    };
  });

  afterEach(() => {
    if (testUtils) {
      testUtils.cleanup();
    }
    vi.clearAllMocks();
  });

  describe('카드 결제 완료', () => {
    it('카드 결제 완료 메시지가 표시되어야 함', async () => {
      const orderCompleteLayout = {
        version: '1.0.0',
        layout_name: 'test/order_complete',
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Div',
            props: { 'data-testid': 'card-complete' },
            if: "{{orderData?.data?.payment?.payment_method === 'card'}}",
            children: [
              {
                type: 'basic',
                name: 'H1',
                props: { 'data-testid': 'card-title' },
                text: '결제가 완료되었습니다',
              },
            ],
          },
        ],
      };

      testUtils = createLayoutTest(orderCompleteLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataCard });
      await testUtils.render();

      await waitFor(() => {
        expect(screen.getByTestId('card-complete')).toBeInTheDocument();
        expect(screen.getByTestId('card-title')).toHaveTextContent('결제가 완료되었습니다');
      });
    });
  });

  describe('무통장입금 안내', () => {
    it('무통장입금 안내가 표시되어야 함', async () => {
      const dbankLayout = {
        version: '1.0.0',
        layout_name: 'test/order_complete_dbank',
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Div',
            props: { 'data-testid': 'dbank-info' },
            if: "{{orderData?.data?.payment?.payment_method === 'dbank'}}",
            children: [
              {
                type: 'basic',
                name: 'Span',
                props: { 'data-testid': 'dbank-name' },
                text: '{{orderData?.data?.payment?.dbank_name}}',
              },
              {
                type: 'basic',
                name: 'Span',
                props: { 'data-testid': 'dbank-account' },
                text: '{{orderData?.data?.payment?.dbank_account}}',
              },
            ],
          },
        ],
      };

      testUtils = createLayoutTest(dbankLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataDbank });
      await testUtils.render();

      await waitFor(() => {
        expect(screen.getByTestId('dbank-info')).toBeInTheDocument();
        expect(screen.getByTestId('dbank-name')).toHaveTextContent('국민은행');
        expect(screen.getByTestId('dbank-account')).toHaveTextContent('123-456-789012');
      });
    });
  });

  describe('가상계좌 안내', () => {
    it('가상계좌 정보가 표시되어야 함', async () => {
      const vbankLayout = {
        version: '1.0.0',
        layout_name: 'test/order_complete_vbank',
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Div',
            props: { 'data-testid': 'vbank-info' },
            if: "{{orderData?.data?.payment?.payment_method === 'vbank'}}",
            children: [
              {
                type: 'basic',
                name: 'Span',
                props: { 'data-testid': 'vbank-name' },
                text: '{{orderData?.data?.payment?.vbank_name}}',
              },
              {
                type: 'basic',
                name: 'Span',
                props: { 'data-testid': 'vbank-number' },
                text: '{{orderData?.data?.payment?.vbank_number}}',
              },
            ],
          },
        ],
      };

      testUtils = createLayoutTest(vbankLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataVbank });
      await testUtils.render();

      await waitFor(() => {
        expect(screen.getByTestId('vbank-info')).toBeInTheDocument();
        expect(screen.getByTestId('vbank-name')).toHaveTextContent('신한은행');
        expect(screen.getByTestId('vbank-number')).toHaveTextContent('110-123-456789');
      });
    });
  });

  describe('배송지 저장 버튼', () => {
    it('로그인 사용자에게 배송지 저장 버튼이 표시되어야 함', async () => {
      const saveAddressLayout = {
        version: '1.0.0',
        layout_name: 'test/order_complete_save_address',
        state: {
          _global: {
            auth: {
              isLoggedIn: true,
            },
          },
        },
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Button',
            props: { 'data-testid': 'save-address-btn' },
            if: '{{_global.auth?.isLoggedIn}}',
            text: '이 배송지를 저장하기',
          },
        ],
      };

      testUtils = createLayoutTest(saveAddressLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataCard });
      testUtils.setState('auth', { isLoggedIn: true }, 'global');
      await testUtils.render();

      await waitFor(() => {
        expect(screen.getByTestId('save-address-btn')).toBeInTheDocument();
        expect(screen.getByTestId('save-address-btn')).toHaveTextContent('이 배송지를 저장하기');
      });
    });

    it('비로그인 사용자에게 배송지 저장 버튼이 숨겨져야 함', async () => {
      const saveAddressLayout = {
        version: '1.0.0',
        layout_name: 'test/order_complete_guest',
        state: {
          _global: {
            auth: {
              isLoggedIn: false,
            },
          },
        },
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Button',
            props: { 'data-testid': 'save-address-btn' },
            if: '{{_global.auth?.isLoggedIn}}',
            text: '이 배송지를 저장하기',
          },
        ],
      };

      testUtils = createLayoutTest(saveAddressLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataCard });
      testUtils.setState('auth', { isLoggedIn: false }, 'global');
      await testUtils.render();

      
      expect(screen.queryByTestId('save-address-btn')).not.toBeInTheDocument();
    });
  });

  describe('주문 상품 목록', () => {
    it('주문 상품이 표시되어야 함', async () => {
      const orderItemsLayout = {
        version: '1.0.0',
        layout_name: 'test/order_items',
        data_sources: [
          {
            id: 'orderData',
            type: 'api',
            endpoint: '/api/test/order',
            method: 'GET',
            auto_fetch: true,
          },
        ],
        components: [
          {
            type: 'basic',
            name: 'Div',
            props: { 'data-testid': 'order-items' },
            children: [
              {
                type: 'basic',
                name: 'Div',
                iteration: {
                  source: '{{orderData?.data?.options ?? []}}',
                  item_var: 'item',
                  index_var: 'idx',
                },
                children: [
                  {
                    type: 'basic',
                    name: 'P',
                    props: { 'data-testid': 'product-name' },
                    text: '{{item.product_name}}',
                  },
                ],
              },
            ],
          },
        ],
      };

      testUtils = createLayoutTest(orderItemsLayout);
      testUtils.mockApi('orderData', { response: mockOrderDataCard });
      await testUtils.render();

      await waitFor(() => {
        expect(screen.getByTestId('order-items')).toBeInTheDocument();
        expect(screen.getByTestId('product-name')).toHaveTextContent('테스트 상품');
      });
    });
  });
});
