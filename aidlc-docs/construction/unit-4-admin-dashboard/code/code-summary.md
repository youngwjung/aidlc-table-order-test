# Code Summary - Unit 4: Admin Dashboard & Table Management

## 생성된 파일 목록

### Backend (6 new, 1 modified)

| 파일 | 유형 | 설명 |
|---|---|---|
| `backend/app/services/sse_service.py` | 신규 | SSE 인메모리 구독/브로드캐스트 서비스 |
| `backend/app/services/order_service.py` | 신규 | 주문 조회/상태변경/삭제/이력 이동 서비스 |
| `backend/app/services/table_service.py` | 신규 | 테이블 CRUD + 이용 완료(세션 종료) 서비스 |
| `backend/app/routers/orders.py` | 신규 | 주문 관리 API (GET, PUT status, DELETE, GET history) |
| `backend/app/routers/tables.py` | 신규 | 테이블 CRUD + 이용 완료 API |
| `backend/app/routers/sse.py` | 신규 | SSE 실시간 주문 스트리밍 엔드포인트 |
| `backend/app/main.py` | 수정 | 신규 라우터 3개 (tables, orders, sse) 등록 |

### Frontend (7 new/modified)

| 파일 | 유형 | 설명 |
|---|---|---|
| `frontend/src/hooks/use-sse.ts` | 신규 | SSE 연결 훅 (지수 백오프 재연결) |
| `frontend/src/components/admin/table-card.tsx` | 신규 | 테이블 카드 컴포넌트 (대시보드용) |
| `frontend/src/lib/notification-sound.ts` | 신규 | Web Audio API 알림음 유틸리티 |
| `frontend/src/app/admin/dashboard/page.tsx` | 수정 | 주문 모니터링 대시보드 (placeholder 교체) |
| `frontend/src/app/admin/tables/page.tsx` | 신규 | 테이블 관리 페이지 (CRUD) |
| `frontend/src/app/admin/tables/[id]/page.tsx` | 신규 | 테이블 상세 (주문 관리, 상태변경, 삭제, 이용완료) |
| `frontend/src/app/admin/tables/[id]/history/page.tsx` | 신규 | 과거 주문 내역 (날짜 필터) |

## 스토리 구현 매핑

| 스토리 ID | 스토리 제목 | Priority | 구현 파일 |
|---|---|---|---|
| AD-03 | 실시간 주문 대시보드 조회 | Must | dashboard/page.tsx, table-card.tsx |
| AD-04 | 실시간 주문 수신 (SSE) | Must | sse_service.py, sse.py router, use-sse.ts |
| AD-05 | 주문 상세 보기 | Must | tables/[id]/page.tsx, orders.py router |
| AD-06 | 주문 상태 변경 | Must | order_service.py, orders.py router, tables/[id]/page.tsx |
| AD-07 | 테이블별 필터링 | Should | dashboard/page.tsx (filter dropdown) |
| AD-08 | 테이블 초기 설정 | Must | table_service.py, tables.py router, tables/page.tsx |
| AD-09 | 주문 삭제 | Must | order_service.py, orders.py router, tables/[id]/page.tsx |
| AD-10 | 테이블 이용 완료 처리 | Must | table_service.py, tables.py router, tables/[id]/page.tsx |
| AD-11 | 과거 주문 내역 조회 | Must | order_service.py, orders.py router, history/page.tsx |
| AD-ERR-02 | SSE 연결 끊김 처리 | Should | use-sse.ts, dashboard/page.tsx (error banner) |
| AD-ERR-03 | 주문 삭제 실패 처리 | Must | tables/[id]/page.tsx (error toast) |

## API 엔드포인트 요약

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/stores/{store_id}/tables` | 테이블 목록 |
| POST | `/api/stores/{store_id}/tables` | 테이블 생성 |
| PUT | `/api/stores/{store_id}/tables/{table_id}` | 테이블 수정 |
| DELETE | `/api/stores/{store_id}/tables/{table_id}` | 테이블 삭제 |
| POST | `/api/stores/{store_id}/tables/{table_id}/complete` | 이용 완료 |
| GET | `/api/stores/{store_id}/orders` | 주문 목록 (관리자) |
| PUT | `/api/stores/{store_id}/orders/{order_id}/status` | 주문 상태 변경 |
| DELETE | `/api/stores/{store_id}/orders/{order_id}` | 주문 삭제 |
| GET | `/api/stores/{store_id}/orders/table/{table_id}/history` | 과거 내역 |
| GET | `/api/stores/{store_id}/sse/orders?token=` | SSE 실시간 스트림 |
