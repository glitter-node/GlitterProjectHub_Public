import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TranslationEngine, type TranslationContext } from '@/core/template-engine/TranslationEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.resolve(__dirname, '..', '..', '..');

function readText(relativePath: string): string {
  return readFileSync(path.join(templateRoot, relativePath), 'utf-8');
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

function loadDictionary(locale: 'ko' | 'en') {
  const manifest = readJson<Record<string, any>>(`lang/${locale}.json`);

  return Object.fromEntries(
    Object.entries(manifest).map(([key, value]) => {
      if (value && typeof value === 'object' && typeof value.$partial === 'string') {
        return [key, readJson(`lang/${value.$partial}`)];
      }

      return [key, value];
    })
  );
}

describe('home layout i18n enforcement', () => {
  const koContext: TranslationContext = {
    templateId: 'glitter-project_hub',
    locale: 'ko',
  };

  const enContext: TranslationContext = {
    templateId: 'glitter-project_hub',
    locale: 'en',
  };

  beforeEach(() => {
    TranslationEngine.resetInstance();
    const engine = TranslationEngine.getInstance();
    (engine as any).translations.set('glitter-project_hub:ko', loadDictionary('ko'));
    (engine as any).translations.set('glitter-project_hub:en', loadDictionary('en'));
  });

  it('uses translation keys instead of hardcoded homepage text in touched partials', () => {
    const welcomeCard = readText('layouts/partials/home/_welcome_card.json');
    const communityNoticePanel = readText('layouts/partials/home/_community_notice_panel.json');
    const noticePosts = readText('layouts/partials/home/_notice_posts.json');
    const startPost = readText('layouts/partials/home/_start_post.json');
    const communityHub = readText('layouts/partials/home/_community_hub.json');
    const liveActivity = readText('layouts/partials/home/_live_activity.json');
    const boardDiscovery = readText('layouts/partials/home/_board_discovery.json');
    const communityGuide = readText('layouts/partials/home/_community_guide.json');
    const recentPosts = readText('layouts/partials/home/_recent_posts.json');
    const popularBoards = readText('layouts/partials/home/_popular_boards.json');
    const homeLayout = readText('layouts/home.json');

    expect(welcomeCard).toContain('$t:home.hero_title');
    expect(welcomeCard).toContain('$t:home.smart_cta.guest_message');
    expect(welcomeCard).toContain('$t:home.smart_cta.new_member_message');
    expect(welcomeCard).toContain('$t:home.smart_cta.active_member_message');
    expect(welcomeCard).not.toContain('Sir Soft Community');
    expect(welcomeCard).not.toContain('"text": "Ask questions after logging in."');
    expect(welcomeCard).not.toContain('"text": "로그인 후 질문을 남길 수 있습니다."');
    expect(welcomeCard).not.toContain('{{_global.settings?.general?.site_name}}$t:home.hero_title_suffix');

    expect(homeLayout).toContain('partials/home/_activity_compact.json');
    expect(homeLayout).not.toContain('partials/home/_notice_posts.json');
    expect(homeLayout).toContain('partials/home/_discovery_grid.json');
    expect(homeLayout).toContain('partials/home/_archive_highlights.json');
    expect(homeLayout).toContain('partials/home/_recommended_spaces.json');
    expect(homeLayout).toContain('partials/home/_community_entry_strip.json');
    expect(homeLayout).not.toContain('partials/home/_board_summary.json');
    expect(homeLayout).not.toContain('"id": "home_boards"');

    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.title');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.description');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.view_notices');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.empty_title');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.guidance_1');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.guidance_2');
    expect(communityNoticePanel).toContain('$t:home.community_notice_panel.guidance_3');
    expect(communityNoticePanel).toContain('$t:home.space_labels.notice');
    expect(communityNoticePanel).toContain('$t:board.new_badge');
    expect(communityNoticePanel).toContain('/board/notice');
    expect(communityNoticePanel).not.toContain('"text": "Community Notices"');
    expect(communityNoticePanel).not.toContain('"text": "커뮤니티 공지"');

    expect(noticePosts).toContain('$t:home.notice_posts');
    expect(noticePosts).toContain('$t:home.space_labels.notice');
    expect(noticePosts).toContain('$t:board.new_badge');
    expect(noticePosts).not.toContain('"text": "N"');

    expect(startPost).toContain('$t:home.start_post_title');
    expect(startPost).toContain('$t:home.start_post_description');
    expect(startPost).toContain('$t:home.space_labels.free');
    expect(startPost).toContain('$t:home.space_labels.qna');
    expect(startPost).toContain('$t:home.start_post_free_description');
    expect(startPost).toContain('$t:home.start_post_qna_description');
    expect(startPost).not.toContain('$t:boards.notice');
    expect(startPost).not.toContain('/board/notice/write');

    expect(recentPosts).toContain('$t:board.new_badge');
    expect(recentPosts).toContain('$t:home.comment_count_badge|count={{post?.comment_count ?? 0}}');
    expect(recentPosts).not.toContain('"text": "N"');
    expect(recentPosts).not.toContain('"text": "[{{post.comment_count}}]"');
    expect(recentPosts).toContain('$t:home.space_labels.notice');
    expect(recentPosts).toContain('$t:home.space_labels.free');
    expect(recentPosts).toContain('$t:home.space_labels.qna');
    expect(recentPosts).toContain('$t:home.space_labels.resources');
    expect(recentPosts).toContain('$t:home.space_labels.introductions');
    expect(recentPosts).toContain('$t:home.space_labels.support');
    expect(popularBoards).toContain('$t:home.space_labels.notice');
    expect(popularBoards).toContain('$t:home.space_labels.free');
    expect(popularBoards).toContain('$t:home.space_labels.qna');
    expect(popularBoards).toContain('$t:home.space_labels.resources');
    expect(popularBoards).toContain('$t:home.space_labels.introductions');
    expect(popularBoards).toContain('$t:home.space_labels.support');

    expect(communityHub).toContain('$t:home.community_hub.title');
    expect(communityHub).toContain('$t:home.community_hub.recent_activity');
    expect(communityHub).toContain('$t:home.community_hub.board_shortcuts');
    expect(communityHub).toContain('$t:home.community_hub.qna_title');
    expect(communityHub).toContain('$t:home.community_hub.first_run_title');
    expect(communityHub).toContain('$t:home.space_labels.free');
    expect(communityHub).not.toContain('"text": "Community Hub"');
    expect(communityHub).not.toContain('"text": "커뮤니티 허브"');

    expect(liveActivity).toContain('$t:home.live_activity.title');
    expect(liveActivity).toContain('$t:home.live_activity.new_post');
    expect(liveActivity).toContain('$t:home.live_activity.new_comment');
    expect(liveActivity).toContain('$t:home.live_activity.empty_title');
    expect(liveActivity).not.toContain('"text": "Live Activity"');
    expect(liveActivity).not.toContain('"text": "실시간 활동"');

    expect(boardDiscovery).toContain('$t:home.board_discovery.title');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_notice');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_free');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_qna');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_resources');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_introductions');
    expect(boardDiscovery).toContain('$t:home.board_discovery.purpose_support');
    expect(boardDiscovery).toContain('$t:home.board_discovery.empty_title');
    expect(boardDiscovery).toContain('$t:home.space_labels.notice');
    expect(boardDiscovery).toContain('$t:home.space_labels.free');
    expect(boardDiscovery).toContain('$t:home.space_labels.qna');
    expect(boardDiscovery).toContain('$t:home.space_labels.resources');
    expect(boardDiscovery).toContain('$t:home.space_labels.introductions');
    expect(boardDiscovery).toContain('$t:home.space_labels.support');
    expect(boardDiscovery).not.toContain('"text": "Board Discovery"');
    expect(boardDiscovery).not.toContain('"text": "게시판 탐색"');

    expect(communityGuide).toContain('$t:home.guide_bullet');
    expect(communityGuide).not.toContain('"text": "•"');
  });

  it('loads starter board names from the template language manifest', () => {
    const koManifest = readJson<Record<string, any>>('lang/ko.json');
    const enManifest = readJson<Record<string, any>>('lang/en.json');

    expect(koManifest.boards?.$partial).toBe('partial/ko/boards.json');
    expect(enManifest.boards?.$partial).toBe('partial/en/boards.json');
  });

  it('uses Button variant and size props for the primary hero CTA', () => {
    const welcomeCard = readJson<any>('layouts/partials/home/_welcome_card.json');
    const findButton = (node: any): any => {
      if (!node || typeof node !== 'object') {
        return null;
      }
      if (node.name === 'Button') {
        return node;
      }
      for (const child of node.children ?? []) {
        const found = findButton(child);
        if (found) {
          return found;
        }
      }
      return null;
    };
    const cta = findButton(welcomeCard);

    expect(cta.name).toBe('Button');
    expect(cta.props.variant).toBe('primary');
    expect(cta.props.size).toBe('md');
    expect(cta.props.className).toBe('gap-2 cursor-pointer self-start');
    expect(cta.props.className).not.toContain('btn-primary-bg');
    expect(cta.props.className).not.toMatch(/\bbg-amber-/);
    expect(cta.props.className).not.toMatch(/\btext-amber-/);
    expect(cta.props.className).not.toMatch(/\bborder-amber-/);
  });

  it('uses board-specific write actions from the homepage start-post choices', () => {
    const startPost = readJson<any>('layouts/partials/home/_start_post.json');
    const choices = startPost.children[0].children[1].children;
    const [qnaChoice, freeChoice] = choices;

    expect(choices).toHaveLength(2);
    expect(qnaChoice.props.variant).toBe('primary');
    expect(qnaChoice.props.className).toContain('bg-sky-600');
    expect(freeChoice.props.variant).toBe('secondary');
    expect(freeChoice.props.className).toContain('bg-white');

    expect(qnaChoice.actions[0].handler).toBe('switch');
    expect(qnaChoice.actions[0].params.value).toBe("{{_global.currentUser?.uuid ? 'authenticated' : 'guest'}}");
    expect(qnaChoice.actions[0].cases.authenticated.params.path).toBe('/board/qna/write');
    expect(qnaChoice.actions[0].cases.guest.params.path).toBe('/login');
    expect(qnaChoice.actions[0].cases.guest.params.query.redirect).toBe('/board/qna/write');

    expect(freeChoice.actions[0].handler).toBe('switch');
    expect(freeChoice.actions[0].params.value).toBe("{{_global.currentUser?.uuid ? 'authenticated' : 'guest'}}");
    expect(freeChoice.actions[0].cases.authenticated.params.path).toBe('/board/free/write');
    expect(freeChoice.actions[0].cases.guest.params.path).toBe('/login');
    expect(freeChoice.actions[0].cases.guest.params.query.redirect).toBe('/board/free/write');
  });

  it('renders homepage text correctly in Korean mode', () => {
    const engine = TranslationEngine.getInstance();

    expect(engine.translate('home.hero_title', koContext)).toBe('글리터 프로젝트 허브');
    expect(engine.translate('home.hero_readiness', koContext)).toBe('논의, 질문, 지원, 업데이트가 준비되어 있습니다.');
    expect(engine.translate('home.seo_title', koContext)).toBe('글리터 프로젝트 허브');
    expect(engine.translate('home.seo_description', koContext)).toBe('Glitter Project Hub는 프로젝트 작업, 지식 공유, 커뮤니티 지원, 장기 아카이브를 위한 차분한 협업 허브입니다.');
    expect(engine.translate('home.notice_posts', koContext)).toBe('운영 업데이트');
    expect(engine.translate('home.community_notice_panel.title', koContext)).toBe('운영 업데이트');
    expect(engine.translate('home.community_notice_panel.description', koContext)).toBe('기준, 변경 사항, 공지 사항을 정리합니다.');
    expect(engine.translate('home.community_notice_panel.view_notices', koContext)).toBe('운영 업데이트 보기');
    expect(engine.translate('home.community_notice_panel.empty_title', koContext)).toBe('업데이트 대기 중');
    expect(engine.translate('home.community_notice_panel.guidance_1', koContext)).toBe('기준과 공지를 이곳에 게시합니다.');
    expect(engine.translate('home.start_post_title', koContext)).toBe('다음 기록 남기기');
    expect(engine.translate('home.start_post_free_description', koContext)).toBe('가벼운 공유와 자유로운 논의를 이어갑니다.');
    expect(engine.translate('home.start_post_qna_description', koContext)).toBe('질문과 상황 설명을 남겨 다음 답변으로 연결합니다.');
    expect(engine.translate('home.recent_posts_empty_title', koContext)).toBe('아직 활동이 없습니다');
    expect(engine.translate('home.popular_boards_empty_title', koContext)).toBe('아직 순위가 없습니다');
    expect(engine.translate('home.empty_browse_boards', koContext)).toBe('공간 목록 보기');
    expect(engine.translate('home.community_hub.title', koContext)).toBe('다음 단계');
    expect(engine.translate('home.community_hub.recent_activity', koContext)).toBe('최근 활동');
    expect(engine.translate('home.community_hub.qna_title', koContext)).toBe('답변이 필요하신가요?');
    expect(engine.translate('home.community_hub.first_run_title', koContext)).toBe('첫 방문 준비 완료');
    expect(engine.translate('home.smart_cta.guest_message', koContext)).toBe('로그인 후 질문을 남길 수 있습니다.');
    expect(engine.translate('home.smart_cta.new_member_button', koContext)).toBe('질문 남기기');
    expect(engine.translate('home.smart_cta.active_member_button', koContext)).toBe('활동 이어가기');
    expect(engine.translate('home.live_activity.title', koContext)).toBe('활동 스트림');
    expect(engine.translate('home.live_activity.new_post', koContext)).toBe('새 기록');
    expect(engine.translate('home.live_activity.new_comment', koContext)).toBe('댓글 활동');
    expect(engine.translate('home.board_discovery.title', koContext)).toBe('공간');
    expect(engine.translate('home.board_discovery.purpose_qna', koContext)).toBe('질문, 답변, 추가 도움.');
    expect(engine.translate('home.board_discovery.purpose_resources', koContext)).toBe('자료, 링크, 문서를 축적하는 아카이브입니다.');
    expect(engine.translate('home.board_discovery.purpose_introductions', koContext)).toBe('새 구성원의 인사와 연결.');
    expect(engine.translate('home.board_discovery.purpose_support', koContext)).toBe('검토가 필요한 도움과 문제 상황.');
    expect(engine.translate('home.board_discovery.empty_title', koContext)).toBe('공간 준비됨');
    expect(engine.translate('home.comment_count_badge', koContext, '|count=12')).toBe('[12]');
    expect(engine.translate('home.guide_bullet', koContext)).toBe('•');
    expect(engine.translate('board.new_badge', koContext)).toBe('NEW');
    expect(engine.translate('boards.notice', koContext)).toBe('운영 업데이트');
    expect(engine.translate('boards.free', koContext)).toBe('자유 논의');
    expect(engine.translate('boards.qna', koContext)).toBe('질문 공간');
    expect(engine.translate('boards.resources', koContext)).toBe('자료 아카이브');
    expect(engine.translate('boards.introductions', koContext)).toBe('소개 및 연결');
    expect(engine.translate('boards.support', koContext)).toBe('도움 공간');
    expect(engine.translate('boards.notice', koContext)).not.toBe('boards.notice');
    expect(engine.translate('boards.free', koContext)).not.toBe('boards.free');
    expect(engine.translate('boards.qna', koContext)).not.toBe('boards.qna');
  });

  it('renders homepage text correctly in English mode', () => {
    const engine = TranslationEngine.getInstance();

    expect(engine.translate('home.hero_title', enContext)).toBe('Glitter Project Hub');
    expect(engine.translate('home.hero_readiness', enContext)).toBe('Discussion, questions, support, and updates are ready.');
    expect(engine.translate('home.seo_title', enContext)).toBe('Glitter Project Hub');
    expect(engine.translate('home.seo_description', enContext)).toBe('Glitter Project Hub is a calm collaboration hub for project work, knowledge sharing, community support, and durable archives.');
    expect(engine.translate('home.notice_posts', enContext)).toBe('Operational Updates');
    expect(engine.translate('home.community_notice_panel.title', enContext)).toBe('Operational Updates');
    expect(engine.translate('home.community_notice_panel.description', enContext)).toBe('Standards, changes, and shared updates.');
    expect(engine.translate('home.community_notice_panel.view_notices', enContext)).toBe('View operational updates');
    expect(engine.translate('home.community_notice_panel.empty_title', enContext)).toBe('Ready for updates');
    expect(engine.translate('home.community_notice_panel.guidance_1', enContext)).toBe('Publish standards and notices here.');
    expect(engine.translate('home.start_post_title', enContext)).toBe('Add the next record');
    expect(engine.translate('home.start_post_free_description', enContext)).toBe('Continue open discussion and lightweight sharing.');
    expect(engine.translate('home.start_post_qna_description', enContext)).toBe('Leave questions and context so the next answer can connect.');
    expect(engine.translate('home.recent_posts_empty_title', enContext)).toBe('No activity yet');
    expect(engine.translate('home.popular_boards_empty_title', enContext)).toBe('No ranking yet');
    expect(engine.translate('home.empty_browse_boards', enContext)).toBe('View space list');
    expect(engine.translate('home.community_hub.title', enContext)).toBe('Next Steps');
    expect(engine.translate('home.community_hub.recent_activity', enContext)).toBe('Recent activity');
    expect(engine.translate('home.community_hub.qna_title', enContext)).toBe('Need an answer?');
    expect(engine.translate('home.community_hub.first_run_title', enContext)).toBe('Ready for first visitors');
    expect(engine.translate('home.smart_cta.guest_message', enContext)).toBe('Ask questions after logging in.');
    expect(engine.translate('home.smart_cta.new_member_button', enContext)).toBe('Ask a question');
    expect(engine.translate('home.smart_cta.active_member_button', enContext)).toBe('Continue activity');
    expect(engine.translate('home.live_activity.title', enContext)).toBe('Activity Stream');
    expect(engine.translate('home.live_activity.new_post', enContext)).toBe('new record in');
    expect(engine.translate('home.live_activity.new_comment', enContext)).toBe('commented in');
    expect(engine.translate('home.board_discovery.title', enContext)).toBe('Spaces');
    expect(engine.translate('home.board_discovery.purpose_qna', enContext)).toBe('Questions, answers, and follow-up help.');
    expect(engine.translate('home.board_discovery.purpose_resources', enContext)).toBe('Files, links, and references accumulate here.');
    expect(engine.translate('home.board_discovery.purpose_introductions', enContext)).toBe('New member introductions and connections.');
    expect(engine.translate('home.board_discovery.purpose_support', enContext)).toBe('Issues and help requests that need review.');
    expect(engine.translate('home.board_discovery.empty_title', enContext)).toBe('Spaces are ready');
    expect(engine.translate('home.comment_count_badge', enContext, '|count=12')).toBe('[12]');
    expect(engine.translate('home.guide_bullet', enContext)).toBe('•');
    expect(engine.translate('board.new_badge', enContext)).toBe('NEW');
    expect(engine.translate('boards.notice', enContext)).toBe('Operational Updates');
    expect(engine.translate('boards.free', enContext)).toBe('Open Discussion');
    expect(engine.translate('boards.qna', enContext)).toBe('Questions');
    expect(engine.translate('boards.resources', enContext)).toBe('Resource Archive');
    expect(engine.translate('boards.introductions', enContext)).toBe('Introductions & Connections');
    expect(engine.translate('boards.support', enContext)).toBe('Support Space');
    expect(engine.translate('boards.notice', enContext)).not.toBe('boards.notice');
    expect(engine.translate('boards.free', enContext)).not.toBe('boards.free');
    expect(engine.translate('boards.qna', enContext)).not.toBe('boards.qna');
  });

  it('changes homepage hero text when the locale changes', () => {
    const engine = TranslationEngine.getInstance();

    const korean = engine.translate('home.hero_description', koContext);
    const english = engine.translate('home.hero_description', enContext);

    expect(korean).toBe('업데이트, 질문, 자료, 논의를 한곳에서 정리합니다.');
    expect(english).toBe('Project updates, questions, resources, and discussions stay organized in one shared place.');
    expect(korean).not.toBe(english);
  });

  it('renders the community policy page text from template i18n only', () => {
    const engine = TranslationEngine.getInstance();
    const layout = readText('layouts/page/policy.json');

    expect(layout).toContain('$t:policy.title');
    expect(layout).toContain('$t:policy.introduction.body');
    expect(layout).toContain('$t:policy.rules.items.0');
    expect(layout).toContain('$t:policy.prohibited.items.0');
    expect(layout).toContain('$t:policy.enforcement.body');
    expect(layout).not.toContain('/api/modules/sirsoft-page');
    expect(layout).not.toContain('page?.data');

    expect(engine.translate('policy.title', koContext)).toBe('커뮤니티 정책');
    expect(engine.translate('policy.introduction.title', koContext)).toBe('소개');
    expect(engine.translate('policy.rules.title', koContext)).toBe('이용 규칙');
    expect(engine.translate('policy.rules.items.0', koContext)).toBe('기록과 댓글은 해당 공간의 주제와 목적에 맞게 작성합니다.');
    expect(engine.translate('policy.prohibited.title', koContext)).toBe('금지 행위');
    expect(engine.translate('policy.enforcement.title', koContext)).toBe('신고 및 운영 조치');

    expect(engine.translate('policy.title', enContext)).toBe('Community Policy');
    expect(engine.translate('policy.introduction.title', enContext)).toBe('Introduction');
    expect(engine.translate('policy.rules.title', enContext)).toBe('Usage Rules');
    expect(engine.translate('policy.rules.items.0', enContext)).toBe('Write records and comments in the space that best matches the topic and purpose.');
    expect(engine.translate('policy.prohibited.title', enContext)).toBe('Prohibited Behavior');
    expect(engine.translate('policy.enforcement.title', enContext)).toBe('Reporting and Enforcement');
    expect(engine.translate('policy.title', koContext)).not.toBe(engine.translate('policy.title', enContext));
  });
});
