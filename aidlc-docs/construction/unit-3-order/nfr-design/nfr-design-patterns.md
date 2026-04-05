# NFR 설계 패턴 - Unit 3: Customer Order Flow

> Unit 1 Foundation 설계 패턴을 상속하며, Unit 3 특화 패턴을 추가합니다.

---

## 1. 클라이언트 사이드 상태 관리 패턴

### 1.1 Reducer 패턴 (장바구니)
- **패턴**: `useReducer` + Context API
- **적용 대상**: 장바구니 상태 (CartState)
- **장점**: 복잡한 상태 전환 로직을 순수 함수로 관리, 예측 가능
- **구현**:
  ```
  CartProvider
    ├── useReducer(cartReducer, initialState)
    ├── useEffect → localStorage 동기화 (상태 변경 감지)
    └── useEffect → localStorage 복원 (초기 마운트)
  ```

### 1.2 Persistence 패턴 (localStorage)
- **패턴**: State Hydration / Dehydration
- **적용 대상**: 장바구니 데이터
- **구현**:
  - Hydration: 초기 마운트 시 localStorage → 상태 복원
  - Dehydration: 상태 변경 시 상태 → localStorage 저장
  - 키 네이밍: `cart_{storeId}_{tableId}` (매장+테이블 격리)
  - 에러 처리: JSON 파싱 실패 시 빈 상태로 초기화

---

## 2. 서버 사이드 패턴

### 2.1 단일 트랜잭션 패턴 (주문 생성)
- **패턴**: Unit of Work (단일 DB 트랜잭션)
- **적용 대상**: OrderService.create_order()
- **범위**: 세션 시작 + 주문 생성 + 주문 항목 생성
- **구현**:
  ```
  async with db.begin():
    1. 테이블 세션 확인/시작
    2. 주문 레코드 생성
    3. 주문 항목 레코드 생성
    # 모두 성공 시 자동 커밋, 실패 시 자동 롤백
  ```

### 2.2 서버 검증 패턴 (메뉴 유효성)
- **패턴**: Server-Side Validation
- **적용 대상**: 주문 생성 시 메뉴 항목 검증
- **구현**:
  ```
  FOR EACH item IN request.items:
    menu = await db.get(Menu, item.menu_id)
    IF menu IS NULL OR menu.store_id != store_id:
      invalid_items.append(item.menu_id)
    ELSE:
      validated_price = menu.price  # 서버 가격 적용
  ```
- **근거**: 클라이언트 데이터를 신뢰하지 않음, 가격 조작 방지

### 2.3 순번 생성 패턴 (주문번호)
- **패턴**: Sequential Counter with Retry
- **적용 대상**: 매장별 일일 주문번호
- **구현**: 
  - COUNT 쿼리 + 1로 순번 생성
  - 동시성 충돌 시 최대 3회 재시도
  - 3자리 형식 (zero-pad)

---

## 3. UI 패턴

### 3.1 Optimistic UI (장바구니)
- **패턴**: 클라이언트 즉시 반영
- **적용 대상**: 장바구니 추가/수량 변경/삭제
- **구현**: API 호출 없이 클라이언트 상태만 변경 → 즉시 UI 반영
- **근거**: 장바구니는 서버에 저장하지 않으므로 실패 가능성 없음

### 3.2 Pessimistic UI (주문 제출)
- **패턴**: 서버 응답 대기 후 반영
- **적용 대상**: 주문 생성 API 호출
- **구현**: 
  1. 버튼 비활성화 + 로딩 스피너 표시
  2. API 호출
  3. 성공 → 성공 페이지 이동 + 장바구니 초기화
  4. 실패 → 에러 표시 + 장바구니 보존 + 버튼 재활성화

### 3.3 Countdown Redirect 패턴
- **패턴**: Timer-based Auto-redirect
- **적용 대상**: 주문 성공 페이지
- **구현**: 
  - `setInterval(1초)` 카운트다운
  - 0 도달 시 `router.push` + interval cleanup
  - 컴포넌트 언마운트 시 interval cleanup (메모리 누수 방지)

---

## 4. 에러 처리 패턴

### 4.1 Graceful Degradation
- **적용 대상**: localStorage 복원 실패
- **구현**: JSON 파싱 실패 시 빈 장바구니로 시작 (사용자에게 알림 없음)

### 4.2 Error Boundary with Retry
- **적용 대상**: 주문 제출 실패
- **구현**: 에러 메시지 표시 + 재시도 가능 + 데이터 보존

### 4.3 Input Prevention
- **적용 대상**: 빈 장바구니 주문 방지
- **구현**: 버튼 `disabled` 속성으로 원천 차단
