# 인프라 설계 - Unit 4: Admin Dashboard & Table Management

> Unit 1에서 구성된 Docker Compose 인프라를 그대로 사용합니다.
> Unit 4는 인프라 변경 없이 기존 컨테이너 내에서 동작합니다.

---

## 1. 인프라 변경 사항

### 변경 없음
Unit 4는 기존 Unit 1 인프라를 그대로 활용:
- **Backend**: 기존 FastAPI 컨테이너에 새 라우터/서비스 추가
- **Frontend**: 기존 Next.js 컨테이너에 새 페이지/컴포넌트 추가
- **Database**: 기존 PostgreSQL 컨테이너, 테이블 스키마 이미 생성됨

### 추가 인프라 불필요
- SSE: FastAPI StreamingResponse (추가 서비스 불필요)
- 이벤트 큐: 인메모리 asyncio.Queue (Redis 불필요)
- 이미지: Unit 2에서 처리 (Unit 4 범위 외)

---

## 2. 배포 아키텍처 (Unit 1 동일)

```
+-------------------+     +-------------------+     +-------------------+
| Frontend          |     | Backend           |     | PostgreSQL        |
| (Next.js)         |     | (FastAPI)         |     | (Database)        |
| Port: 3000        |---->| Port: 8000        |---->| Port: 5432        |
|                   |     |                   |     |                   |
| + Dashboard Page  |     | + SSE Router      |     | orders            |
| + Table Detail    |     | + Table Router    |     | order_items       |
| + Order History   |     | + Order Service   |     | order_history     |
| + Table Mgmt      |     | + SSE Service     |     | order_history_items|
| + useSSE Hook     |     | + Table Service   |     | tables            |
+-------------------+     +-------------------+     +-------------------+
         |                         |
         |   SSE (text/event-stream)
         |<------------------------|
```

---

## 3. SSE 연결 관련 인프라 고려사항

### 3.1 프록시 타임아웃
- Docker Compose 내부 통신이므로 프록시 없음
- Heartbeat (30초)로 연결 유지
- 프로덕션 배포 시 nginx/ALB의 proxy_read_timeout 설정 필요 (60초+)

### 3.2 동시 연결
- SSE 연결은 HTTP 장기 연결
- 매장당 관리자 1~3명 예상 → SSE 연결 1~3개
- FastAPI의 async 처리로 동시 연결 부담 없음

---

## 4. 데이터베이스 인덱스 (기존 스키마)

Unit 4에서 활용하는 주요 인덱스 (Unit 1에서 이미 생성):
- `orders(store_id, status)` - 상태별 주문 조회
- `orders(store_id, table_id)` - 테이블별 주문 조회 (암시적)
- `orders(session_id)` - 세션별 주문 조회 (이용 완료 시)
- `order_history(store_id, table_id)` - 테이블별 이력 조회
- `order_history(store_id, completed_at)` - 날짜별 이력 조회
- `tables(store_id, table_number)` - 테이블 번호 유니크
