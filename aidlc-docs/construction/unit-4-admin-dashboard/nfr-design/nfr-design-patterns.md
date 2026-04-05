# NFR 설계 패턴 - Unit 4: Admin Dashboard & Table Management

---

## 1. SSE 실시간 통신 패턴

### 1.1 서버측 SSE 구현 패턴
```
SSEService (싱글톤):
  subscribers: Dict[int, List[asyncio.Queue]]

  async subscribe(store_id):
    queue = asyncio.Queue(maxsize=100)
    subscribers.setdefault(store_id, []).append(queue)
    try:
      while True:
        event = await asyncio.wait_for(queue.get(), timeout=30)
        yield event
    except asyncio.TimeoutError:
      yield heartbeat_event  # {"event_type": "ping"}
    finally:
      subscribers[store_id].remove(queue)

  async broadcast(store_id, event_type, data):
    for queue in subscribers.get(store_id, []):
      try:
        queue.put_nowait(SSEEvent(event_type, data))
      except asyncio.QueueFull:
        pass  # 느린 클라이언트 이벤트 드롭
```

### 1.2 클라이언트측 재연결 패턴 (지수 백오프)
```
useSSE 훅 내부:

  retryDelay = 1000  # 초기 1초
  maxDelay = 30000   # 최대 30초

  connect():
    fetch(sseUrl)
    reader = response.body.getReader()
    retryDelay = 1000  # 성공 시 리셋

  onError():
    setTimeout(connect, retryDelay)
    retryDelay = min(retryDelay * 2, maxDelay)
```

### 1.3 데이터 동기화 패턴
- SSE 재연결 성공 시 → `GET /orders` 전체 조회로 상태 동기화
- 클라이언트는 SSE 이벤트를 낙관적으로 적용하되, 전체 조회로 정합성 보장

---

## 2. 낙관적 UI 업데이트 패턴

### 2.1 주문 상태 변경
```
1. 버튼 클릭 → UI 즉시 업데이트 (낙관적)
2. API 호출 (PUT /orders/{id}/status)
3. 성공 → Toast "상태가 변경되었습니다"
4. 실패 → UI 롤백 + Toast "상태 변경에 실패했습니다"
```

### 2.2 주문 삭제
```
1. 확인 팝업 → 확인 클릭
2. API 호출 (DELETE /orders/{id})
3. 성공 → 주문 목록에서 제거 + 총액 재계산 + Toast
4. 실패 → Toast "주문 삭제에 실패했습니다"
```

---

## 3. 트랜잭션 패턴 (이용 완료)

### 3.1 원자적 세션 종료
```python
async def complete_session(store_id, table_id):
    async with db.begin():  # 단일 트랜잭션
        # 1. 주문 조회
        orders = await get_orders_by_session(...)
        # 2. OrderHistory + OrderHistoryItem 생성
        for order in orders:
            history = create_history(order)
            for item in order.items:
                create_history_item(history, item)
        # 3. 원본 주문 삭제
        await delete_orders_by_session(...)
        # 4. 세션 리셋
        table.session_id = None
        table.session_started_at = None
    # 트랜잭션 커밋 후 SSE 브로드캐스트
    await sse_service.broadcast(...)
```

---

## 4. 멀티테넌트 격리 패턴

### 4.1 서비스 레이어 격리
- 모든 서비스 메서드의 첫 번째 파라미터: `store_id`
- 모든 DB 쿼리에 `WHERE store_id = ?` 조건 필수
- JWT 미들웨어에서 store_id 추출 → request.state에 주입

### 4.2 SSE 격리
- 구독 키: store_id
- 브로드캐스트: store_id별 구독자에게만 전달

---

## 5. 에러 처리 패턴

### 5.1 API 에러 응답 표준
| 상황 | HTTP 코드 | 메시지 |
|---|---|---|
| 주문 없음 | 404 | "주문을 찾을 수 없습니다" |
| 잘못된 상태 전이 | 400 | "현재 상태에서 해당 상태로 변경할 수 없습니다" |
| 활성 세션 없음 | 400 | "활성 세션이 없습니다" |
| 활성 세션 있는 테이블 삭제 | 400 | "활성 세션이 있는 테이블은 삭제할 수 없습니다" |
| 테이블 번호 중복 | 409 | "이미 존재하는 테이블 번호입니다" |
| 권한 없음 | 403 | "접근 권한이 없습니다" |

### 5.2 프론트엔드 에러 핸들링
- API 에러 → Toast 메시지 (에러 내용 표시)
- 네트워크 에러 → Toast "네트워크 오류가 발생했습니다"
- SSE 끊김 → 배너 알림 + 자동 재연결
