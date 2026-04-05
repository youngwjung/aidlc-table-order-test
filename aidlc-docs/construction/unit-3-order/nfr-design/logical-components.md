# 논리적 컴포넌트 - Unit 3: Customer Order Flow

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐│
│  │ CartPage  │  │ Orders   │  │ OrderSuccess       ││
│  │          │  │ Page     │  │ Page               ││
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘│
│       │              │                  │            │
│  ┌────┴──────────────┴──────────────────┴──────────┐│
│  │              cartContext (useReducer)            ││
│  │  ┌─────────────────────────────────────────┐    ││
│  │  │        localStorage Sync Layer          │    ││
│  │  │  cart_{storeId}_{tableId}               │    ││
│  │  └─────────────────────────────────────────┘    ││
│  └────────────────────┬────────────────────────────┘│
│                       │                              │
│  ┌────────────────────┴────────────────────────────┐│
│  │              apiClient (fetch wrapper)           ││
│  └────────────────────┬────────────────────────────┘│
└───────────────────────┼──────────────────────────────┘
                        │ HTTP (REST API)
┌───────────────────────┼──────────────────────────────┐
│                 BACKEND (FastAPI)                     │
│                       │                              │
│  ┌────────────────────┴────────────────────────────┐│
│  │              order_router                        ││
│  │  POST /api/stores/{id}/orders                   ││
│  │  GET  /api/stores/{id}/orders/table/{id}/current││
│  └────────────────────┬────────────────────────────┘│
│                       │                              │
│  ┌────────────────────┴────────────────────────────┐│
│  │              OrderService                        ││
│  │  create_order()                                 ││
│  │  get_current_session_orders()                   ││
│  │  get_table_total()                              ││
│  └───────┬──────────────────┬──────────────────────┘│
│          │                  │                        │
│  ┌───────┴──────┐  ┌───────┴──────────────────────┐│
│  │ TableService  │  │ Menu Model (읽기 참조)       ││
│  │ start_session │  │ 메뉴 유효성 검증용           ││
│  └───────┬──────┘  └──────────────────────────────┘│
│          │                                          │
│  ┌───────┴──────────────────────────────────────────┐│
│  │              AsyncSession (SQLAlchemy)            ││
│  └───────┬──────────────────────────────────────────┘│
└──────────┼───────────────────────────────────────────┘
           │
┌──────────┴───────────────────────────────────────────┐
│              PostgreSQL                               │
│  orders, order_items, tables, menus                  │
└──────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Frontend Layer

| 컴포넌트 | 유형 | 책임 | 의존성 |
|---|---|---|---|
| cartContext | Context Provider | 장바구니 상태 관리 + localStorage 동기화 | authContext (storeId, tableId) |
| CustomerCartPage | Page | 장바구니 UI, 수량 조절, 주문 제출 | cartContext, apiClient |
| CustomerOrderSuccessPage | Page | 성공 확인, 카운트다운, 리다이렉트 | cartContext (clearCart), router |
| CustomerOrdersPage | Page | 현재 세션 주문 목록 | apiClient, authContext |
| CartItem | UI Component | 개별 장바구니 항목 표시 | (props only) |
| CartSummary | UI Component | 합계 + 주문 버튼 | (props only) |
| OrderCard | UI Component | 주문 카드 표시 | StatusBadge |
| StatusBadge | UI Component | 주문 상태 배지 | (props only) |
| ConfirmModal | UI Component | 확인/취소 모달 | (props only) |

### 2. Backend Layer

| 컴포넌트 | 유형 | 책임 | 의존성 |
|---|---|---|---|
| order_router | APIRouter | HTTP 엔드포인트, 인증 검증, 요청/응답 처리 | OrderService, auth middleware |
| OrderService | Service | 주문 비즈니스 로직 (생성, 조회, 합계) | AsyncSession, TableService |
| TableService (enhanced) | Service | 세션 시작 로직 추가 | AsyncSession |

### 3. Data Layer

| 컴포넌트 | 유형 | 용도 |
|---|---|---|
| Order (model) | SQLAlchemy Model | 주문 레코드 (Unit 1에서 정의) |
| OrderItem (model) | SQLAlchemy Model | 주문 항목 (Unit 1에서 정의) |
| Table (model) | SQLAlchemy Model | 세션 관리 필드 사용 |
| Menu (model) | SQLAlchemy Model | 메뉴 검증용 읽기 참조 |

### 4. Infrastructure

| 컴포넌트 | 용도 |
|---|---|
| localStorage | 장바구니 클라이언트 영속화 |
| seed_data.py | 테스트 메뉴/카테고리 데이터 (Unit 2 대체) |

---

## 데이터 흐름

### 주문 생성 흐름
```
CartPage → [확인 모달] → apiClient.post('/orders')
  → order_router (JWT 인증)
    → OrderService.create_order()
      → Menu 검증 (가격 재계산)
      → TableService.start_session() (필요 시)
      → Order INSERT + OrderItem INSERT (단일 트랜잭션)
    ← OrderResponse
  ← HTTP 201
→ OrderSuccessPage (orderNumber, totalAmount)
→ clearCart() + 5초 후 메뉴 리다이렉트
```

### 주문 내역 조회 흐름
```
OrdersPage mount → apiClient.get('/orders/table/{id}/current')
  → order_router (JWT 인증)
    → OrderService.get_current_session_orders()
      → Table.session_id 조회
      → Orders WHERE session_id = ? (JOIN OrderItems)
    ← { orders: [...], session_total: N }
  ← HTTP 200
→ OrderCard[] 렌더링
```
