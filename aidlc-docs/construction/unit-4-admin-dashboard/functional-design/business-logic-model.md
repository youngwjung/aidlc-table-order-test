# 비즈니스 로직 모델 - Unit 4: Admin Dashboard & Table Management

---

## 1. SSE 실시간 주문 스트리밍 흐름

### 1.1 SSE 구독 (관리자 대시보드 연결)
```
관리자 대시보드 접속
  -> GET /api/stores/{store_id}/sse/orders
  -> Authorization: Bearer {admin_token}

  -> Step 1: 토큰 검증
     - JWT 유효성 확인
     - role == "admin" 확인
     - store_id 일치 확인

  -> Step 2: SSE 연결 수립
     - SSEService.subscribe(store_id)
     - 인메모리 구독자 목록에 추가
     - Content-Type: text/event-stream
     - Connection: keep-alive

  -> Step 3: 이벤트 대기 루프
     - AsyncGenerator로 이벤트 수신 대기
     - 이벤트 발생 시 -> SSE 형식으로 전송:
       data: {"event_type": "...", "data": {...}}
     - 30초마다 heartbeat ping 전송 (연결 유지)

  -> 연결 종료 시:
     - 구독자 목록에서 제거
     - 리소스 정리
```

### 1.2 SSE 이벤트 브로드캐스트
```
이벤트 발생 (주문 생성/상태변경/삭제/테이블완료)
  -> SSEService.broadcast_order_event(store_id, event_type, data)

  -> Step 1: 해당 store_id의 구독자 목록 조회
  -> Step 2: 각 구독자의 이벤트 큐에 메시지 추가
  -> Step 3: 구독자가 없으면 이벤트 폐기 (에러 아님)
```

### 1.3 SSE 이벤트 타입
| 이벤트 | 데이터 | 트리거 |
|---|---|---|
| `order_created` | Order 전체 (items 포함) | 고객 주문 생성 시 (Unit 3) |
| `order_status_changed` | `{order_id, status, table_id}` | 관리자 상태 변경 시 |
| `order_deleted` | `{order_id, table_id, deleted_amount}` | 관리자 주문 삭제 시 |
| `table_completed` | `{table_id, table_number, completed_at}` | 테이블 이용 완료 시 |

### 1.4 SSE 재연결 (프론트엔드)
```
SSE 연결 끊김 감지
  -> EventSource.onerror 이벤트
  -> 재연결 상태 표시: "실시간 연결이 끊어졌습니다. 재연결 중..."
  -> 지수 백오프 재연결:
     - 1차: 1초 후 재시도
     - 2차: 2초 후 재시도
     - 3차: 4초 후 재시도
     - ...
     - 최대 간격: 30초
  -> 재연결 성공 시:
     - 연결 상태 알림 해제
     - GET /api/stores/{store_id}/orders 로 전체 주문 데이터 동기화
     - (끊긴 동안 누락된 이벤트 복구)
  -> 재연결 실패 지속 시:
     - 알림 유지, 수동 새로고침 안내
```

---

## 2. 관리자 대시보드 조회 흐름

### 2.1 초기 데이터 로드
```
대시보드 페이지 진입
  -> Step 1: 테이블 목록 조회
     GET /api/stores/{store_id}/tables
     -> 전체 테이블 목록 (세션 정보 포함)

  -> Step 2: 전체 활성 주문 조회
     GET /api/stores/{store_id}/orders
     -> 모든 테이블의 현재 주문 목록

  -> Step 3: 데이터 조합
     - 테이블별로 주문을 그룹핑
     - 각 테이블의 총 주문액 계산
     - 최신 주문 3개 미리보기 추출

  -> Step 4: SSE 연결 수립
     - 실시간 업데이트 수신 시작
```

### 2.2 테이블 카드 표시 로직
```
각 테이블 카드:
  -> 테이블 번호
  -> 세션 상태:
     - session_id 있음 -> "이용중" (초록색)
     - session_id 없음 -> "빈 테이블" (회색)
  -> 총 주문액 (해당 테이블의 모든 활성 주문 합계)
  -> 최신 주문 3개 미리보기:
     - 주문번호, 상태 배지, 주문 금액
  -> 클릭 시 -> 테이블 상세 페이지로 이동
```

### 2.3 테이블별 필터링
```
대시보드 필터 선택
  -> "전체" 또는 특정 테이블 번호 선택
  -> 프론트엔드 클라이언트 사이드 필터링
  -> 선택된 테이블만 그리드에 표시
  -> 필터 해제 시 전체 테이블 복원
```

---

## 3. 주문 상세 보기 흐름

### 3.1 테이블 상세 페이지
```
테이블 카드 클릭
  -> /admin/tables/{table_id}

  -> Step 1: 테이블 정보 조회
     GET /api/stores/{store_id}/tables (캐시 활용 또는 개별 조회)

  -> Step 2: 해당 테이블 주문 목록 조회
     GET /api/stores/{store_id}/orders?table_id={table_id}

  -> Step 3: 주문 목록 표시
     - 주문 번호
     - 주문 시각
     - 메뉴 항목 목록 (메뉴명 x 수량)
     - 주문 금액
     - 상태 배지 (대기중/준비중/완료)
     - 상태 변경 버튼
     - 삭제 버튼

  -> Step 4: SSE 이벤트로 실시간 업데이트
     - 해당 테이블의 이벤트만 필터링 적용
```

---

## 4. 주문 상태 변경 흐름

### 4.1 상태 변경
```
관리자가 상태 변경 버튼 클릭
  -> PUT /api/stores/{store_id}/orders/{order_id}/status
     body: {status: "preparing" | "completed"}

  -> Step 1: 주문 조회
     - Order.id == order_id AND Order.store_id == store_id
     - 없음 -> 404 Not Found

  -> Step 2: 상태 전이 검증
     - 허용되는 전이:
       pending -> preparing (순방향만)
       preparing -> completed (순방향만)
     - 잘못된 전이 -> 400 Bad Request
       ("현재 상태에서 해당 상태로 변경할 수 없습니다")

  -> Step 3: 상태 업데이트
     - Order.status = new_status
     - DB 저장

  -> Step 4: SSE 브로드캐스트
     - SSEService.broadcast_order_event(
         store_id, "order_status_changed",
         {order_id, status: new_status, table_id}
       )

  -> Response: 업데이트된 Order
```

### 4.2 상태 전이 규칙
```
허용되는 상태 전이 (순방향만):

  pending ──→ preparing ──→ completed
  (대기중)    (준비중)      (완료)

금지되는 전이:
  - preparing -> pending (역방향 불가)
  - completed -> preparing (역방향 불가)
  - completed -> pending (역방향 불가)
  - pending -> completed (단계 건너뛰기 불가)
```

---

## 5. 주문 삭제 흐름

```
관리자가 주문 삭제 버튼 클릭
  -> 확인 팝업 표시:
     "주문 #{order_number}을(를) 삭제하시겠습니까?"
     [취소] [확인]

  -> "확인" 클릭:
     DELETE /api/stores/{store_id}/orders/{order_id}

  -> Step 1: 주문 조회
     - Order.id == order_id AND Order.store_id == store_id
     - 없음 -> 404 Not Found

  -> Step 2: 삭제 금액 기록
     - deleted_amount = order.total_amount
     - table_id = order.table_id

  -> Step 3: 주문 삭제
     - DB에서 Order + OrderItem 삭제 (CASCADE)

  -> Step 4: SSE 브로드캐스트
     - SSEService.broadcast_order_event(
         store_id, "order_deleted",
         {order_id, table_id, deleted_amount}
       )

  -> Response: 204 No Content

  -> 프론트엔드: 성공 토스트 "주문이 삭제되었습니다"

  -> 실패 시: 에러 토스트 "주문 삭제에 실패했습니다. 다시 시도해 주세요"
```

---

## 6. 테이블 CRUD 흐름

### 6.1 테이블 목록 조회
```
테이블 관리 페이지 진입
  -> GET /api/stores/{store_id}/tables
  -> 전체 테이블 목록 반환 (table_number 순 정렬)
```

### 6.2 테이블 생성
```
"테이블 추가" 버튼 클릭
  -> 입력 폼: 테이블 번호, 비밀번호
  -> POST /api/stores/{store_id}/tables
     body: {table_number, password}

  -> Step 1: 중복 검증
     - (store_id, table_number) 유니크 확인
     - 중복 -> 409 Conflict ("이미 존재하는 테이블 번호입니다")

  -> Step 2: 테이블 생성
     - Table 레코드 생성 (session_id = NULL)

  -> Response: Table
```

### 6.3 테이블 수정
```
테이블 수정 버튼 클릭
  -> PUT /api/stores/{store_id}/tables/{table_id}
     body: {table_number?, password?}

  -> Step 1: 테이블 조회
     - 없음 -> 404 Not Found

  -> Step 2: 중복 검증 (table_number 변경 시)
     - 중복 -> 409 Conflict

  -> Step 3: 업데이트
     - 제공된 필드만 업데이트

  -> Response: Table
```

### 6.4 테이블 삭제
```
테이블 삭제 버튼 클릭
  -> DELETE /api/stores/{store_id}/tables/{table_id}

  -> Step 1: 테이블 조회
     - 없음 -> 404 Not Found

  -> Step 2: 활성 세션 확인
     - session_id != NULL -> 400 Bad Request
       ("활성 세션이 있는 테이블은 삭제할 수 없습니다. 이용 완료 후 삭제해 주세요")

  -> Step 3: 현재 주문 확인
     - 해당 테이블에 활성 주문 존재 -> 400 Bad Request
       ("현재 주문이 있는 테이블은 삭제할 수 없습니다")

  -> Step 4: 삭제
     - DB에서 Table 삭제

  -> Response: 204 No Content
```

---

## 7. 테이블 이용 완료 (세션 종료) 흐름

```
관리자가 "이용 완료" 버튼 클릭
  -> 확인 팝업:
     미완료 주문 여부에 따라 다른 메시지:
     - 미완료 주문 없음: "테이블 #{number} 이용을 완료하시겠습니까?"
     - 미완료 주문 있음: "미완료 주문 {n}건이 있습니다. 그래도 이용 완료하시겠습니까?"
     [취소] [확인]

  -> "확인" 클릭:
     POST /api/stores/{store_id}/tables/{table_id}/complete

  -> Step 1: 테이블 조회
     - Table.store_id == store_id AND Table.id == table_id
     - 없음 -> 404 Not Found
     - session_id == NULL -> 400 Bad Request ("활성 세션이 없습니다")

  -> Step 2: 주문 이력 이동 (OrderService.move_orders_to_history)
     - 해당 테이블의 현재 세션(session_id) 주문 전체 조회
     - 각 주문 + OrderItem -> OrderHistory + OrderHistoryItem 복사
       - order_history.table_number = table.table_number (스냅샷)
       - order_history.ordered_at = order.created_at
       - order_history.completed_at = NOW()
     - 원본 Order + OrderItem 삭제

  -> Step 3: 세션 리셋
     - Table.session_id = NULL
     - Table.session_started_at = NULL

  -> Step 4: SSE 브로드캐스트
     - SSEService.broadcast_order_event(
         store_id, "table_completed",
         {table_id, table_number, completed_at}
       )

  -> Response: {message: "이용 완료 처리되었습니다", completed_at}
```

---

## 8. 과거 주문 내역 조회 흐름

```
테이블 상세 페이지에서 "과거 내역" 버튼 클릭
  -> /admin/tables/{table_id}/history

  -> GET /api/stores/{store_id}/orders/table/{table_id}/history
     ?date_from={YYYY-MM-DD}&date_to={YYYY-MM-DD}

  -> Step 1: 기본 날짜 범위 설정
     - date_from 미지정 -> 7일 전
     - date_to 미지정 -> 오늘

  -> Step 2: 이력 조회
     - OrderHistory WHERE store_id = ? AND table_id = ?
       AND completed_at BETWEEN date_from AND date_to+1일
     - OrderHistoryItem JOIN
     - completed_at DESC 정렬

  -> Step 3: 응답
     - 각 이력: order_number, table_number, total_amount,
       ordered_at, completed_at, items[]

  -> 프론트엔드: 날짜 범위 선택 UI
     - 시작일/종료일 date picker
     - 범위 변경 시 API 재호출
```

---

## 9. 관리자 주문 전체 조회 흐름

```
GET /api/stores/{store_id}/orders
  ?table_id={optional}&status={optional}

  -> Step 1: 기본 조회
     - Order WHERE store_id = store_id
     - OrderItem EAGER LOAD

  -> Step 2: 필터 적용
     - table_id 있음 -> AND table_id = ?
     - status 있음 -> AND status = ?

  -> Step 3: 정렬
     - created_at DESC (최신 주문 우선)

  -> Response: Order[] (items 포함)
```
