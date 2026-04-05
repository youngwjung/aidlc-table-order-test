# 유닛 정의 (Unit of Work)

**분해 방식**: 기능 도메인 기반 (백엔드+프론트엔드 함께)
**구현 순서**: 의존성 순서 (기반 인프라부터)
**아키텍처**: 모놀리식 (단일 Next.js + 단일 FastAPI)
**팀 구성**: 3인 병렬 개발

---

## 개발 Phase 개요

```
Phase 0: Foundation (3명 공동)
  개발자A: 백엔드 구조 + DB 모델 + Docker
  개발자B: 프론트엔드 구조 + 공통 컴포넌트
  개발자C: 인증 시스템 (JWT, 로그인 API/페이지)
         |
         v
Phase 1: 도메인별 병렬 (3명 독립)
  개발자A: Unit 2 (메뉴/카테고리)
  개발자B: Unit 3 (고객 주문)      <- 시드 데이터로 메뉴 대체
  개발자C: Unit 4 (관리자 대시보드) <- OrderService 분담 구현
         |
         v
Phase 2: 통합 (3명 공동)
  API 연동, SSE E2E, 전체 흐름 검증
```

---

## Phase 0: Unit 1 - Foundation (기반 인프라)

**개발 방식**: 3명 공동 작업
**전제 조건**: 없음 (모든 유닛의 기반)

### 담당 분배

| 담당자 | 영역 | 항목 |
|---|---|---|
| **개발자 A** | 백엔드 구조 + DB | FastAPI 앱 스켈레톤, config, database.py, 전체 SQLAlchemy 모델(9개), Pydantic 스키마 전체, Docker 환경 (Dockerfile, docker-compose.yml, PostgreSQL) |
| **개발자 B** | 프론트엔드 구조 | Next.js 앱 스켈레톤, Tailwind 설정, apiClient, tokenUtils, CustomerLayout, AdminLayout, 공통 UI 컴포넌트 (Toast, ConfirmModal, StatusBadge), TypeScript 타입 정의 |
| **개발자 C** | 인증 시스템 | AuthService, StoreService, auth_router, store_router, JWT 미들웨어, CORS 미들웨어, RateLimiter, authContext, AdminLoginPage, CustomerSetupPage |

### 관련 스토리
| 스토리 ID | 스토리 제목 | Priority | 담당 |
|---|---|---|---|
| CS-01 | 태블릿 자동 로그인 | Must | 개발자 C |
| CS-ERR-01 | 자동 로그인 실패 처리 | Must | 개발자 C |
| AD-01 | 관리자 로그인 | Must | 개발자 C |
| AD-02 | 관리자 자동 로그아웃 | Must | 개발자 C |
| AD-ERR-01 | 로그인 실패 처리 | Must | 개발자 C |

### 산출물
- 백엔드: FastAPI 앱, 전체 DB 모델, 인증 시스템, 매장 API
- 프론트엔드: Next.js 앱, 공통 유틸리티/컴포넌트, 로그인/설정 페이지
- 인프라: Docker Compose 환경 (3 컨테이너 실행 가능)

### Phase 0 완료 기준
- Docker Compose로 3 컨테이너(frontend, backend, db) 정상 기동
- 관리자 로그인 → JWT 발급 → 인증된 API 호출 동작
- 테이블 인증 → 자동 로그인 동작
- 전체 DB 테이블 마이그레이션 완료

---

## Phase 1: 도메인별 병렬 개발

### 개발자 A: Unit 2 - Menu & Category Management (메뉴/카테고리 관리)

**전제 조건**: Phase 0 완료

#### 책임
- 카테고리 CRUD API + 관리 페이지
- 메뉴 CRUD API + 관리 페이지
- 이미지 업로드/저장/서빙
- 메뉴/카테고리 표시 순서 관리
- 고객 메뉴 조회 페이지 (카테고리별 탐색, 상세 보기)

#### 포함 범위
| 영역 | 항목 |
|---|---|
| **백엔드** | CategoryService, MenuService, ImageService, category_router, menu_router, 이미지 파일 서빙, 필드 검증 |
| **프론트엔드** | AdminCategoryManagementPage, AdminMenuManagementPage, CustomerMenuPage, MenuCard, MenuDetailModal, CategoryTabs, ImageUploader |
| **인프라** | Docker 볼륨 (uploads) 설정 |

#### 관련 스토리 (17개)
CS-02, CS-03, CS-04, CS-ERR-03, AD-12, AD-13, AD-14, AD-15, AD-16, AD-17, AD-18, AD-19, AD-20, AD-21, AD-22, AD-ERR-04, AD-ERR-05

---

### 개발자 B: Unit 3 - Customer Order Flow (고객 주문 흐름)

**전제 조건**: Phase 0 완료
**병렬 의존성 해결**: 메뉴 데이터는 **DB 시드 스크립트**로 테스트 메뉴를 직접 삽입하여 개발자 A와 독립적으로 작업. Phase 2에서 실제 메뉴 API와 연동.

#### 책임
- 장바구니 관리 (Context + localStorage)
- 주문 생성 API + 주문 확정 화면
- 주문 성공 화면 (5초 리다이렉트)
- 현재 세션 주문 내역 조회
- 테이블 세션 자동 시작 (첫 주문 시)
- SSE 이벤트 발행 연결점 준비 (broadcast 호출 코드, 실제 SSEService는 개발자 C)

#### 포함 범위
| 영역 | 항목 |
|---|---|
| **백엔드** | OrderService (create_order, get_current_session_orders, get_table_total), order_router (POST create, GET current), TableService.start_session, 시드 스크립트 (테스트 메뉴 데이터) |
| **프론트엔드** | cartContext, CustomerCartPage, CustomerOrderSuccessPage, CustomerOrdersPage, CartItem, CartSummary, OrderCard, StatusBadge |

#### 관련 스토리 (11개)
CS-05, CS-06, CS-07, CS-08, CS-09, CS-10, CS-11, CS-12, CS-13, CS-ERR-02, CS-ERR-04

---

### 개발자 C: Unit 4 - Admin Dashboard & Table Management (관리자 대시보드/테이블 관리)

**전제 조건**: Phase 0 완료
**병렬 의존성 해결**: OrderService의 **상태 변경/삭제/이력 이동** 메서드를 직접 구현 (create는 개발자 B). SSEService를 직접 구현하고, 개발자 B가 주문 생성 시 broadcast 호출하도록 Phase 2에서 연결.

#### 책임
- SSE 실시간 주문 스트리밍 (SSEService 전체 구현)
- 관리자 주문 모니터링 대시보드 (그리드 레이아웃)
- 주문 상태 변경 (대기중 → 준비중 → 완료)
- 주문 삭제 (직권 수정)
- 테이블 CRUD + 테이블 관리 페이지
- 테이블 이용 완료 (세션 종료, 이력 이동)
- 과거 주문 내역 조회

#### 포함 범위
| 영역 | 항목 |
|---|---|
| **백엔드** | SSEService, sse_router, OrderService (update_status, delete_order, get_orders, get_order_history, move_orders_to_history), TableService (complete_session, CRUD), table_router |
| **프론트엔드** | useSSE, AdminDashboardPage, AdminTableDetailPage, AdminOrderHistoryPage, AdminTableManagementPage, TableCard, ConfirmModal (공유 컴포넌트 활용) |

#### 관련 스토리 (11개)
AD-03, AD-04, AD-05, AD-06, AD-07, AD-08, AD-09, AD-10, AD-11, AD-ERR-02, AD-ERR-03

---

## Phase 2: 통합 (3명 공동)

**전제 조건**: Phase 1의 3개 유닛 모두 완료

### 통합 작업 항목

| 항목 | 설명 | 담당 |
|---|---|---|
| **메뉴→주문 연동** | 시드 데이터 제거, 실제 메뉴 API 연동 확인 | 개발자 A + B |
| **SSE 이벤트 연결** | 주문 생성(개발자B) → SSEService.broadcast(개발자C) 호출 연결 | 개발자 B + C |
| **OrderService 통합** | 개발자 B(create)와 개발자 C(update/delete/history) 코드 병합 검증 | 개발자 B + C |
| **E2E 흐름 테스트** | 고객 주문 → 대시보드 실시간 표시 → 상태 변경 → 이용 완료 → 과거 내역 | 전원 |
| **멀티테넌트 검증** | 2개 이상 매장 데이터 격리 확인 | 전원 |
| **에러 시나리오 검증** | 전체 에러 스토리 (CS-ERR, AD-ERR) 검증 | 전원 |

### OrderService 분담 상세

OrderService는 개발자 B와 C가 분담하므로, 메서드별 담당을 명확히 합니다:

| 메서드 | 담당 | Phase |
|---|---|---|
| `create_order` | 개발자 B | Phase 1 |
| `get_current_session_orders` | 개발자 B | Phase 1 |
| `get_table_total` | 개발자 B | Phase 1 |
| `get_orders` (관리자 전체 조회) | 개발자 C | Phase 1 |
| `update_order_status` | 개발자 C | Phase 1 |
| `delete_order` | 개발자 C | Phase 1 |
| `get_order_history` | 개발자 C | Phase 1 |
| `move_orders_to_history` | 개발자 C | Phase 1 |
| SSE broadcast 연결 | 개발자 B + C | Phase 2 |

### Phase 2 완료 기준
- 전체 41개 스토리의 Acceptance Criteria 충족
- 고객 → 관리자 전체 주문 흐름 E2E 동작
- SSE 실시간 업데이트 2초 이내 확인
- 멀티테넌트 데이터 격리 확인
- Docker Compose로 전체 서비스 정상 기동

---

## 코드 조직 전략 (Greenfield)

### 백엔드 디렉토리 구조
```
backend/
  app/
    main.py                  # FastAPI 앱 엔트리포인트
    config.py                # 설정 (DB URL, JWT secret 등)
    database.py              # SQLAlchemy 엔진, 세션
    models/                  # SQLAlchemy 모델
      __init__.py
      store.py
      admin_user.py
      table.py
      category.py
      menu.py
      order.py
      order_history.py
    schemas/                 # Pydantic 스키마 (요청/응답)
      __init__.py
      auth.py
      store.py
      table.py
      category.py
      menu.py
      order.py
    services/                # 비즈니스 로직
      __init__.py
      auth_service.py
      store_service.py
      table_service.py
      category_service.py
      menu_service.py
      order_service.py
      image_service.py
      sse_service.py
    routers/                 # API 라우터
      __init__.py
      auth.py
      stores.py
      tables.py
      categories.py
      menus.py
      orders.py
      sse.py
    middleware/               # 미들웨어
      auth.py
      rate_limiter.py
  seed/                      # 시드 데이터 스크립트
    seed_data.py
  uploads/                   # 이미지 저장 디렉토리
  requirements.txt
  Dockerfile
```

### 프론트엔드 디렉토리 구조
```
frontend/
  src/
    app/                     # Next.js App Router
      layout.tsx
      customer/
        setup/page.tsx
        menu/page.tsx
        cart/page.tsx
        orders/page.tsx
        order-success/page.tsx
      admin/
        login/page.tsx
        dashboard/page.tsx
        tables/page.tsx
        tables/[id]/page.tsx
        tables/[id]/history/page.tsx
        menus/page.tsx
        categories/page.tsx
    components/              # 재사용 컴포넌트
      ui/                    # 공통 UI (Toast, ConfirmModal, StatusBadge 등)
      customer/              # 고객 전용 (MenuCard, CartItem 등)
      admin/                 # 관리자 전용 (TableCard, ImageUploader 등)
      layouts/               # 레이아웃 (CustomerLayout, AdminLayout)
    contexts/                # React Context
      auth-context.tsx
      cart-context.tsx
    hooks/                   # 커스텀 훅
      use-sse.ts
    lib/                     # 유틸리티
      api-client.ts
      token-utils.ts
    types/                   # TypeScript 타입 정의
      index.ts
  tailwind.config.ts
  Dockerfile
```

### 인프라 (루트)
```
docker-compose.yml
.env.example
```
