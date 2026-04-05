# 서비스 정의 및 오케스트레이션 (Services)

---

## 1. 서비스 아키텍처 개요

```
+-------------------+     +-------------------+     +-------------------+
|   Next.js App     |     |   FastAPI Server   |     |   PostgreSQL DB   |
|   (Frontend)      |---->|   (Backend API)    |---->|   (Data Store)    |
|                   |     |                    |     |                   |
| - Customer Pages  |     | - API Routers      |     | - Stores          |
| - Admin Pages     |     | - Services         |     | - Tables          |
| - Context/State   |     | - Models           |     | - Categories      |
| - API Client      |     | - Auth/JWT         |     | - Menus           |
|                   |<----|   - SSE Stream     |     | - Orders          |
+-------------------+     +-------------------+     +-------------------+
                                    |
                                    v
                          +-------------------+
                          | Local File System |
                          | (Image Storage)   |
                          +-------------------+
```

---

## 2. 서비스 정의

### 2.1 AuthService
**책임**: 인증 및 권한 관리

**오케스트레이션**:
- 관리자 로그인: StoreService로 매장 확인 → 비밀번호 검증 → JWT 발급
- 테이블 로그인: StoreService로 매장 확인 → TableService로 테이블 확인 → 비밀번호 검증 → JWT 발급
- 토큰 검증: JWT 디코딩 → 만료 확인 → 사용자 컨텍스트 반환

**의존**: StoreService, TableService

---

### 2.2 StoreService
**책임**: 매장 데이터 관리, 멀티테넌트 격리 기반

**오케스트레이션**:
- 모든 데이터 조회 시 store_id 기반 필터링으로 테넌트 격리 보장

**의존**: Database (Store 모델)

---

### 2.3 TableService
**책임**: 테이블 관리, 세션 라이프사이클

**오케스트레이션**:
- 이용 완료: OrderService.move_orders_to_history() 호출 → 세션 리셋 → SSEService로 이벤트 브로드캐스트

**의존**: OrderService, SSEService

---

### 2.4 CategoryService
**책임**: 카테고리 CRUD, 표시 순서 관리

**오케스트레이션**:
- 삭제 시: MenuService에 해당 카테고리 메뉴 존재 여부 확인 → 메뉴 있으면 삭제 차단

**의존**: MenuService (삭제 검증 시)

---

### 2.5 MenuService
**책임**: 메뉴 CRUD, 이미지 연결

**오케스트레이션**:
- 등록/수정: ImageService로 이미지 업로드 → 메뉴 데이터 저장
- 삭제: ImageService로 이미지 삭제 → 메뉴 데이터 삭제

**의존**: ImageService, CategoryService (검증)

---

### 2.6 OrderService
**책임**: 주문 라이프사이클 관리

**오케스트레이션**:
- 주문 생성: 주문 데이터 저장 → 세션 자동 시작(첫 주문 시) → SSEService로 신규 주문 이벤트 브로드캐스트
- 상태 변경: 상태 업데이트 → SSEService로 상태 변경 이벤트 브로드캐스트
- 주문 삭제: 주문 삭제 → 테이블 총액 재계산 → SSEService로 삭제 이벤트 브로드캐스트
- 이력 이동: 현재 주문 → OrderHistory 복사 → 현재 주문 삭제

**의존**: TableService (세션 확인), SSEService

---

### 2.7 ImageService
**책임**: 이미지 파일 관리

**오케스트레이션**:
- 업로드: 파일 유효성 검증 → 고유 파일명 생성 → 로컬 파일 시스템 저장 → URL 경로 반환

**의존**: 로컬 파일 시스템

---

### 2.8 SSEService
**책임**: 실시간 이벤트 스트리밍

**오케스트레이션**:
- 구독: store_id 기반 채널 구독 → AsyncGenerator로 이벤트 스트림 반환
- 브로드캐스트: 이벤트 수신 → 해당 store_id의 모든 구독자에게 전달

**의존**: 없음 (인메모리 이벤트 큐)

**이벤트 타입**:
- `order_created`: 신규 주문 생성
- `order_status_changed`: 주문 상태 변경
- `order_deleted`: 주문 삭제
- `table_completed`: 테이블 이용 완료

---

## 3. 주요 오케스트레이션 흐름

### 3.1 고객 주문 흐름
```
Customer -> OrderRouter.create_order()
  -> OrderService.create_order()
    -> TableService: 세션 확인/자동 시작
    -> DB: Order + OrderItem 저장
    -> SSEService.broadcast("order_created", order)
  -> Response: Order (주문번호 포함)
```

### 3.2 관리자 이용 완료 흐름
```
Admin -> TableRouter.complete_session()
  -> TableService.complete_session()
    -> OrderService.move_orders_to_history()
      -> DB: Order -> OrderHistory 복사
      -> DB: 현재 Order 삭제
    -> DB: Table 세션 리셋
    -> SSEService.broadcast("table_completed", table)
  -> Response: 완료 메시지
```

### 3.3 SSE 실시간 모니터링 흐름
```
Admin Dashboard -> SSERouter.stream_orders()
  -> SSEService.subscribe(store_id)
  -> AsyncGenerator: 이벤트 대기
  -> 이벤트 발생 시 -> text/event-stream 응답
```
