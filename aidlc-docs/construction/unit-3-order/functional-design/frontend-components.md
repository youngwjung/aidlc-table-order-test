# Unit 3: Customer Order Flow - Frontend Components

## Overview
Unit 3에서 구현하는 프론트엔드 컴포넌트의 구조, Props, 상태, 사용자 인터랙션을 정의합니다.

---

## 1. Context: cartContext

### 상태 (State)
```typescript
interface CartState {
  items: CartItem[];
  totalAmount: number;
  isLoading: boolean;
}

interface CartItem {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}
```

### Actions
```typescript
type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuId: number; menuName: string; price: number; imageUrl: string | null; quantity?: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuId: number; delta: number } }
  | { type: 'REMOVE_ITEM'; payload: { menuId: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'RESTORE_CART'; payload: { items: CartItem[] } }
  | { type: 'SET_LOADING'; payload: boolean };
```

### Provider 메서드
```typescript
interface CartContextValue {
  state: CartState;
  addItem: (menuId: number, menuName: string, price: number, imageUrl: string | null) => void;
  updateQuantity: (menuId: number, delta: number) => void;
  removeItem: (menuId: number) => void;
  clearCart: () => void;
  itemCount: number;  // 총 항목 수 (computed)
}
```

### localStorage 동기화
- 모든 상태 변경 시 `useEffect`로 localStorage에 자동 저장
- 초기 마운트 시 localStorage에서 복원
- 키: `cart_{storeId}_{tableId}` (authContext에서 storeId, tableId 참조)

---

## 2. 페이지 컴포넌트

### 2.1 CustomerCartPage (`/customer/cart`)

**책임**: 장바구니 표시, 수량 조절, 주문 제출

**상태**:
```typescript
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**UI 구조**:
```
CustomerCartPage
├── Header ("장바구니")
├── IF items.length === 0:
│   └── EmptyCartMessage ("장바구니가 비어있습니다")
├── ELSE:
│   ├── CartItem[] (각 항목)
│   ├── CartSummary (합계 + 주문 버튼)
│   └── ClearCartButton ("전체 삭제")
├── ConfirmModal (조건부 표시)
└── Navigation (메뉴로 돌아가기 링크)
```

**주요 인터랙션**:
- "주문하기" 클릭 → 확인 모달 표시
- 모달 "확인" 클릭 → API 호출 → 성공 시 /customer/order-success로 이동
- 모달 "취소" 클릭 → 모달 닫기

---

### 2.2 CustomerOrderSuccessPage (`/customer/order-success`)

**책임**: 주문 성공 확인, 자동 리다이렉트

**상태**:
```typescript
const [countdown, setCountdown] = useState(5);
```

**URL 파라미터**: `?orderNumber=001&totalAmount=25000`

**UI 구조**:
```
CustomerOrderSuccessPage
├── SuccessIcon (체크마크)
├── OrderNumber ("주문번호 #001")
├── TotalAmount ("총 금액: 25,000원")
├── CountdownMessage ("{n}초 후 메뉴로 이동합니다")
└── ManualRedirectButton ("메뉴로 돌아가기")
```

**로직**:
- 마운트 시 `setInterval`로 1초마다 countdown 감소
- countdown === 0 → `router.push('/customer/menu')` 
- 장바구니 초기화 (`clearCart()`)는 이 페이지 진입 시 실행

---

### 2.3 CustomerOrdersPage (`/customer/orders`)

**책임**: 현재 세션 주문 내역 표시

**상태**:
```typescript
const [orders, setOrders] = useState<OrderResponse[]>([]);
const [sessionTotal, setSessionTotal] = useState(0);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**UI 구조**:
```
CustomerOrdersPage
├── Header ("주문 내역")
├── SessionTotal ("이번 방문 총 금액: {sessionTotal}원")
├── IF isLoading:
│   └── LoadingSpinner
├── IF orders.length === 0:
│   └── EmptyMessage ("주문 내역이 없습니다")
├── ELSE:
│   └── OrderCard[] (각 주문)
└── Navigation (메뉴로 돌아가기)
```

**데이터 로딩**: 마운트 시 `GET /api/stores/{storeId}/orders/table/{tableId}/current` 호출

---

## 3. UI 컴포넌트

### 3.1 CartItem

**Props**:
```typescript
interface CartItemProps {
  menuId: number;
  menuName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  onUpdateQuantity: (menuId: number, delta: number) => void;
  onRemove: (menuId: number) => void;
}
```

**UI 구조**:
```
CartItem
├── ImageThumbnail (50x50, 또는 placeholder)
├── MenuInfo
│   ├── MenuName
│   └── UnitPrice ("9,000원")
├── QuantityControls
│   ├── MinusButton (-)
│   ├── QuantityDisplay (2)
│   └── PlusButton (+)
└── ItemTotal ("18,000원")
```

---

### 3.2 CartSummary

**Props**:
```typescript
interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
  onSubmit: () => void;
  isDisabled: boolean;
}
```

**UI 구조**:
```
CartSummary (하단 고정)
├── TotalInfo
│   ├── ItemCount ("3개 항목")
│   └── TotalAmount ("총 25,000원")
└── SubmitButton ("주문하기" - disabled when isDisabled)
```

---

### 3.3 OrderCard

**Props**:
```typescript
interface OrderCardProps {
  orderNumber: string;
  status: 'waiting' | 'preparing' | 'done';
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
}
```

**UI 구조**:
```
OrderCard
├── CardHeader
│   ├── OrderNumber ("주문 #001")
│   ├── StatusBadge
│   └── OrderTime ("12:30")
├── ItemList
│   └── ItemRow[] ("김치찌개 x2  18,000원")
└── CardFooter
    └── OrderTotal ("합계: 25,000원")
```

---

### 3.4 StatusBadge

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'waiting' | 'preparing' | 'done';
}
```

**스타일 매핑**:
| status | 라벨 | 색상 |
|---|---|---|
| waiting | 대기중 | yellow/amber |
| preparing | 준비중 | blue |
| done | 완료 | green |

---

### 3.5 ConfirmModal

**Props**:
```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;  // default: "확인"
  cancelLabel?: string;   // default: "취소"
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**사용처**:
- 주문 확인 모달 (주문 항목 요약 + "주문하시겠습니까?")
- 장바구니 전체 삭제 확인 ("장바구니를 비우시겠습니까?")

---

## 4. 네비게이션 플로우

```
메뉴 페이지 (/customer/menu)
    │
    ├── [메뉴 추가] → cartContext.addItem()
    │
    └── [장바구니] → 장바구니 페이지 (/customer/cart)
                        │
                        ├── [수량 조절] → cartContext.updateQuantity()
                        ├── [항목 삭제] → cartContext.removeItem()
                        ├── [전체 삭제] → 확인 모달 → cartContext.clearCart()
                        │
                        └── [주문하기] → 확인 모달 → API 호출
                                                      │
                                                      ├── 성공 → 주문 성공 (/customer/order-success)
                                                      │            │
                                                      │            └── 5초 → 메뉴 페이지로 리다이렉트
                                                      │
                                                      └── 실패 → 에러 표시, 장바구니 유지

주문 내역 (/customer/orders) ← 네비게이션 메뉴에서 접근
```

---

## 5. API 통합 포인트

| 컴포넌트 | API 호출 | 시점 |
|---|---|---|
| CustomerCartPage | `POST /api/stores/{storeId}/orders` | 주문 확인 시 |
| CustomerOrdersPage | `GET /api/stores/{storeId}/orders/table/{tableId}/current` | 페이지 마운트 |
| cartContext | 없음 (클라이언트 전용) | - |
