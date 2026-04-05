# 컴포넌트 정의 (Components)

---

## 1. 프론트엔드 컴포넌트 (Next.js + TypeScript + Tailwind CSS)

### 1.1 페이지 컴포넌트

| 컴포넌트 | 경로 | 책임 |
|---|---|---|
| **CustomerMenuPage** | `/customer/menu` | 카테고리별 메뉴 목록 표시, 기본(홈) 화면 |
| **CustomerCartPage** | `/customer/cart` | 장바구니 관리, 수량 조절, 주문 확정 |
| **CustomerOrdersPage** | `/customer/orders` | 현재 세션 주문 내역 조회 |
| **CustomerOrderSuccessPage** | `/customer/order-success` | 주문 성공 확인, 5초 후 메뉴로 리다이렉트 |
| **CustomerSetupPage** | `/customer/setup` | 태블릿 초기 설정 (매장ID, 테이블번호, 비밀번호) |
| **AdminLoginPage** | `/admin/login` | 관리자 로그인 |
| **AdminDashboardPage** | `/admin/dashboard` | 테이블별 주문 모니터링 대시보드 (SSE) |
| **AdminTableDetailPage** | `/admin/tables/[id]` | 테이블 상세 주문 보기, 주문 삭제, 이용 완료 |
| **AdminOrderHistoryPage** | `/admin/tables/[id]/history` | 테이블 과거 주문 내역 조회 |
| **AdminMenuManagementPage** | `/admin/menus` | 메뉴 CRUD, 이미지 업로드 |
| **AdminCategoryManagementPage** | `/admin/categories` | 카테고리 CRUD, 순서 관리 |
| **AdminTableManagementPage** | `/admin/tables` | 테이블 초기 설정 관리 |

### 1.2 공통 UI 컴포넌트

| 컴포넌트 | 책임 |
|---|---|
| **MenuCard** | 메뉴 카드 표시 (이미지, 이름, 가격, 담기 버튼) |
| **MenuDetailModal** | 메뉴 상세 정보 모달 (설명, 이미지 확대) |
| **CartItem** | 장바구니 항목 (수량 조절, 삭제) |
| **CartSummary** | 장바구니 총 금액, 주문하기 버튼 |
| **OrderCard** | 주문 정보 카드 (번호, 시각, 메뉴, 금액, 상태) |
| **TableCard** | 대시보드 테이블 카드 (테이블번호, 총액, 최신주문) |
| **CategoryTabs** | 카테고리 탭 네비게이션 |
| **ConfirmModal** | 확인/취소 팝업 (삭제, 이용완료 등) |
| **StatusBadge** | 주문 상태 뱃지 (대기중/준비중/완료) |
| **ImageUploader** | 이미지 파일 선택 및 미리보기 |
| **Toast** | 성공/실패 피드백 메시지 |
| **CustomerLayout** | 고객 화면 공통 레이아웃 (하단 탭 네비게이션) |
| **AdminLayout** | 관리자 화면 공통 레이아웃 (사이드바 네비게이션) |

### 1.3 프론트엔드 서비스/유틸리티

| 모듈 | 책임 |
|---|---|
| **apiClient** | fetch 기반 API 호출 래퍼 (base URL, 헤더, 에러 처리) |
| **authContext** | 인증 상태 관리 (Context + useReducer) |
| **cartContext** | 장바구니 상태 관리 (Context + useReducer + localStorage) |
| **useSSE** | SSE 연결 관리 커스텀 훅 (연결, 재연결, 이벤트 처리) |
| **tokenUtils** | JWT 토큰 저장/조회/만료 확인 유틸리티 |

---

## 2. 백엔드 컴포넌트 (FastAPI + SQLAlchemy + PostgreSQL)

### 2.1 API 라우터 (Router Layer)

| 라우터 | 경로 접두사 | 책임 |
|---|---|---|
| **auth_router** | `/api/auth` | 관리자 로그인, 테이블 인증 |
| **store_router** | `/api/stores` | 매장 관리 |
| **table_router** | `/api/stores/{store_id}/tables` | 테이블 CRUD, 세션 관리 |
| **category_router** | `/api/stores/{store_id}/categories` | 카테고리 CRUD, 순서 관리 |
| **menu_router** | `/api/stores/{store_id}/menus` | 메뉴 CRUD, 이미지 업로드 |
| **order_router** | `/api/stores/{store_id}/orders` | 주문 생성, 조회, 상태 변경, 삭제 |
| **sse_router** | `/api/stores/{store_id}/sse` | SSE 실시간 주문 스트림 |

### 2.2 서비스 레이어 (Service Layer)

| 서비스 | 책임 |
|---|---|
| **AuthService** | 관리자/테이블 인증, JWT 발급/검증, 비밀번호 해싱 |
| **StoreService** | 매장 CRUD, 매장 데이터 격리 |
| **TableService** | 테이블 CRUD, 세션 시작/종료, 이용 완료 처리 |
| **CategoryService** | 카테고리 CRUD, 순서 관리 |
| **MenuService** | 메뉴 CRUD, 순서 관리 |
| **OrderService** | 주문 생성, 조회, 상태 변경, 삭제, 과거 내역 이동 |
| **ImageService** | 이미지 파일 업로드, 저장, URL 생성 |
| **SSEService** | SSE 이벤트 브로드캐스트, 연결 관리 |

### 2.3 데이터 모델 (Model Layer - SQLAlchemy)

| 모델 | 주요 필드 | 책임 |
|---|---|---|
| **Store** | id, name, identifier (unique), created_at | 매장 정보 |
| **AdminUser** | id, store_id, username, password_hash, created_at | 관리자 계정 |
| **Table** | id, store_id, table_number, password_hash, session_id, session_started_at | 테이블 정보 및 세션 |
| **Category** | id, store_id, name, display_order | 메뉴 카테고리 |
| **Menu** | id, store_id, category_id, name, price, description, image_url, display_order | 메뉴 정보 |
| **Order** | id, store_id, table_id, session_id, order_number, status, total_amount, created_at | 현재 주문 |
| **OrderItem** | id, order_id, menu_name, quantity, unit_price | 주문 항목 |
| **OrderHistory** | id, store_id, table_id, session_id, order_number, total_amount, ordered_at, completed_at | 과거 주문 이력 |
| **OrderHistoryItem** | id, order_history_id, menu_name, quantity, unit_price | 과거 주문 항목 |

### 2.4 인프라/미들웨어

| 컴포넌트 | 책임 |
|---|---|
| **Database** | SQLAlchemy async 세션 관리, 연결 풀 |
| **JWTMiddleware** | JWT 토큰 검증, 요청별 사용자 컨텍스트 설정 |
| **CORSMiddleware** | CORS 설정 (프론트엔드 도메인 허용) |
| **RateLimiter** | 로그인 시도 제한 |
| **ImageStorage** | 로컬 파일 시스템 이미지 저장/조회 |
