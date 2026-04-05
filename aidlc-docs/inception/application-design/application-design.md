# 애플리케이션 설계 통합 문서 (Application Design)

---

## 1. 기술 스택 요약

| 영역 | 기술 | 비고 |
|---|---|---|
| **프론트엔드** | Next.js (TypeScript) | 단일 앱, 경로로 고객/관리자 분리 |
| **스타일링** | Tailwind CSS | 유틸리티 기반, 외부 컴포넌트 라이브러리 없음 |
| **상태 관리** | React Context + useReducer | 인증(authContext), 장바구니(cartContext) |
| **API 통신** | fetch API | 브라우저 내장, 커스텀 래퍼(apiClient) |
| **백엔드** | Python + FastAPI | REST API + SSE |
| **ORM** | SQLAlchemy (async) | PostgreSQL 연동 |
| **데이터베이스** | PostgreSQL | 멀티테넌트 (store_id 기반 격리) |
| **인증** | JWT (PyJWT) + bcrypt | 관리자 16시간, 테이블 자동 로그인 |
| **실시간** | Server-Sent Events (SSE) | 주문 모니터링 실시간 업데이트 |
| **이미지 저장** | 로컬 파일 시스템 | Docker 볼륨 마운트 |
| **배포** | Docker Compose | frontend + backend + db 컨테이너 |

---

## 2. 아키텍처 개요

```
+-------------------+     +-------------------+     +-------------------+
|   Next.js App     |     |   FastAPI Server   |     |   PostgreSQL DB   |
|   (Port 3000)     |---->|   (Port 8000)      |---->|   (Port 5432)     |
|                   |     |                    |     |                   |
| Customer Pages:   |     | API Routers:       |     | Tables:           |
|  /customer/*      |     |  /api/auth         |     |  stores           |
|                   |     |  /api/stores       |     |  admin_users      |
| Admin Pages:      |     |  /api/.../tables   |     |  tables           |
|  /admin/*         |     |  /api/.../categories|    |  categories       |
|                   |     |  /api/.../menus    |     |  menus            |
| Shared:           |     |  /api/.../orders   |     |  orders           |
|  apiClient        |     |  /api/.../sse      |     |  order_items      |
|  authContext      |     |                    |     |  order_history    |
|  cartContext      |     | Services:          |     |  order_history_   |
|  useSSE hook      |<----|  SSEService (SSE)  |     |   items           |
+-------------------+     +-------------------+     +-------------------+
                                    |
                                    v
                          +-------------------+
                          | Docker Volume     |
                          | /uploads (images) |
                          +-------------------+
```

---

## 3. 프론트엔드 구조

### 3.1 라우팅 구조
```
/customer/setup          - 태블릿 초기 설정
/customer/menu           - 메뉴 조회 (기본 화면)
/customer/cart           - 장바구니
/customer/orders         - 주문 내역
/customer/order-success  - 주문 성공

/admin/login             - 관리자 로그인
/admin/dashboard         - 주문 모니터링 대시보드
/admin/tables            - 테이블 관리
/admin/tables/[id]       - 테이블 상세 (주문, 삭제, 이용완료)
/admin/tables/[id]/history - 과거 주문 내역
/admin/menus             - 메뉴 관리
/admin/categories        - 카테고리 관리
```

### 3.2 상태 관리
- **authContext**: JWT 토큰, 사용자 정보, 로그인/로그아웃
- **cartContext**: 장바구니 항목, 수량, 총액 + localStorage 동기화

### 3.3 주요 UI 컴포넌트
- MenuCard, CartItem, OrderCard, TableCard, CategoryTabs
- ConfirmModal, StatusBadge, ImageUploader, Toast
- CustomerLayout (하단 탭), AdminLayout (사이드바)

---

## 4. 백엔드 구조

### 4.1 레이어 구조
```
API Routers (HTTP 요청/응답)
    |
Service Layer (비즈니스 로직, 오케스트레이션)
    |
Model Layer (SQLAlchemy 모델, DB 접근)
    |
Database (PostgreSQL)
```

### 4.2 데이터 모델 (9개 테이블)
- **Store**: 매장 정보 (멀티테넌트 루트)
- **AdminUser**: 관리자 계정 (매장당 복수)
- **Table**: 테이블 (세션 정보 포함)
- **Category**: 메뉴 카테고리
- **Menu**: 메뉴 항목
- **Order** / **OrderItem**: 현재 활성 주문
- **OrderHistory** / **OrderHistoryItem**: 과거 이력

### 4.3 서비스 (8개)
- AuthService, StoreService, TableService, CategoryService
- MenuService, OrderService, ImageService, SSEService

---

## 5. 핵심 설계 결정

### 5.1 멀티테넌트 전략
- **방식**: 공유 데이터베이스, store_id 컬럼 기반 데이터 격리
- **적용**: 모든 테이블에 store_id FK, 모든 쿼리에 store_id 조건

### 5.2 테이블 세션 관리
- **세션 시작**: 첫 주문 생성 시 자동 (session_id UUID 생성)
- **세션 종료**: 관리자 "이용 완료" 시 → 주문 이력 이동 → 세션 리셋
- **세션 ID**: 주문 그룹화에 사용, 고객은 현재 세션 주문만 조회

### 5.3 실시간 통신 (SSE)
- **구현**: 인메모리 이벤트 큐 (asyncio.Queue per store_id)
- **이벤트**: order_created, order_status_changed, order_deleted, table_completed
- **재연결**: 클라이언트 자동 재연결 (EventSource 기본 동작)

### 5.4 이미지 관리
- **저장**: 로컬 파일 시스템 (`/uploads/` 디렉토리)
- **파일명**: UUID 기반 고유 파일명 (충돌 방지)
- **서빙**: FastAPI StaticFiles 또는 직접 라우트
- **Docker**: 볼륨 마운트로 컨테이너 재시작 시에도 유지

---

## 6. 상세 설계 문서 참조

- [컴포넌트 정의](components.md)
- [컴포넌트 메서드](component-methods.md)
- [서비스 정의](services.md)
- [컴포넌트 의존성](component-dependency.md)
