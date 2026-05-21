import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const templateRoot = path.resolve(__dirname, '..', '..');
const commerceModule = ['sirsoft', 'ecommerce'].join('-');
const routeBaseToken = ['shop', 'Base'].join('');
const cartHeaderToken = ['X', 'Cart', 'Key'].join('-');
const cartInitToken = ['init', 'Cart', 'Key'].join('');
const currencyStorageToken = ['g7', 'preferred', 'currency'].join('_');

function readText(relativePath: string): string {
  return readFileSync(path.join(templateRoot, relativePath), 'utf-8');
}

function readJson(relativePath: string) {
  return JSON.parse(readText(relativePath));
}

describe('glitter-project_hub community-only template', () => {
  it('keeps the glitter-project_hub identifier while positioning metadata as a Glitter Project Hub platform interface', () => {
    const manifest = readJson('template.json');

    expect(manifest.identifier).toBe('glitter-project_hub');
    expect(manifest.vendor).toBe('Glitter.kr');
    expect(manifest.author.name).toBe('Glitter.kr');
    expect(manifest.name.ko).toBe('글리터 프로젝트 허브');
    expect(manifest.name.en).toBe('Glitter Project Hub');
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.description.ko).toContain('프로젝트 생태계');
    expect(manifest.description.ko).toContain('인프라 협업');
    expect(manifest.description.en).toContain('project ecosystems');
    expect(manifest.description.en).toContain('infrastructure collaboration');
    expect(JSON.stringify(manifest)).not.toContain('SirSoft');
    expect(JSON.stringify(manifest)).not.toContain('sir.kr');
  });

  it('removes ecommerce dependencies and routes from active template JSON', () => {
    const manifest = readJson('template.json');
    const routes = readJson('routes.json');
    const routePaths = routes.routes.map((route: { path: string }) => route.path);

    expect(manifest.dependencies.modules[commerceModule]).toBeUndefined();
    expect(routePaths).not.toContain('/mypage/orders');
    expect(routePaths).not.toContain('/mypage/orders/:order_number');
    expect(routePaths).not.toContain('/mypage/wishlist');
    expect(routePaths).not.toContain('/mypage/addresses');
    expect(routePaths).not.toContain('/mypage/inquiries');
    expect(routePaths.some((routePath: string) => routePath.includes(commerceModule))).toBe(false);
    expect(routePaths).toContain('/popular');
    expect(routes.routes.find((route: { path: string }) => route.path === '/popular')?.redirect).toBe('/boards/popular');
  });

  it('keeps the community template language manifest free of shop translations', () => {
    const ko = readJson('lang/ko.json');
    const en = readJson('lang/en.json');
    const navKo = readJson('lang/partial/ko/nav.json');
    const navEn = readJson('lang/partial/en/nav.json');
    const mypageKo = readJson('lang/partial/ko/mypage.json');
    const mypageEn = readJson('lang/partial/en/mypage.json');

    expect(ko.shop).toBeUndefined();
    expect(en.shop).toBeUndefined();
    expect(navKo.shop).toBeUndefined();
    expect(navEn.shop).toBeUndefined();
    expect(navKo.cart).toBeUndefined();
    expect(navEn.cart).toBeUndefined();
    expect(mypageKo.inquiries).toBeUndefined();
    expect(mypageEn.inquiries).toBeUndefined();
  });

  it('keeps the compatibility policy page generic and host neutral', () => {
    const ko = readText('lang/partial/ko/policy.json');
    const en = readText('lang/partial/en/policy.json');
    const layout = readText('layouts/page/policy.json');
    const routes = readJson('routes.json');
    const refundRouteIndex = routes.routes.findIndex((route: { path: string }) => route.path === '/page/refund');
    const genericPageRouteIndex = routes.routes.findIndex((route: { path: string }) => route.path === '/page/:slug');

    expect(ko).toContain('커뮤니티 정책');
    expect(en).toContain('Community Policy');
    expect(ko).not.toContain('sir.kr');
    expect(en).not.toContain('sir.kr');
    expect(layout).toContain('$t:policy.title');
    expect(layout).toContain('$t:policy.introduction.title');
    expect(layout).toContain('$t:policy.rules.items.0');
    expect(layout).toContain('$t:policy.prohibited.items.0');
    expect(layout).toContain('$t:policy.enforcement.body');
    expect(layout).not.toContain('/api/modules/sirsoft-page');
    expect(layout).not.toContain('page?.data');
    expect(refundRouteIndex).toBeGreaterThanOrEqual(0);
    expect(genericPageRouteIndex).toBeGreaterThanOrEqual(0);
    expect(refundRouteIndex).toBeLessThan(genericPageRouteIndex);
    expect(routes.routes[refundRouteIndex].layout).toBe('page/policy');
  });

  it('removes ecommerce wiring from the base, home, and search layouts', () => {
    const userBase = readText('layouts/_user_base.json');
    const home = readText('layouts/home.json');
    const search = readText('layouts/search/index.json');
    const searchTabs = readText('layouts/partials/search/_search_tabs.json');
    const searchFilters = readText('layouts/partials/search/_search_filters.json');
    const searchResults = readText('layouts/partials/search/_search_results.json');

    expect(userBase).not.toContain(commerceModule);
    expect(userBase).not.toContain(routeBaseToken);
    expect(userBase).not.toContain(cartHeaderToken);
    expect(userBase).not.toContain(cartInitToken);
    expect(userBase).not.toContain(currencyStorageToken);
    expect(userBase).not.toContain('/mypage/orders');
    expect(userBase).not.toContain('/mypage/wishlist');

    expect(home).not.toContain('partials/home/_shop_promo.json');

    expect(search).not.toContain(commerceModule);
    expect(searchTabs).not.toContain('search.tabs.products');
    expect(searchFilters).not.toContain("searchActiveTab === 'products'");
    expect(searchResults).not.toContain('partials/search/products/_section.json');
    expect(searchResults).not.toContain('search.empty.products');
  });

  it('removes desktop ecommerce navigation from the header component source', () => {
    const header = readText('src/components/composite/Header.tsx');
    const mobileNav = readText('src/components/composite/MobileNav.tsx');

    expect(header).not.toContain("navigate('/mypage/orders')");
    expect(header).not.toContain("navigate('/mypage/wishlist')");
    expect(header).not.toContain(`navigate(\`\${${routeBaseToken}}/cart\`)`);
    expect(header).not.toContain("t('nav.shop')");
    expect(header).not.toContain('cartCount > 0');
    expect(header).toContain("navigate('/boards')");
    expect(header).toContain("t('nav.all_boards')");

    expect(mobileNav).not.toContain("navigate('/shop')");
    expect(mobileNav).not.toContain("navigate('/cart')");
    expect(mobileNav).not.toContain("t('nav.shop')");
    expect(mobileNav).not.toContain("t('nav.cart')");
    expect(mobileNav).not.toContain('cartCount');
  });

  it('keeps global navigation focused on primary community destinations', () => {
    const header = readText('src/components/composite/Header.tsx');
    const userBase = readText('layouts/_user_base.json');
    const seoConfig = readText('seo-config.json');

    expect(header).toContain("navigate('/boards')");
    expect(header).toContain("navigate('/popular')");
    expect(header).toContain("navigate(`/board/${qnaBoard?.slug ?? 'qna'}`)");
    expect(header).toContain("t('nav.all_boards')");
    expect(header).toContain("t('nav.popular')");
    expect(header).toContain("t('nav.qna')");
    expect(header).toContain("boards.filter((board) => board.slug !== 'qna')");
    expect(header).not.toContain('visibleBoards.map');
    expect(header).not.toContain('boards.slice(0, maxVisibleBoards)');
    expect(header).not.toContain('style={{ top:');

    const mobileNav = readText('src/components/composite/MobileNav.tsx');
    expect(mobileNav).toContain("navigate('/boards')");
    expect(mobileNav).toContain("navigate('/popular')");
    expect(mobileNav).toContain("navigate(`/board/${qnaBoard?.slug ?? 'qna'}`)");
    expect(mobileNav).toContain("t('nav.all_boards')");
    expect(mobileNav).toContain("t('nav.popular')");
    expect(mobileNav).toContain("t('nav.qna')");
    expect(mobileNav).toContain("t('nav.more')");
    expect(mobileNav).toContain("boards.filter((board) => board.slug !== 'qna')");
    expect(mobileNav).not.toContain("navigate('/boards/popular')");

    expect(userBase).toContain('"path": "/boards"');
    expect(userBase).toContain('"path": "/popular"');
    expect(userBase).toContain('"path": "/board/qna"');
    expect(userBase).toContain('$t:nav.all_boards');
    expect(userBase).toContain('$t:nav.popular');
    expect(userBase).toContain('$t:nav.qna');
    expect(userBase).toContain('$t:nav.more');
    expect(userBase).not.toContain('$t:user.nav.all_boards');
    expect(userBase).not.toContain('$t:user.nav.qna');
    expect(userBase).not.toContain('$t:user.nav.more');
    expect(userBase).toContain("board.slug !== 'qna'");

    expect(seoConfig).toContain('"href": "/boards"');
    expect(seoConfig).toContain('"href": "/boards/popular"');
    expect(seoConfig).toContain('"href": "/board/qna"');
    expect(seoConfig).not.toContain('"iterate": "boards"');
  });

  it('removes mypage translation keys for orders, wishlist, and addresses', () => {
    const mypageKo = readText('lang/partial/ko/mypage.json');
    const mypageEn = readText('lang/partial/en/mypage.json');
    const userKo = readText('lang/partial/ko/user.json');
    const userEn = readText('lang/partial/en/user.json');

    expect(mypageKo).not.toContain('"orders_title"');
    expect(mypageKo).not.toContain('"wishlist_title"');
    expect(mypageKo).not.toContain('"addresses_title"');
    expect(mypageKo).not.toContain('"warning_orders"');
    expect(mypageKo).not.toContain('"inquiries_title"');
    expect(mypageKo).not.toContain('"inquiries"');

    expect(mypageEn).not.toContain('"orders_title"');
    expect(mypageEn).not.toContain('"wishlist_title"');
    expect(mypageEn).not.toContain('"addresses_title"');
    expect(mypageEn).not.toContain('"warning_orders"');
    expect(mypageEn).not.toContain('"inquiries_title"');
    expect(mypageEn).not.toContain('"inquiries"');

    expect(userKo).not.toContain('"orders_title"');
    expect(userKo).not.toContain('"wishlist_title"');
    expect(userKo).not.toContain('"addresses_title"');
    expect(userKo).not.toContain('"inquiries_title"');
    expect(userEn).not.toContain('"orders_title"');
    expect(userEn).not.toContain('"wishlist_title"');
    expect(userEn).not.toContain('"addresses_title"');
    expect(userEn).not.toContain('"inquiries_title"');
  });

  it('keeps search translations focused on community content', () => {
    const searchKo = readText('lang/partial/ko/search.json');
    const searchEn = readText('lang/partial/en/search.json');

    expect(searchKo).not.toContain('"products"');
    expect(searchKo).not.toContain('"products_in_all"');
    expect(searchKo).not.toContain('"price_asc"');
    expect(searchKo).not.toContain('"price_desc"');
    expect(searchKo).not.toContain('상품');

    expect(searchEn).not.toContain('"products"');
    expect(searchEn).not.toContain('"products_in_all"');
    expect(searchEn).not.toContain('"price_asc"');
    expect(searchEn).not.toContain('"price_desc"');
    expect(searchEn).not.toContain('products');
  });
});
