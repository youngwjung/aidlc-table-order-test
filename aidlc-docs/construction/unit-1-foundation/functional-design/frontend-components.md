# 프론트엔드 컴포넌트 상세 - Unit 1: Foundation

---

## 1. 초기 설정 화면 (SetupPage)

**경로**: `/setup`
**조건**: 매장이 하나도 없을 때만 접근 가능

### Props/State
```typescript
interface SetupFormState {
  storeName: string;
  storeIdentifier: string;
  adminUsername: string;
  adminPassword: string;
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름
1. 앱 진입 시 `GET /api/stores/check-setup` 호출
2. 매장 없음 → `/setup`으로 리다이렉트
3. 4개 필드 입력 → "매장 설정 완료" 버튼
4. `POST /api/stores/setup` 호출
5. 성공 → `/admin/login`으로 리다이렉트
6. 실패 → 에러 메시지 표시

### 검증 규칙
- 매장명: 필수, 1~100자
- 매장 식별자: 필수, 영문소문자+숫자+하이픈, 3~30자
- 사용자명: 필수, 영문소문자+숫자+언더스코어, 2~30자
- 비밀번호: 필수, 4자 이상

---

## 2. 관리자 로그인 페이지 (AdminLoginPage)

**경로**: `/admin/login`

### Props/State
```typescript
interface LoginFormState {
  storeIdentifier: string;
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름
1. 3개 필드 입력 → "로그인" 버튼
2. `POST /api/auth/admin/login` 호출
3. 성공 → authContext에 토큰 저장 → localStorage에 토큰 저장 → `/admin/dashboard`로 리다이렉트
4. 실패 → 에러 메시지 표시 ("매장 식별자, 사용자명 또는 비밀번호가 올바르지 않습니다" 또는 "잠시 후 다시 시도해 주세요")

### API 연동
- `POST /api/auth/admin/login`

---

## 3. 고객 태블릿 설정 페이지 (CustomerSetupPage)

**경로**: `/customer/setup`

### Props/State
```typescript
interface CustomerSetupState {
  storeIdentifier: string;
  tableNumber: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름
1. 관리자가 태블릿에서 3개 필드 입력 → "설정" 버튼
2. `POST /api/auth/table/login` 호출
3. 성공 → localStorage에 {store_identifier, table_number, password, access_token} 저장 → `/customer/menu`로 리다이렉트
4. 실패 → 에러 메시지 표시

### API 연동
- `POST /api/auth/table/login`

---

## 4. authContext (인증 컨텍스트)

### State 구조
```typescript
interface AuthState {
  token: string | null;
  user: {
    id: number;
    storeId: number;
    role: "admin" | "table";
    tableNumber?: number;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };
```

### 주요 기능
- **초기화**: localStorage에서 토큰 복원 → JWT 디코딩하여 user 정보 설정
- **login(token)**: 토큰 저장, user 정보 추출, localStorage 저장
- **logout()**: 토큰/user 제거, localStorage 클리어, 로그인 페이지 리다이렉트
- **토큰 만료 감지**: API 응답 401 시 자동 logout()

---

## 5. apiClient (API 통신 래퍼)

### 구조
```typescript
interface ApiClientConfig {
  baseUrl: string;  // 환경변수에서 로드
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface ApiError {
  detail: string;
  errors?: { field: string; message: string }[];
}
```

### 주요 기능
- **기본 설정**: baseUrl, Content-Type 헤더
- **인증 헤더 자동 추가**: localStorage에서 토큰 읽어 `Authorization: Bearer {token}` 추가
- **에러 처리**: 401 → logout 트리거, 기타 → ApiError 반환
- **메서드**: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`, `upload<T>()` (FormData용)

---

## 6. AdminLayout (관리자 레이아웃)

### 구조
```
+------------------------------------------+
| 상단 헤더: 매장명 | 로그아웃 버튼         |
+--------+---------------------------------+
| 사이드  | 콘텐츠 영역                     |
| 바      |                                 |
|         |                                 |
| - 대시  |    {children}                   |
|   보드  |                                 |
| - 테이  |                                 |
|   블    |                                 |
| - 메뉴  |                                 |
| - 카테  |                                 |
|   고리  |                                 |
+---------+---------------------------------+
```

### Props
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}
```

### 네비게이션 항목
- 주문 대시보드 (`/admin/dashboard`)
- 테이블 관리 (`/admin/tables`)
- 메뉴 관리 (`/admin/menus`)
- 카테고리 관리 (`/admin/categories`)

### 기능
- 인증 확인: authContext에서 role === "admin" 확인, 미인증 시 로그인 페이지 리다이렉트
- 현재 활성 메뉴 하이라이트
- 로그아웃 버튼: authContext.logout() 호출

---

## 7. CustomerLayout (고객 레이아웃)

### 구조
```
+------------------------------------------+
| 상단 헤더: 테이블 번호                     |
+------------------------------------------+
|                                          |
|             콘텐츠 영역                    |
|             {children}                    |
|                                          |
+------------------------------------------+
| 하단 탭: 메뉴 | 장바구니 | 주문내역       |
+------------------------------------------+
```

### Props
```typescript
interface CustomerLayoutProps {
  children: React.ReactNode;
}
```

### 탭 네비게이션
- 메뉴 (`/customer/menu`) - 아이콘: 목록
- 장바구니 (`/customer/cart`) - 아이콘: 장바구니 + 뱃지(담긴 수량)
- 주문내역 (`/customer/orders`) - 아이콘: 영수증

### 기능
- 인증 확인: authContext에서 role === "table" 확인, 미인증 시 설정 페이지 리다이렉트
- 상단 헤더에 "테이블 {번호}" 표시
- 하단 탭 현재 활성 탭 하이라이트
- 장바구니 탭에 담긴 항목 수 뱃지 표시 (cartContext에서 가져옴)

---

## 8. 공통 UI 컴포넌트

### Toast
```typescript
interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;  // 기본 3000ms
  onClose: () => void;
}
```

### ConfirmModal
```typescript
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;  // 기본 "확인"
  cancelText?: string;   // 기본 "취소"
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### StatusBadge
```typescript
interface StatusBadgeProps {
  status: "pending" | "preparing" | "completed";
}
// pending: 노란색 "대기중"
// preparing: 파란색 "준비중"
// completed: 초록색 "완료"
```

---

## 9. TypeScript 타입 정의 (types/index.ts)

```typescript
// 엔티티 타입
interface Store { id: number; name: string; identifier: string; }
interface AdminUser { id: number; storeId: number; username: string; }
interface Table { id: number; storeId: number; tableNumber: number; sessionId: string | null; sessionStartedAt: string | null; }
interface Category { id: number; storeId: number; name: string; displayOrder: number; }
interface Menu { id: number; storeId: number; categoryId: number; name: string; price: number; description: string | null; imageUrl: string | null; displayOrder: number; }
interface Order { id: number; storeId: number; tableId: number; sessionId: string; orderNumber: string; status: OrderStatus; totalAmount: number; createdAt: string; items: OrderItem[]; }
interface OrderItem { id: number; orderId: number; menuName: string; quantity: number; unitPrice: number; }
interface OrderHistory { id: number; storeId: number; tableId: number; tableNumber: number; sessionId: string; orderNumber: string; totalAmount: number; orderedAt: string; completedAt: string; items: OrderHistoryItem[]; }
interface OrderHistoryItem { id: number; orderHistoryId: number; menuName: string; quantity: number; unitPrice: number; }

// Enum
type OrderStatus = "pending" | "preparing" | "completed";
type UserRole = "admin" | "table";

// Auth
interface TokenResponse { access_token: string; token_type: string; expires_in?: number; store_id?: number; table_id?: number; }
interface TokenPayload { sub: number; store_id: number; role: UserRole; table_number?: number; exp: number; }

// Cart
interface CartItem { menuId: number; menuName: string; unitPrice: number; quantity: number; imageUrl: string | null; }
```
