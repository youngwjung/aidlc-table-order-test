# 프론트엔드 컴포넌트 설계 - Unit 4: Admin Dashboard & Table Management

---

## 1. 페이지 컴포넌트

### 1.1 AdminDashboardPage (`/admin/dashboard/page.tsx`)

**책임**: 테이블별 주문 현황 그리드 대시보드

**상태 (State)**:
```typescript
tables: TableInfo[]              // 전체 테이블 목록
orders: Record<number, Order[]>  // table_id별 주문 목록
filter: number | null            // 선택된 테이블 번호 (null = 전체)
sseConnected: boolean            // SSE 연결 상태
```

**API 호출**:
- `GET /api/stores/{store_id}/tables` - 초기 테이블 목록
- `GET /api/stores/{store_id}/orders` - 초기 전체 주문
- SSE: `GET /api/stores/{store_id}/sse/orders` - 실시간 이벤트

**UI 구조**:
```
AdminLayout
  └── AdminDashboardPage
       ├── Header: "주문 모니터링"
       ├── SSE 연결 상태 배너 (연결 끊김 시만 표시)
       ├── 테이블 필터 드롭다운 (전체 / 테이블1 / 테이블2 / ...)
       └── 테이블 카드 그리드 (반응형)
            ├── TableCard (테이블 1)
            ├── TableCard (테이블 2)
            └── ...
```

**SSE 이벤트 핸들링**:
- `order_created`: 해당 테이블의 주문 목록에 추가, 알림음 재생
- `order_status_changed`: 해당 주문의 상태 업데이트
- `order_deleted`: 해당 주문 제거, 총액 재계산
- `table_completed`: 해당 테이블의 주문 목록 초기화

---

### 1.2 AdminTableDetailPage (`/admin/tables/[id]/page.tsx`)

**책임**: 특정 테이블의 전체 주문 목록 상세 보기 + 주문 관리

**상태 (State)**:
```typescript
table: TableInfo | null      // 테이블 정보
orders: Order[]              // 해당 테이블의 전체 주문
loading: boolean
```

**API 호출**:
- `GET /api/stores/{store_id}/orders?table_id={id}` - 테이블 주문
- `PUT /api/stores/{store_id}/orders/{orderId}/status` - 상태 변경
- `DELETE /api/stores/{store_id}/orders/{orderId}` - 주문 삭제
- `POST /api/stores/{store_id}/tables/{id}/complete` - 이용 완료

**UI 구조**:
```
AdminLayout
  └── AdminTableDetailPage
       ├── Header: "테이블 #{number}" + 세션 상태 배지
       ├── 요약 바: 총 주문액, 주문 수, 세션 시작 시각
       ├── 액션 버튼 영역
       │    ├── "이용 완료" 버튼 (세션 활성 시만)
       │    └── "과거 내역" 링크
       ├── 주문 목록
       │    └── 각 주문 카드:
       │         ├── 주문번호 + 시각
       │         ├── 메뉴 항목 리스트 (메뉴명 x 수량 = 금액)
       │         ├── 주문 총액
       │         ├── StatusBadge (상태 배지)
       │         ├── 상태 변경 버튼 (다음 상태로)
       │         └── 삭제 버튼 (🗑)
       └── ConfirmModal (삭제/이용완료 확인용)
```

**상태 변경 버튼 로직**:
- pending → "준비 시작" 버튼 표시
- preparing → "완료 처리" 버튼 표시
- completed → 버튼 없음 (최종 상태)

---

### 1.3 AdminOrderHistoryPage (`/admin/tables/[id]/history/page.tsx`)

**책임**: 특정 테이블의 과거 주문 내역 조회

**상태 (State)**:
```typescript
history: OrderHistory[]
dateFrom: string          // YYYY-MM-DD (기본: 7일 전)
dateTo: string            // YYYY-MM-DD (기본: 오늘)
loading: boolean
```

**API 호출**:
- `GET /api/stores/{store_id}/orders/table/{id}/history?date_from=&date_to=`

**UI 구조**:
```
AdminLayout
  └── AdminOrderHistoryPage
       ├── Header: "테이블 #{number} - 과거 내역"
       ├── 날짜 필터
       │    ├── 시작일 DatePicker
       │    ├── 종료일 DatePicker
       │    └── "조회" 버튼
       ├── 이력 목록
       │    └── 각 이력 카드:
       │         ├── 주문번호 + 주문 시각
       │         ├── 메뉴 항목 리스트
       │         ├── 총 금액
       │         └── 이용 완료 시각
       └── 빈 상태: "조회 기간에 내역이 없습니다"
```

---

### 1.4 AdminTableManagementPage (`/admin/tables/page.tsx`)

**책임**: 테이블 CRUD 관리

**상태 (State)**:
```typescript
tables: TableInfo[]
showForm: boolean          // 추가/수정 폼 표시
editingTable: TableInfo | null  // 수정 대상 (null이면 추가 모드)
formData: { table_number: string, password: string }
```

**API 호출**:
- `GET /api/stores/{store_id}/tables` - 목록
- `POST /api/stores/{store_id}/tables` - 생성
- `PUT /api/stores/{store_id}/tables/{id}` - 수정
- `DELETE /api/stores/{store_id}/tables/{id}` - 삭제

**UI 구조**:
```
AdminLayout
  └── AdminTableManagementPage
       ├── Header: "테이블 관리" + "테이블 추가" 버튼
       ├── 테이블 목록 (table_number 순)
       │    └── 각 테이블 행:
       │         ├── 테이블 번호
       │         ├── 비밀번호 (마스킹, 토글로 표시)
       │         ├── 세션 상태 (이용중/빈테이블)
       │         ├── 수정 버튼
       │         └── 삭제 버튼
       ├── 추가/수정 모달 폼
       │    ├── 테이블 번호 입력 (숫자, 1~999)
       │    ├── 비밀번호 입력
       │    ├── 저장 버튼
       │    └── 취소 버튼
       └── ConfirmModal (삭제 확인)
```

---

## 2. 공유 컴포넌트

### 2.1 TableCard (`/components/admin/table-card.tsx`)

**Props**:
```typescript
interface TableCardProps {
  table: TableInfo
  orders: Order[]
  isHighlighted: boolean    // 신규 주문 하이라이트
  onClick: () => void
}
```

**표시 내용**:
- 테이블 번호
- 세션 상태 배지 (이용중 초록 / 빈테이블 회색)
- 총 주문액 (원화 포맷)
- 최신 주문 3개 미리보기 (주문번호, StatusBadge, 금액)
- 주문 없으면 "주문 없음" 표시

**스타일**:
- 기본: 흰색 배경, 그림자
- 이용중: 좌측 초록색 보더
- 빈 테이블: 좌측 회색 보더
- 하이라이트: 배경 펄스 애니메이션 (2초간)

---

## 3. 커스텀 훅

### 3.1 useSSE (`/hooks/use-sse.ts`)

**인터페이스**:
```typescript
interface UseSSEOptions {
  storeId: number
  onOrderCreated: (order: Order) => void
  onOrderStatusChanged: (data: {order_id: number, table_id: number, status: string}) => void
  onOrderDeleted: (data: {order_id: number, table_id: number, deleted_amount: number}) => void
  onTableCompleted: (data: {table_id: number, table_number: number, completed_at: string}) => void
}

interface UseSSEReturn {
  connected: boolean
  error: string | null
}

function useSSE(options: UseSSEOptions): UseSSEReturn
```

**내부 로직**:
1. EventSource 생성: `/api/stores/{storeId}/sse/orders` + Authorization 헤더
2. `onmessage`: JSON 파싱 → event_type별 콜백 호출
3. `onerror`: 지수 백오프 재연결
   - 재시도 간격: 1s → 2s → 4s → 8s → 16s → 30s (최대)
   - 재연결 성공 시 간격 리셋
4. Heartbeat: 30초 이상 이벤트 없으면 연결 끊김 판정
5. Cleanup: 컴포넌트 unmount 시 EventSource.close()

**참고**: 브라우저 기본 EventSource는 Authorization 헤더를 지원하지 않으므로, fetch + ReadableStream 또는 query parameter 방식으로 토큰 전달 필요.
- 추천 방식: `GET /api/stores/{storeId}/sse/orders?token={jwt}` (query parameter)

---

## 4. 알림음 관리

### 4.1 알림음 재생 유틸리티

**구현**:
```typescript
// Web Audio API를 사용한 beep 사운드
function playNotificationSound(): void {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.2)
}
```

- 신규 주문(`order_created`) 이벤트 수신 시 호출
- 브라우저 자동재생 정책으로 인해 사용자 첫 인터랙션 후에만 동작

---

## 5. 페이지 라우팅 구조

```
/admin/dashboard          → AdminDashboardPage (기존 placeholder 교체)
/admin/tables             → AdminTableManagementPage (신규)
/admin/tables/[id]        → AdminTableDetailPage (신규)
/admin/tables/[id]/history → AdminOrderHistoryPage (신규)
```

**AdminLayout 네비게이션 업데이트**:
- Dashboard → `/admin/dashboard`
- Tables → `/admin/tables` (CRUD 관리)
- Menus → `/admin/menus` (Unit 2)
- Categories → `/admin/categories` (Unit 2)

---

## 6. TypeScript 타입 (추가 필요)

```typescript
// types/index.ts에 추가
interface SSEEvent {
  event_type: 'order_created' | 'order_status_changed' | 'order_deleted' | 'table_completed'
  data: any
  timestamp: string
}

interface OrderStatusChangeData {
  order_id: number
  table_id: number
  status: OrderStatus
}

interface OrderDeletedData {
  order_id: number
  table_id: number
  deleted_amount: number
}

interface TableCompletedData {
  table_id: number
  table_number: number
  completed_at: string
}

interface DateRange {
  dateFrom: string  // YYYY-MM-DD
  dateTo: string    // YYYY-MM-DD
}
```
