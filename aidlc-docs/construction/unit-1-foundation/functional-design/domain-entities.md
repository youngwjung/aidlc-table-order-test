# 도메인 엔티티 상세 - Unit 1: Foundation

> Unit 1에서는 전체 시스템의 DB 모델을 정의합니다. 이후 유닛에서 사용할 모델도 포함됩니다.

---

## Store (매장)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 매장 고유 ID |
| name | String(100) | NOT NULL | 매장명 |
| identifier | String(50) | NOT NULL, UNIQUE | 매장 식별자 (로그인용) |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | DateTime | NOT NULL, DEFAULT NOW, ON UPDATE | 수정 시각 |

**인덱스**: `identifier` (UNIQUE)

---

## AdminUser (관리자)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 관리자 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| username | String(50) | NOT NULL | 사용자명 |
| password_hash | String(255) | NOT NULL | bcrypt 해싱된 비밀번호 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

**복합 유니크**: `(store_id, username)` - 매장 내 사용자명 고유
**인덱스**: `store_id`

---

## Table (테이블)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 테이블 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| table_number | Integer | NOT NULL | 테이블 번호 |
| password | String(50) | NOT NULL | 테이블 비밀번호 (평문) |
| session_id | String(36) | NULLABLE | 현재 세션 UUID (NULL이면 비활성) |
| session_started_at | DateTime | NULLABLE | 세션 시작 시각 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

**복합 유니크**: `(store_id, table_number)` - 매장 내 테이블 번호 고유
**인덱스**: `store_id`

---

## Category (카테고리)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 카테고리 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| name | String(50) | NOT NULL | 카테고리명 |
| display_order | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

**복합 유니크**: `(store_id, name)` - 매장 내 카테고리명 고유
**인덱스**: `store_id`, `(store_id, display_order)`

---

## Menu (메뉴)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 메뉴 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| category_id | Integer | FK(categories.id), NOT NULL | 소속 카테고리 |
| name | String(100) | NOT NULL | 메뉴명 |
| price | Integer | NOT NULL, CHECK(price >= 0) | 가격 (원 단위) |
| description | Text | NULLABLE | 메뉴 설명 |
| image_url | String(500) | NULLABLE | 이미지 URL 경로 |
| display_order | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | DateTime | NOT NULL, DEFAULT NOW, ON UPDATE | 수정 시각 |

**인덱스**: `store_id`, `category_id`, `(store_id, category_id, display_order)`

---

## Order (주문)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 주문 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| table_id | Integer | FK(tables.id), NOT NULL | 주문 테이블 |
| session_id | String(36) | NOT NULL | 테이블 세션 ID |
| order_number | String(10) | NOT NULL | 주문 번호 (매장별 일일 순번, 예: "001") |
| status | String(20) | NOT NULL, DEFAULT 'pending' | 주문 상태: pending/preparing/completed |
| total_amount | Integer | NOT NULL, CHECK(>= 0) | 총 주문 금액 (원) |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 주문 시각 |

**복합 유니크**: `(store_id, order_number, created_at::date)` - 매장별 일일 주문 번호 고유
**인덱스**: `store_id`, `table_id`, `session_id`, `(store_id, status)`

**status 값**:
- `pending`: 대기중 (신규 주문)
- `preparing`: 준비중
- `completed`: 완료

---

## OrderItem (주문 항목)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 항목 고유 ID |
| order_id | Integer | FK(orders.id, ON DELETE CASCADE), NOT NULL | 소속 주문 |
| menu_name | String(100) | NOT NULL | 메뉴명 (스냅샷) |
| quantity | Integer | NOT NULL, CHECK(>= 1) | 수량 |
| unit_price | Integer | NOT NULL, CHECK(>= 0) | 단가 (스냅샷, 원) |

**인덱스**: `order_id`

> **Note**: menu_name과 unit_price는 주문 시점의 스냅샷. 메뉴 삭제/가격 변경 시에도 기존 주문 데이터 유지.

---

## OrderHistory (과거 주문 이력)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 이력 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| table_id | Integer | NOT NULL | 테이블 ID (FK 아님, 테이블 삭제 시에도 유지) |
| table_number | Integer | NOT NULL | 테이블 번호 (스냅샷) |
| session_id | String(36) | NOT NULL | 세션 ID |
| order_number | String(10) | NOT NULL | 주문 번호 |
| total_amount | Integer | NOT NULL | 총 금액 |
| ordered_at | DateTime | NOT NULL | 원래 주문 시각 |
| completed_at | DateTime | NOT NULL, DEFAULT NOW | 이용 완료 시각 |

**인덱스**: `store_id`, `(store_id, table_id)`, `(store_id, completed_at)`

---

## OrderHistoryItem (과거 주문 항목)

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 항목 고유 ID |
| order_history_id | Integer | FK(order_history.id, ON DELETE CASCADE), NOT NULL | 소속 이력 |
| menu_name | String(100) | NOT NULL | 메뉴명 |
| quantity | Integer | NOT NULL, CHECK(>= 1) | 수량 |
| unit_price | Integer | NOT NULL, CHECK(>= 0) | 단가 |

**인덱스**: `order_history_id`

---

## 엔티티 관계 다이어그램 (ERD)

```
Store (1) ----< AdminUser (N)
Store (1) ----< Table (N)
Store (1) ----< Category (N)
Store (1) ----< Menu (N)
Store (1) ----< Order (N)
Store (1) ----< OrderHistory (N)

Category (1) ----< Menu (N)

Table (1) ----< Order (N)

Order (1) ----< OrderItem (N)

OrderHistory (1) ----< OrderHistoryItem (N)
```

**멀티테넌트 격리**: 모든 엔티티가 store_id를 통해 매장에 귀속. 모든 쿼리에 store_id 조건 필수.
