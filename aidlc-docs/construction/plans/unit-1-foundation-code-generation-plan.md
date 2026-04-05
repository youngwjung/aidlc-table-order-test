# Code Generation Plan - Unit 1: Foundation

## Unit Context
- **프로젝트 타입**: Greenfield (모놀리식)
- **워크스페이스 루트**: /home/ec2-user/environment/aidlc-table-order
- **스토리**: CS-01, CS-ERR-01, AD-01, AD-02, AD-ERR-01 (5개)
- **담당**: Phase 0 - 3명 공동 (개발자A: 백엔드+Docker, 개발자B: 프론트엔드, 개발자C: 인증)

## 코드 위치
- **백엔드 코드**: `backend/`
- **프론트엔드 코드**: `frontend/`
- **인프라**: 루트 (`docker-compose.yml`, `.env.example`)
- **문서 요약**: `aidlc-docs/construction/unit-1-foundation/code/`

---

## Generation Steps

### Step 1: 프로젝트 루트 인프라 설정
- [x] `docker-compose.yml` 생성
- [x] `.env.example` 생성
- [x] `.gitignore` 생성
- [x] `uploads/.gitkeep` 생성

### Step 2: 백엔드 프로젝트 구조 설정
- [x] `backend/Dockerfile` 생성
- [x] `backend/requirements.txt` 생성
- [x] `backend/app/__init__.py` 생성
- [x] `backend/app/config.py` (환경 변수 설정 로드)
- [x] `backend/app/database.py` (SQLAlchemy async 엔진, 세션 팩토리, get_db 의존성)

### Step 3: SQLAlchemy 모델 전체 정의
- [x] `backend/app/models/__init__.py` (Base, 모델 import)
- [x] `backend/app/models/store.py` (Store)
- [x] `backend/app/models/admin_user.py` (AdminUser)
- [x] `backend/app/models/table.py` (Table)
- [x] `backend/app/models/category.py` (Category)
- [x] `backend/app/models/menu.py` (Menu)
- [x] `backend/app/models/order.py` (Order, OrderItem)
- [x] `backend/app/models/order_history.py` (OrderHistory, OrderHistoryItem)

### Step 4: Pydantic 스키마 전체 정의
- [x] `backend/app/schemas/__init__.py`
- [x] `backend/app/schemas/auth.py` (LoginRequest, TokenResponse, TableLoginRequest)
- [x] `backend/app/schemas/store.py` (StoreCreate, StoreResponse, SetupRequest)
- [x] `backend/app/schemas/table.py` (TableCreate, TableUpdate, TableResponse)
- [x] `backend/app/schemas/category.py` (CategoryCreate, CategoryUpdate, CategoryResponse)
- [x] `backend/app/schemas/menu.py` (MenuCreate, MenuUpdate, MenuResponse)
- [x] `backend/app/schemas/order.py` (OrderCreate, OrderItemCreate, OrderResponse, OrderStatusUpdate, OrderHistoryResponse)

### Step 5: 미들웨어 및 인증 유틸리티
- [x] `backend/app/middleware/__init__.py`
- [x] `backend/app/middleware/auth.py` (JWT 생성/검증, get_current_user, require_role 의존성, 비밀번호 해싱)
- [x] `backend/app/middleware/rate_limiter.py` (인메모리 로그인 시도 제한)
**관련 스토리**: AD-01, AD-02, AD-ERR-01, CS-01

### Step 6: 서비스 레이어 - AuthService, StoreService
- [x] `backend/app/services/__init__.py`
- [x] `backend/app/services/auth_service.py` (관리자 로그인, 테이블 로그인, 토큰 발급)
- [x] `backend/app/services/store_service.py` (매장 CRUD, 초기 설정, check-setup)
**관련 스토리**: AD-01, AD-ERR-01, CS-01, CS-ERR-01

### Step 7: API 라우터 - Auth, Store
- [x] `backend/app/routers/__init__.py`
- [x] `backend/app/routers/auth.py` (POST /api/auth/admin/login, POST /api/auth/table/login)
- [x] `backend/app/routers/stores.py` (GET /api/stores/check-setup, POST /api/stores/setup, GET /api/stores/{id})
**관련 스토리**: AD-01, AD-ERR-01, CS-01, CS-ERR-01

### Step 8: FastAPI 메인 앱
- [x] `backend/app/main.py` (FastAPI 앱, lifespan create_all, CORS, 라우터 등록, health 엔드포인트, static files for uploads)

### Step 9: 프론트엔드 프로젝트 구조 설정
- [x] `frontend/Dockerfile` 생성
- [x] `frontend/package.json` 생성
- [x] `frontend/tsconfig.json` 생성
- [x] `frontend/next.config.js` 생성
- [x] `frontend/tailwind.config.ts` 생성
- [x] `frontend/postcss.config.js` 생성

### Step 10: 프론트엔드 공통 유틸리티
- [x] `frontend/src/types/index.ts` (전체 TypeScript 타입 정의)
- [x] `frontend/src/lib/api-client.ts` (fetch 래퍼, 인증 헤더, 에러 처리, 401 로그아웃)
- [x] `frontend/src/lib/token-utils.ts` (JWT localStorage 관리, 디코딩, 만료 확인)

### Step 11: 프론트엔드 Context
- [x] `frontend/src/contexts/auth-context.tsx` (AuthProvider, useAuth, login/logout, 토큰 복원)
- [x] `frontend/src/contexts/cart-context.tsx` (CartProvider, useCart, add/remove/clear, localStorage 동기화)
**관련 스토리**: AD-01, AD-02, CS-01

### Step 12: 프론트엔드 공통 UI 컴포넌트
- [x] `frontend/src/components/ui/toast.tsx` (성공/에러/정보 알림)
- [x] `frontend/src/components/ui/confirm-modal.tsx` (확인/취소 팝업)
- [x] `frontend/src/components/ui/status-badge.tsx` (주문 상태 뱃지)
- [x] `frontend/src/components/ui/loading-spinner.tsx` (로딩 인디케이터)

### Step 13: 프론트엔드 레이아웃
- [x] `frontend/src/components/layouts/admin-layout.tsx` (사이드바, 헤더, 로그아웃, 인증 가드)
- [x] `frontend/src/components/layouts/customer-layout.tsx` (하단 탭, 헤더, 인증 가드, 장바구니 뱃지)
**관련 스토리**: AD-01, CS-01

### Step 14: 프론트엔드 페이지 - 초기 설정 + 관리자 로그인
- [x] `frontend/src/app/layout.tsx` (루트 레이아웃, AuthProvider, CartProvider, Tailwind globals)
- [x] `frontend/src/app/page.tsx` (루트 → check-setup → 리다이렉트)
- [x] `frontend/src/app/setup/page.tsx` (초기 매장+관리자 설정)
- [x] `frontend/src/app/admin/login/page.tsx` (관리자 로그인)
- [x] `frontend/src/app/admin/dashboard/page.tsx` (임시 placeholder)
**관련 스토리**: AD-01, AD-02, AD-ERR-01

### Step 15: 프론트엔드 페이지 - 고객 태블릿 설정
- [x] `frontend/src/app/customer/setup/page.tsx` (태블릿 초기 설정)
- [x] `frontend/src/app/customer/menu/page.tsx` (임시 placeholder)
**관련 스토리**: CS-01, CS-ERR-01

### Step 16: 프론트엔드 globals CSS
- [x] `frontend/src/app/globals.css` (Tailwind directives, 기본 스타일)

### Step 17: 코드 요약 문서
- [x] `aidlc-docs/construction/unit-1-foundation/code/code-summary.md` (생성된 파일 목록, 구조, 실행 방법)

---

## Story Coverage

| 스토리 ID | 제목 | 구현 Step |
|---|---|---|
| CS-01 | 태블릿 자동 로그인 | 5, 6, 7, 10, 11, 13, 15 |
| CS-ERR-01 | 자동 로그인 실패 처리 | 6, 7, 10, 15 |
| AD-01 | 관리자 로그인 | 5, 6, 7, 10, 11, 13, 14 |
| AD-02 | 관리자 자동 로그아웃 | 5, 10, 11, 13 |
| AD-ERR-01 | 로그인 실패 처리 | 5, 6, 7, 14 |
