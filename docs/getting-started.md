# 시작하기 (Getting Started)

> 그누보드7 플랫폼 개발을 위한 빠른 시작 가이드입니다.

---

# 프로젝트 구조 이해

그누보드7은 Laravel 기반 애플리케이션 구조 위에 확장 시스템과 템플릿 시스템을 결합한 플랫폼입니다.

핵심 특징:

* Laravel 기반 애플리케이션 구조
* Bundled Extension Architecture
* Template Activation Lifecycle
* Layout JSON 기반 UI 시스템
* Runtime-safe 설치 및 활성화 구조
* 모듈/플러그인/템플릿 독립 lifecycle

---

# 디렉토리 구조

```text
modules/_bundled/
plugins/_bundled/
templates/_bundled/
```

각 디렉토리는 공개 가능한 소스 패키지를 저장합니다.

실제 활성화된 런타임 복사본은 별도 위치에 생성되며 Git에 포함되지 않습니다.

---

# 개발 흐름 이해

그누보드7은 아래 흐름으로 동작합니다.

```text
_bundled source
→ install/update
→ runtime copy 생성
→ activate
→ 실제 서비스 동작
```

즉 `_bundled` 내부는 배포 가능한 "원본 패키지" 역할을 합니다.

---

# 문서 읽는 추천 순서

## 1. 전체 구조 이해

먼저 아래 문서를 읽으세요.

* [문서 인덱스](README.md)
* [시스템 요구사항](requirements.md)
* [확장 시스템 가이드](extension/README.md)
* [프론트엔드 개발 가이드](frontend/README.md)
* [백엔드 개발 가이드](backend/README.md)

---

# 템플릿 시스템 시작하기

추천 문서:

1. [템플릿 시스템 기초](extension/template-basics.md)
2. [템플릿 개발 워크플로우](extension/template-workflow.md)
3. [템플릿 라우트 규칙](extension/template-routing.md)
4. [레이아웃 JSON 스키마](frontend/layout-json.md)

---

# 첫 Layout JSON 작성

Layout JSON은 UI를 선언적으로 정의하는 시스템입니다.

반드시 아래 문서를 먼저 읽으세요.

1. [레이아웃 JSON 스키마](frontend/layout-json.md)
2. [레이아웃 JSON 컴포넌트](frontend/layout-json-components.md)
3. [데이터 바인딩](frontend/data-binding.md)
4. [액션 핸들러](frontend/actions.md)

중요 규칙:

* HTML 태그 직접 사용 금지
* 기본 컴포넌트 사용
* 상태 관리 규칙 준수
* data_sources 기반 데이터 연결

---

# 첫 모듈 개발

추천 순서:

1. [모듈 개발 기초](extension/module-basics.md)
2. [모듈 라우트 규칙](extension/module-routing.md)
3. [Service-Repository 패턴](backend/service-repository.md)
4. [검증 규칙](backend/validation.md)
5. [API 응답 규칙](backend/response-helper.md)

---

# 테스트 정책

그누보드7은 테스트 통과를 개발 완료 기준으로 사용합니다.

반드시 읽어야 하는 문서:

* [테스트 가이드](testing-guide.md)
* [레이아웃 테스트](frontend/layout-testing.md)

---

# 다국어 시스템

모든 기능은 다국어 지원을 고려하여 개발해야 합니다.

추천 문서:

* [모듈 다국어 시스템](extension/module-i18n.md)
* [데이터 바인딩 다국어 처리](frontend/data-binding-i18n.md)

---

# 권장 개발 순서

처음 참여하는 경우 아래 순서를 추천합니다.

1. 문서 구조 이해
2. Layout JSON 이해
3. Template 구조 이해
4. 작은 UI 수정
5. 간단한 Data Source 연결
6. 모듈 개발
7. Hook 시스템 활용
8. 테스트 작성

---

# 주의 사항

* runtime 디렉토리는 직접 수정하지 마세요.
* `_bundled` 디렉토리를 기준으로 작업하세요.
* Service 레이어에 Validation 로직을 넣지 마세요.
* 모든 API 응답은 ResponseHelper를 사용하세요.
* 테스트 통과 없이 작업 완료로 간주하지 않습니다.

---

# 추가 문서

* [데이터베이스 개발 가이드](database-guide.md)
* [보안 가이드](SECURITY.md)
* [치트시트](cheatsheet.md)

---

# 상태

현재 프로젝트는 실험적(Experimental) 상태이며 내부 구조는 변경될 수 있습니다.

