# 도메인 엔티티 상세 - Unit 4: Admin Dashboard & Table Management

> Unit 4에서 활용하는 엔티티 정의. 모델 자체는 Unit 1에서 생성 완료되어 있으며, 여기서는 Unit 4에서 사용하는 관점에서 상세를 정리합니다.

---

## 1. Unit 4에서 조작하는 엔티티

### Order (주문) - 읽기/수정/삭제

Unit 4에서 담당하는 OrderService 메서드:
- `get_orders(store_id, table_id?, status?)` - 관리자 전체 조회
- `update_order_status(store_id, order_id, status)` - 상태 변경
- `delete_order(store_id, order_id)` - 주문 삭제
- `get_order_history(store_id, table_id, date_from?, date_to?)` - 이력 조회
- `move_orders_to_history(store_id, table_id, session_id)` - 이력 이동

| 필드 | 사용 방식 |
|---|---|
| id | 주문 식별 (상태 변경, 삭제 시) |
| store_id | 멀티테넌트 필터링 |
| table_id | 테이블별 주문 그룹핑, 필터링 |
| session_id | 이용 완료 시 세션 단위 이력 이동 |
| order_number | 대시보드/상세 표시 |
| status | 상태 전이 관리 (pending → preparing → completed) |
| total_amount | 테이블별 총액 계산, 삭제 시 차감액 |
| created_at | 정렬, 주문 시각 표시 |

### OrderItem (주문 항목) - 읽기 전용

| 필드 | 사용 방식 |
|---|---|
| menu_name | 주문 상세 표시 |
| quantity | 주문 상세 표시 |
| unit_price | 주문 상세 표시 |

---

### Table (테이블) - CRUD + 세션 관리

Unit 4에서 담당하는 TableService 메서드:
- `create_table(store_id, table_number, password)` - 생성
- `get_tables(store_id)` - 목록 조회
- `get_table(store_id, table_id)` - 단건 조회
- `update_table(store_id, table_id, data)` - 수정
- `delete_table(store_id, table_id)` - 삭제
- `complete_session(store_id, table_id)` - 이용 완료

| 필드 | 사용 방식 |
|---|---|
| id | 테이블 식별 |
| store_id | 멀티테넌트 필터링 |
| table_number | CRUD, 대시보드 표시, 이력 스냅샷 |
| password | CRUD (관리자가 설정/수정) |
| session_id | 세션 상태 확인, 이용 완료 시 리셋 |
| session_started_at | 세션 시작 시각 표시, 이용 완료 시 리셋 |

---

### OrderHistory (과거 주문 이력) - 생성/읽기

| 필드 | 사용 방식 |
|---|---|
| id | 이력 식별 |
| store_id | 멀티테넌트 필터링 |
| table_id | 테이블별 이력 조회 |
| table_number | 표시용 (스냅샷) |
| session_id | 세션 단위 그룹핑 |
| order_number | 표시용 |
| total_amount | 표시용 |
| ordered_at | 원래 주문 시각 표시 |
| completed_at | 이용 완료 시각, 날짜 필터 기준 |

### OrderHistoryItem (과거 주문 항목) - 생성/읽기

| 필드 | 사용 방식 |
|---|---|
| order_history_id | 이력과 연결 |
| menu_name | 표시용 |
| quantity | 표시용 |
| unit_price | 표시용 |

---

## 2. SSE 이벤트 데이터 모델 (인메모리)

SSE 이벤트는 DB에 저장하지 않으며, 인메모리 큐로 관리합니다.

### SSEEvent
```
{
  event_type: string       # "order_created" | "order_status_changed" | "order_deleted" | "table_completed"
  data: object             # 이벤트별 데이터 (아래 참조)
  timestamp: datetime      # 이벤트 발생 시각
}
```

### 이벤트별 데이터 구조

#### order_created
```
{
  id: number
  store_id: number
  table_id: number
  session_id: string
  order_number: string
  status: "pending"
  total_amount: number
  created_at: string
  items: [
    {menu_name: string, quantity: number, unit_price: number}
  ]
}
```

#### order_status_changed
```
{
  order_id: number
  table_id: number
  status: "preparing" | "completed"
}
```

#### order_deleted
```
{
  order_id: number
  table_id: number
  deleted_amount: number
}
```

#### table_completed
```
{
  table_id: number
  table_number: number
  completed_at: string
}
```

---

## 3. 엔티티 관계 (Unit 4 관점)

```
Table (1) ----< Order (N)        [table_id]
                  |
                  +----< OrderItem (N)   [order_id, CASCADE]

Table (1) ....< OrderHistory (N)  [table_id, FK 아님]
                  |
                  +----< OrderHistoryItem (N)  [order_history_id, CASCADE]

Store (1) ----< Table (N)
Store (1) ----< Order (N)
Store (1) ----< OrderHistory (N)
```

**이동 흐름 (이용 완료 시):**
```
Order + OrderItem  ──복사──>  OrderHistory + OrderHistoryItem
       |
       └──삭제──>  (제거됨)
```

---

## 4. SSE 구독자 관리 구조 (인메모리)

```
SSEService 내부:
  subscribers: Dict[int, List[asyncio.Queue]]
  # key: store_id
  # value: 해당 매장을 구독 중인 클라이언트 큐 목록

  subscribe(store_id) -> AsyncGenerator:
    queue = asyncio.Queue()
    subscribers[store_id].append(queue)
    try:
      while True:
        event = await queue.get()
        yield event
    finally:
      subscribers[store_id].remove(queue)

  broadcast(store_id, event_type, data):
    for queue in subscribers.get(store_id, []):
      await queue.put(SSEEvent(event_type, data, now()))
```
