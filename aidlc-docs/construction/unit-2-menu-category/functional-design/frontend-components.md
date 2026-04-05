# 프론트엔드 컴포넌트 상세 - Unit 2: Menu & Category Management

---

## 1. CustomerMenuPage (고객 메뉴 화면)

**경로**: `/customer/menu`
**레이아웃**: CustomerLayout 내부

### 구조
```
+------------------------------------------+
| CustomerLayout 헤더 (테이블 번호)         |
+------------------------------------------+
| [전체] [카테고리1] [카테고리2] [카테고리3]  |  <- CategoryTabs (상단 고정)
+------------------------------------------+
|                                          |
| +--------+ +--------+ +--------+        |
| |MenuCard| |MenuCard| |MenuCard|        |
| |  이미지 | |  이미지 | |  이미지 |        |
| |  메뉴명 | |  메뉴명 | |  메뉴명 |        |
| |  가격   | |  가격   | |  가격   |        |
| | [담기]  | | [담기]  | | [담기]  |        |
| +--------+ +--------+ +--------+        |
|                                          |
| +--------+ +--------+                   |
| |MenuCard| |MenuCard|                   |
| +--------+ +--------+                   |
|                                          |
+------------------------------------------+
| 하단 탭: 메뉴 | 장바구니 | 주문내역       |
+------------------------------------------+
```

### State
```typescript
interface CustomerMenuPageState {
  categories: Category[];
  menus: Menu[];
  selectedCategoryId: number | null;  // null = "전체"
  selectedMenu: Menu | null;          // 모달용
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름
1. 페이지 로드 시 카테고리 목록 + 전체 메뉴 조회
2. 카테고리 탭 클릭 → 해당 카테고리 메뉴만 필터링 표시
3. "전체" 탭 클릭 → 모든 카테고리 메뉴 표시
4. 메뉴 카드 "담기" 버튼 → 장바구니에 추가 + Toast
5. 메뉴 카드 본체 클릭 → MenuDetailModal 표시
6. API 실패 시 에러 메시지 + "새로고침" 버튼 표시

### API 연동
- `GET /api/stores/{store_id}/categories`
- `GET /api/stores/{store_id}/menus?category_id={id}`

---

## 2. CategoryTabs (카테고리 탭 컴포넌트)

### Props
```typescript
interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}
```

### 동작
- 가로 스크롤 가능한 탭 바
- "전체" 탭 (categoryId = null) + 각 카테고리 탭
- 선택된 탭 시각적 강조 (배경색, 하단 보더)
- display_order 순 정렬

---

## 3. MenuCard (메뉴 카드 컴포넌트)

### Props
```typescript
interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
  onClick: (menu: Menu) => void;
}
```

### 구조
```
+------------------+
|   [이미지]        |  <- 이미지 없으면 플레이스홀더
|                  |
|  메뉴명          |
|  ₩12,000        |  <- 가격 포맷팅 (천 단위 콤마)
|  [담기]          |  <- 버튼, onClick 이벤트 전파 중단
+------------------+
```

### 동작
- 카드 전체 클릭 → `onClick(menu)` (상세 모달 열기)
- "담기" 버튼 클릭 → `onAddToCart(menu)` (이벤트 전파 중단: e.stopPropagation)
- 이미지 로딩 실패 시 플레이스홀더 표시

---

## 4. MenuDetailModal (메뉴 상세 모달)

### Props
```typescript
interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
  onAddToCart: (menu: Menu) => void;
}
```

### 구조
```
+----------------------------------+
|                            [X]   |  <- 닫기 버튼
|  +----------------------------+  |
|  |        큰 이미지            |  |
|  +----------------------------+  |
|                                  |
|  메뉴명                          |
|  ₩12,000                        |
|                                  |
|  메뉴 설명 텍스트...              |
|                                  |
|  [장바구니에 담기]                 |  <- 전체 너비 버튼
+----------------------------------+
```

### 동작
- 오버레이 배경 클릭 또는 X 버튼 → 모달 닫기
- "장바구니에 담기" 클릭 → `onAddToCart(menu)` → Toast → 모달 닫기
- 이미지 없으면 플레이스홀더 이미지 표시
- 설명 없으면 설명 영역 미표시

---

## 5. AdminCategoryManagementPage (관리자 카테고리 관리)

**경로**: `/admin/categories`
**레이아웃**: AdminLayout 내부

### 구조
```
+------------------------------------------+
| 카테고리 관리                    [+ 추가]  |
+------------------------------------------+
| #  | 카테고리명     | 순서 |    작업      |
|----|---------------|------|-------------|
| 1  | [메인 메뉴   ] | [^][v]| [삭제]     |
| 2  | [사이드      ] | [^][v]| [삭제]     |
| 3  | [음료        ] | [^][v]| [삭제]     |
| -- | [새 카테고리 ] |       | [저장][취소]|  <- 추가 모드
+------------------------------------------+
```

### State
```typescript
interface AdminCategoryPageState {
  categories: Category[];
  editingId: number | null;          // 수정 중인 카테고리 ID
  editingName: string;               // 수정 중인 카테고리명
  isAdding: boolean;                 // 추가 모드 여부
  newCategoryName: string;           // 새 카테고리명
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름 - 카테고리 추가
1. "+ 추가" 버튼 클릭 → 목록 하단에 인라인 입력 행 추가
2. 카테고리명 입력 → "저장" 클릭
3. `POST /api/stores/{store_id}/categories` 호출
4. 성공 → 목록에 추가, Toast "카테고리가 추가되었습니다"
5. 실패 → 에러 Toast, 입력 유지

### 사용자 흐름 - 카테고리 수정
1. 카테고리명 텍스트를 클릭하면 인라인 편집 모드 활성화
2. 이름 수정 후 Enter 또는 포커스 아웃 시 저장
3. `PUT /api/stores/{store_id}/categories/{id}` 호출
4. 성공 → 목록 갱신, Toast "카테고리가 수정되었습니다"

### 사용자 흐름 - 카테고리 삭제
1. "삭제" 버튼 클릭 → ConfirmModal 표시
2. 확인 클릭 → `DELETE /api/stores/{store_id}/categories/{id}`
3. 메뉴 존재 시 → 에러 Toast "해당 카테고리에 메뉴가 있어 삭제할 수 없습니다"
4. 성공 → 목록에서 제거, Toast "카테고리가 삭제되었습니다"

### 사용자 흐름 - 순서 변경
1. 위/아래 화살표 버튼 클릭
2. 클라이언트에서 순서 변경 (배열 내 위치 교환)
3. `PUT /api/stores/{store_id}/categories/reorder` 호출
4. 성공 → 목록 순서 갱신

### API 연동
- `GET /api/stores/{store_id}/categories`
- `POST /api/stores/{store_id}/categories`
- `PUT /api/stores/{store_id}/categories/{id}`
- `DELETE /api/stores/{store_id}/categories/{id}`
- `PUT /api/stores/{store_id}/categories/reorder`

---

## 6. AdminMenuManagementPage (관리자 메뉴 관리)

**경로**: `/admin/menus`
**레이아웃**: AdminLayout 내부

### 구조
```
+------------------------------------------+
| 메뉴 관리                       [+ 추가]  |
+------------------------------------------+
| 카테고리 필터:                             |
| [전체] [메인메뉴] [사이드] [음료]           |
+------------------------------------------+
| 이미지 | 메뉴명 | 가격  | 카테고리 | 순서  | 작업        |
|--------|-------|-------|---------|------|------------|
| [img]  | 불고기 | 15000 | 메인    | [^][v]| [수정][삭제]|
| [img]  | 김치찌 | 12000 | 메인    | [^][v]| [수정][삭제]|
| [없음] | 콜라   | 3000  | 음료    | [^][v]| [수정][삭제]|
+------------------------------------------+
```

### State
```typescript
interface AdminMenuPageState {
  categories: Category[];
  menus: Menu[];
  selectedCategoryId: number | null;
  isModalOpen: boolean;
  editingMenu: Menu | null;           // null이면 신규 등록 모드
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 흐름 - 메뉴 조회
1. 페이지 로드 시 카테고리 목록 + 전체 메뉴 조회
2. 카테고리 필터 클릭 → 해당 카테고리 메뉴만 표시

### 사용자 흐름 - 메뉴 추가
1. "+ 추가" 버튼 클릭 → 메뉴 등록/수정 모달 열기 (editingMenu = null)
2. 필드 입력: 메뉴명, 가격, 설명, 카테고리 선택, 이미지 업로드
3. "저장" 클릭 → `POST /api/stores/{store_id}/menus` (FormData)
4. 성공 → 모달 닫기, 목록 갱신, Toast
5. 실패 → 에러 Toast, 폼 유지

### 사용자 흐름 - 메뉴 수정
1. "수정" 버튼 클릭 → 모달 열기 (editingMenu = 선택된 메뉴)
2. 기존 정보가 채워진 폼 표시
3. 수정 후 "저장" → `PUT /api/stores/{store_id}/menus/{id}` (FormData)

### 사용자 흐름 - 메뉴 삭제
1. "삭제" 버튼 클릭 → ConfirmModal
2. 확인 → `DELETE /api/stores/{store_id}/menus/{id}`
3. 성공 → 목록에서 제거, Toast

### 사용자 흐름 - 순서 변경
1. 위/아래 화살표 클릭
2. `PUT /api/stores/{store_id}/menus/reorder`

### API 연동
- `GET /api/stores/{store_id}/categories`
- `GET /api/stores/{store_id}/menus?category_id={id}`
- `POST /api/stores/{store_id}/menus`
- `PUT /api/stores/{store_id}/menus/{id}`
- `DELETE /api/stores/{store_id}/menus/{id}`
- `PUT /api/stores/{store_id}/menus/reorder`

---

## 7. MenuFormModal (메뉴 등록/수정 모달)

### Props
```typescript
interface MenuFormModalProps {
  menu: Menu | null;                  // null이면 신규 등록
  categories: Category[];
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}
```

### State
```typescript
interface MenuFormState {
  name: string;
  price: string;                      // 문자열로 입력 받고 숫자 변환
  description: string;
  categoryId: number | null;
  imageFile: File | null;
  imagePreview: string | null;        // 미리보기 URL
  errors: Record<string, string>;     // 필드별 에러
  isSubmitting: boolean;
}
```

### 구조
```
+----------------------------------+
| 메뉴 등록 (또는 메뉴 수정)   [X]  |
+----------------------------------+
|                                  |
|  메뉴명 *                        |
|  [________________]              |
|                                  |
|  가격 (원) *                     |
|  [________________]              |
|                                  |
|  설명                            |
|  [________________]              |
|  [________________]              |
|                                  |
|  카테고리 *                      |
|  [드롭다운 선택    v]             |
|                                  |
|  이미지                          |
|  +---ImageUploader---+          |
|  | [미리보기 영역]    |          |
|  | [파일 선택]        |          |
|  +-------------------+          |
|                                  |
|        [취소]  [저장]             |
+----------------------------------+
```

### 검증
- 메뉴명: 필수, 빈 값 -> "메뉴명을 입력해 주세요"
- 가격: 필수, 숫자만, 0 이상 -> "유효한 가격을 입력해 주세요"
- 카테고리: 필수, 미선택 -> "카테고리를 선택해 주세요"
- 검증 실패 시 저장 차단, 필드 아래 에러 메시지

---

## 8. ImageUploader (이미지 업로더 컴포넌트)

### Props
```typescript
interface ImageUploaderProps {
  currentImageUrl: string | null;     // 기존 이미지 URL (수정 시)
  onFileSelect: (file: File | null) => void;
}
```

### State
```typescript
interface ImageUploaderState {
  previewUrl: string | null;
  isDragOver: boolean;
}
```

### 구조
```
+---------------------------+
|  +---------------------+  |
|  |                     |  |  <- 미리보기 영역
|  |   [이미지 미리보기]   |  |     - 선택된 파일 미리보기
|  |   또는 플레이스홀더   |  |     - 또는 기존 이미지
|  |                     |  |     - 또는 "이미지를 선택하세요"
|  +---------------------+  |
|                           |
|  [파일 선택] [제거]        |  <- 파일 input (hidden) + 버튼
+---------------------------+
```

### 동작
- 파일 선택 → 미리보기 표시 (URL.createObjectURL)
- 기존 이미지 URL → 미리보기 표시
- "제거" 클릭 → 미리보기 제거, `onFileSelect(null)`
- 허용 형식: accept="image/jpeg,image/png,image/webp"
