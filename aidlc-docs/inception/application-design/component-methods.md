# 컴포넌트 메서드 시그니처 (Component Methods)

> **Note**: 상세 비즈니스 로직은 Functional Design (CONSTRUCTION) 단계에서 정의합니다.

---

## 1. API 엔드포인트 (REST API)

### 1.1 Auth API (`/api/auth`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| POST | `/api/auth/admin/login` | 관리자 로그인 | `{store_identifier, username, password}` | `{access_token, token_type, expires_in}` |
| POST | `/api/auth/table/login` | 테이블 인증 | `{store_identifier, table_number, password}` | `{access_token, token_type, store_id, table_id}` |

### 1.2 Store API (`/api/stores`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| POST | `/api/stores` | 매장 등록 | `{name, identifier}` | `Store` |
| GET | `/api/stores/{store_id}` | 매장 조회 | - | `Store` |

### 1.3 Table API (`/api/stores/{store_id}/tables`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| GET | `/api/stores/{store_id}/tables` | 테이블 목록 | - | `Table[]` |
| POST | `/api/stores/{store_id}/tables` | 테이블 생성 | `{table_number, password}` | `Table` |
| PUT | `/api/stores/{store_id}/tables/{table_id}` | 테이블 수정 | `{table_number, password}` | `Table` |
| DELETE | `/api/stores/{store_id}/tables/{table_id}` | 테이블 삭제 | - | `204` |
| POST | `/api/stores/{store_id}/tables/{table_id}/complete` | 이용 완료 | - | `{message, completed_at}` |

### 1.4 Category API (`/api/stores/{store_id}/categories`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| GET | `/api/stores/{store_id}/categories` | 카테고리 목록 | - | `Category[]` |
| POST | `/api/stores/{store_id}/categories` | 카테고리 생성 | `{name, display_order}` | `Category` |
| PUT | `/api/stores/{store_id}/categories/{id}` | 카테고리 수정 | `{name, display_order}` | `Category` |
| DELETE | `/api/stores/{store_id}/categories/{id}` | 카테고리 삭제 | - | `204` |
| PUT | `/api/stores/{store_id}/categories/reorder` | 순서 변경 | `{category_ids: number[]}` | `Category[]` |

### 1.5 Menu API (`/api/stores/{store_id}/menus`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| GET | `/api/stores/{store_id}/menus` | 메뉴 목록 (카테고리별) | `?category_id=` | `Menu[]` |
| POST | `/api/stores/{store_id}/menus` | 메뉴 생성 | `FormData{name, price, description, category_id, image}` | `Menu` |
| PUT | `/api/stores/{store_id}/menus/{id}` | 메뉴 수정 | `FormData{name, price, description, category_id, image}` | `Menu` |
| DELETE | `/api/stores/{store_id}/menus/{id}` | 메뉴 삭제 | - | `204` |
| PUT | `/api/stores/{store_id}/menus/reorder` | 순서 변경 | `{menu_ids: number[]}` | `Menu[]` |

### 1.6 Order API (`/api/stores/{store_id}/orders`)

| Method | Endpoint | 설명 | Request | Response |
|---|---|---|---|---|
| POST | `/api/stores/{store_id}/orders` | 주문 생성 | `{table_id, session_id, items: [{menu_id, menu_name, quantity, unit_price}]}` | `Order` |
| GET | `/api/stores/{store_id}/orders` | 주문 목록 (관리자) | `?table_id=&status=` | `Order[]` |
| GET | `/api/stores/{store_id}/orders/table/{table_id}/current` | 현재 세션 주문 (고객) | - | `Order[]` |
| PUT | `/api/stores/{store_id}/orders/{id}/status` | 상태 변경 | `{status}` | `Order` |
| DELETE | `/api/stores/{store_id}/orders/{id}` | 주문 삭제 | - | `204` |
| GET | `/api/stores/{store_id}/orders/table/{table_id}/history` | 과거 내역 | `?date_from=&date_to=` | `OrderHistory[]` |

### 1.7 SSE API (`/api/stores/{store_id}/sse`)

| Method | Endpoint | 설명 | Response |
|---|---|---|---|
| GET | `/api/stores/{store_id}/sse/orders` | 주문 실시간 스트림 | `text/event-stream` |

### 1.8 Image API

| Method | Endpoint | 설명 | Response |
|---|---|---|---|
| GET | `/uploads/{filename}` | 이미지 파일 서빙 | `image/*` |

---

## 2. 서비스 레이어 메서드

### AuthService
```
authenticate_admin(store_identifier, username, password) -> TokenResponse
authenticate_table(store_identifier, table_number, password) -> TokenResponse
create_access_token(payload, expires_delta) -> str
verify_token(token) -> TokenPayload
hash_password(password) -> str
verify_password(plain, hashed) -> bool
check_login_attempts(identifier) -> bool
```

### StoreService
```
create_store(name, identifier) -> Store
get_store(store_id) -> Store
get_store_by_identifier(identifier) -> Store
```

### TableService
```
create_table(store_id, table_number, password) -> Table
get_tables(store_id) -> list[Table]
get_table(store_id, table_id) -> Table
update_table(store_id, table_id, data) -> Table
delete_table(store_id, table_id) -> None
start_session(store_id, table_id) -> Table
complete_session(store_id, table_id) -> Table
```

### CategoryService
```
create_category(store_id, name, display_order) -> Category
get_categories(store_id) -> list[Category]
update_category(store_id, category_id, data) -> Category
delete_category(store_id, category_id) -> None
reorder_categories(store_id, category_ids) -> list[Category]
```

### MenuService
```
create_menu(store_id, data, image_file) -> Menu
get_menus(store_id, category_id?) -> list[Menu]
get_menu(store_id, menu_id) -> Menu
update_menu(store_id, menu_id, data, image_file?) -> Menu
delete_menu(store_id, menu_id) -> None
reorder_menus(store_id, menu_ids) -> list[Menu]
```

### OrderService
```
create_order(store_id, table_id, session_id, items) -> Order
get_orders(store_id, table_id?, status?) -> list[Order]
get_current_session_orders(store_id, table_id) -> list[Order]
update_order_status(store_id, order_id, status) -> Order
delete_order(store_id, order_id) -> None
get_order_history(store_id, table_id, date_from?, date_to?) -> list[OrderHistory]
move_orders_to_history(store_id, table_id, session_id) -> None
get_table_total(store_id, table_id) -> float
```

### ImageService
```
upload_image(file) -> str  # returns URL path
delete_image(filename) -> None
get_image_path(filename) -> str
```

### SSEService
```
subscribe(store_id) -> AsyncGenerator[Event]
broadcast_order_event(store_id, event_type, order_data) -> None
```
