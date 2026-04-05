# Unit 3: Customer Order Flow - Domain Entities

## Overview
Unit 3에서 다루는 도메인 엔티티는 크게 **서버 사이드(DB)** 엔티티와 **클라이언트 사이드** 엔티티로 나뉩니다.

---

## 1. 서버 사이드 엔티티 (Unit 3 관련)

### 1.1 Order (주문) - 기존 모델 활용
Unit 1에서 정의된 Order 모델을 그대로 사용합니다.

```
Order
├── id: Integer (PK, auto-increment)
├── store_id: Integer (FK → Store.id)
├── table_id: Integer (FK → Table.id)
├── session_id: String (UUID, 테이블 세션 식별)
├── order_number: String (매장별 일일 순번, "001", "002")
├── status: String (waiting | preparing | done)
├── total_amount: Integer (총 금액, 원 단위)
└── created_at: DateTime (주문 생성 시각)
```

**Unit 3 책임 범위**: `create_order`, `get_current_session_orders`, `get_table_total`
**Unit 4 책임 범위**: `update_order_status`, `delete_order`, `get_order_history`

### 1.2 OrderItem (주문 항목) - 기존 모델 활용
```
OrderItem
├── id: Integer (PK, auto-increment)
├── order_id: Integer (FK → Order.id)
├── menu_name: String (주문 시점 메뉴명 스냅샷)
├── quantity: Integer (1~99)
└── unit_price: Integer (주문 시점 단가 스냅샷)
```

### 1.3 Table (테이블) - 세션 관련 필드
```
Table (Unit 3에서 사용하는 필드)
├── session_id: String (nullable, UUID)
└── session_started_at: DateTime (nullable)
```

**Unit 3 책임**: `start_session()` - 첫 주문 시 세션 자동 시작

### 1.4 Menu (메뉴) - 읽기 전용 참조
주문 제출 시 메뉴 유효성 검증을 위해 참조합니다.
```
Menu (읽기 전용)
├── id: Integer (PK)
├── store_id: Integer
├── name: String
├── price: Integer
└── image_url: String (nullable)
```

---

## 2. 클라이언트 사이드 엔티티

### 2.1 CartItem (장바구니 항목)
localStorage에 저장되는 클라이언트 전용 엔티티입니다.

```
CartItem
├── menuId: number (Menu.id 참조)
├── menuName: string (표시용 메뉴명)
├── price: number (단가)
├── quantity: number (1~99)
└── imageUrl: string | null (썸네일 이미지)
```

### 2.2 Cart (장바구니 상태)
```
Cart
├── items: CartItem[] (장바구니 항목 목록)
├── storeId: number (현재 매장 ID)
└── tableId: number (현재 테이블 ID)
```

**localStorage 키**: `cart_{storeId}_{tableId}`

### 2.3 OrderResponse (주문 응답)
서버에서 반환하는 주문 생성 결과입니다.
```
OrderResponse
├── id: number
├── orderNumber: string ("001", "042" 등)
├── status: string
├── totalAmount: number
├── items: OrderItemResponse[]
└── createdAt: string (ISO 8601)
```

### 2.4 OrderItemResponse
```
OrderItemResponse
├── id: number
├── menuName: string
├── quantity: number
└── unitPrice: number
```

---

## 3. 엔티티 관계도

```
[Client Side]                         [Server Side]
                                      
CartItem ──────────────────────────── Menu (읽기 참조)
  │ menuId → Menu.id                    │
  │ price snapshot at add time          │ id, name, price
  │                                     │
Cart ─── submit order ──────────────→ Order
  │ items[]                             │ store_id, table_id
  │ storeId, tableId                    │ session_id, order_number
  │                                     │ status, total_amount
  │                                     │
  │                                     ├── OrderItem[]
  │                                     │   menu_name (snapshot)
  │                                     │   quantity, unit_price
  │                                     │
  └── localStorage persistence          └── Table.session_id
                                            (auto-start on first order)
```

---

## 4. 데이터 생명주기

| 엔티티 | 생성 시점 | 소멸 시점 |
|---|---|---|
| CartItem | 고객이 메뉴 추가 | 주문 성공 시 장바구니 초기화 |
| Cart | 첫 메뉴 추가 또는 localStorage 복원 | 주문 성공 시 초기화 |
| Order | 주문 제출 API 호출 | Admin이 세션 종료 시 History로 이동 (Unit 4) |
| OrderItem | Order와 함께 생성 | Order와 함께 이동 |
| Table.session | 첫 주문 시 자동 시작 | Admin이 세션 종료 (Unit 4) |
