# 비즈니스 로직 모델 - Unit 2: Menu & Category Management

---

## 1. 카테고리 CRUD 흐름

### 1.1 카테고리 목록 조회
```
관리자/고객 -> GET /api/stores/{store_id}/categories
  -> CategoryService.get_categories(store_id)
  -> DB: SELECT * FROM categories WHERE store_id = ? ORDER BY display_order ASC
  -> Response: Category[] (display_order 순)
```

### 1.2 카테고리 생성
```
관리자 -> POST /api/stores/{store_id}/categories
  body: {name, display_order}

  -> Step 1: 인증 확인 (role == "admin", JWT store_id 일치)
  -> Step 2: 입력값 검증
     - name: 필수, 1~50자
     - display_order: 0 이상 정수 (기본값 0)
  -> Step 3: 중복 검사
     - 동일 store_id + name 조합 존재 여부 확인
     - 존재 시 -> 409 Conflict "이미 존재하는 카테고리명입니다"
  -> Step 4: DB INSERT
  -> Response: Category
```

### 1.3 카테고리 수정
```
관리자 -> PUT /api/stores/{store_id}/categories/{category_id}
  body: {name?, display_order?}

  -> Step 1: 인증 확인
  -> Step 2: 카테고리 존재 확인 (store_id + category_id)
     - 없음 -> 404 "카테고리를 찾을 수 없습니다"
  -> Step 3: 이름 변경 시 중복 검사
     - 동일 store_id + name 조합 존재 (자기 자신 제외)
     - 존재 시 -> 409 Conflict
  -> Step 4: DB UPDATE (변경된 필드만)
  -> Response: Category
```

### 1.4 카테고리 삭제
```
관리자 -> DELETE /api/stores/{store_id}/categories/{category_id}

  -> Step 1: 인증 확인
  -> Step 2: 카테고리 존재 확인
     - 없음 -> 404
  -> Step 3: 메뉴 존재 확인
     - SELECT COUNT(*) FROM menus WHERE category_id = ? AND store_id = ?
     - 메뉴 존재 시 -> 400 "해당 카테고리에 메뉴가 있어 삭제할 수 없습니다"
  -> Step 4: DB DELETE
  -> Response: 204 No Content
```

### 1.5 카테고리 순서 변경
```
관리자 -> PUT /api/stores/{store_id}/categories/reorder
  body: {category_ids: [3, 1, 2]}  // 원하는 순서대로 ID 배열

  -> Step 1: 인증 확인
  -> Step 2: 유효성 검증
     - 모든 category_id가 해당 store_id에 존재하는지 확인
     - 해당 매장의 전체 카테고리 수와 배열 길이 일치 확인
  -> Step 3: 순서 업데이트
     - category_ids 배열의 인덱스를 display_order로 설정
     - category_ids[0] -> display_order = 0
     - category_ids[1] -> display_order = 1
     - ... (일괄 UPDATE)
  -> Response: Category[] (새 순서 반영)
```

---

## 2. 메뉴 CRUD 흐름

### 2.1 메뉴 목록 조회
```
관리자/고객 -> GET /api/stores/{store_id}/menus?category_id=
  -> MenuService.get_menus(store_id, category_id?)
  -> DB: SELECT * FROM menus WHERE store_id = ?
         [AND category_id = ?]  // 카테고리 필터 (선택)
         ORDER BY display_order ASC
  -> Response: Menu[]
```

### 2.2 메뉴 생성
```
관리자 -> POST /api/stores/{store_id}/menus
  Content-Type: multipart/form-data
  body: FormData{name, price, description?, category_id, display_order?, image?}

  -> Step 1: 인증 확인 (role == "admin")
  -> Step 2: 입력값 검증
     - name: 필수, 1~100자
     - price: 필수, 0 이상, 10,000,000 이하
     - category_id: 필수, 해당 store_id의 카테고리에 존재 확인
     - description: 선택
     - display_order: 0 이상 (기본값 0)
  -> Step 3: 카테고리 존재 확인
     - 해당 store_id + category_id 조합 존재 여부
     - 없음 -> 400 "존재하지 않는 카테고리입니다"
  -> Step 4: 이미지 처리 (이미지 파일 있는 경우)
     - ImageService.upload_image(file) -> image_url
  -> Step 5: DB INSERT (image_url 포함)
  -> Response: Menu
```

### 2.3 메뉴 수정
```
관리자 -> PUT /api/stores/{store_id}/menus/{menu_id}
  Content-Type: multipart/form-data
  body: FormData{name?, price?, description?, category_id?, display_order?, image?}

  -> Step 1: 인증 확인
  -> Step 2: 메뉴 존재 확인 (store_id + menu_id)
     - 없음 -> 404 "메뉴를 찾을 수 없습니다"
  -> Step 3: category_id 변경 시 카테고리 존재 확인
  -> Step 4: 이미지 처리 (새 이미지 파일 있는 경우)
     - 기존 이미지가 있으면 ImageService.delete_image(old_filename)
     - ImageService.upload_image(new_file) -> new_image_url
  -> Step 5: DB UPDATE (변경된 필드만)
  -> Response: Menu
```

### 2.4 메뉴 삭제
```
관리자 -> DELETE /api/stores/{store_id}/menus/{menu_id}

  -> Step 1: 인증 확인
  -> Step 2: 메뉴 존재 확인
     - 없음 -> 404
  -> Step 3: 이미지 삭제 (이미지 있는 경우)
     - ImageService.delete_image(filename)
  -> Step 4: DB DELETE
  -> Response: 204 No Content
```

### 2.5 메뉴 순서 변경
```
관리자 -> PUT /api/stores/{store_id}/menus/reorder
  body: {menu_ids: [5, 3, 1, 4, 2]}

  -> Step 1: 인증 확인
  -> Step 2: 유효성 검증
     - 모든 menu_id가 해당 store_id에 존재하는지 확인
  -> Step 3: 순서 업데이트
     - menu_ids 배열의 인덱스를 display_order로 설정
     - 일괄 UPDATE
  -> Response: Menu[] (새 순서 반영)
```

---

## 3. 이미지 관리 흐름

### 3.1 이미지 업로드
```
ImageService.upload_image(file: UploadFile) -> str

  -> Step 1: 파일 유효성 검증
     - Content-Type 확인: image/jpeg, image/png, image/webp만 허용
     - 파일 크기 확인: 5MB 이하
     - 파일 크기 초과 시 -> 400 "파일 크기는 5MB 이하여야 합니다"
     - 허용되지 않는 형식 -> 400 "JPEG, PNG, WebP 형식만 허용됩니다"
  -> Step 2: 고유 파일명 생성
     - UUID v4 + 원본 확장자 (예: "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg")
  -> Step 3: 파일 저장
     - 저장 경로: uploads/{uuid_filename}
  -> Step 4: URL 경로 반환
     - 반환값: "/uploads/{uuid_filename}"
```

### 3.2 이미지 삭제
```
ImageService.delete_image(filename: str) -> None

  -> Step 1: 파일 경로 구성
     - uploads/{filename}
  -> Step 2: 파일 존재 확인
     - 없으면 무시 (에러 발생하지 않음)
  -> Step 3: 파일 삭제
```

### 3.3 이미지 서빙
```
GET /uploads/{filename}

  -> FastAPI StaticFiles 미들웨어로 처리
  -> uploads/ 디렉토리에서 정적 파일 서빙
  -> 파일 없음 -> 404
```

---

## 4. 고객 메뉴 조회 흐름

### 4.1 메뉴 화면 진입
```
고객 태블릿 -> CustomerMenuPage 로드

  -> Step 1: 카테고리 목록 조회
     - GET /api/stores/{store_id}/categories
     - 첫 번째 카테고리 자동 선택 (또는 "전체" 탭)

  -> Step 2: 선택된 카테고리의 메뉴 조회
     - GET /api/stores/{store_id}/menus?category_id={id}
     - 메뉴 카드 형태로 표시

  -> Step 3: 카테고리 탭 클릭 시
     - 해당 카테고리 ID로 메뉴 재조회
     - 활성 카테고리 시각적 강조
```

### 4.2 메뉴 상세 보기
```
고객 -> 메뉴 카드 터치

  -> MenuDetailModal 표시
     - 메뉴명, 가격, 설명, 이미지
     - 이미지 없으면 플레이스홀더 표시
     - "담기" 버튼

  -> "담기" 버튼 터치
     - cartContext.addItem({menuId, menuName, unitPrice, quantity: 1, imageUrl})
     - 이미 장바구니에 있으면 수량 +1
     - Toast: "장바구니에 추가되었습니다"
```

### 4.3 메뉴 카드에서 바로 담기
```
고객 -> 메뉴 카드의 "담기" 버튼 터치

  -> cartContext.addItem({menuId, menuName, unitPrice, quantity: 1, imageUrl})
  -> Toast: "장바구니에 추가되었습니다"
  -> 모달 표시 없이 즉시 처리
```

---

## 5. 에러 처리 흐름

### 5.1 메뉴 로드 실패 (CS-ERR-03)
```
고객 -> CustomerMenuPage 로드

  -> API 호출 실패 (네트워크/서버 오류)
  -> 에러 상태 표시:
     - "메뉴를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요"
     - "새로고침" 버튼 표시
  -> "새로고침" 버튼 클릭 시 API 재호출
```

### 5.2 메뉴 등록/수정 실패 (AD-ERR-04)
```
관리자 -> 메뉴 저장 시도

  -> API 호출 실패
  -> 에러 메시지 표시 (Toast)
  -> 폼 입력 내용 유지 (초기화하지 않음)
  -> 사용자가 수정 후 재시도 가능
```

### 5.3 이미지 업로드 실패 (AD-ERR-05)
```
관리자 -> 이미지 포함 메뉴 저장 시도

  -> 이미지 업로드 실패
  -> "이미지 업로드에 실패했습니다" 에러 메시지
  -> 선택지:
     a) 이미지 없이 저장 (이미지 필드 제거 후 재시도)
     b) 다른 이미지로 재시도
  -> 폼 입력 내용 유지
```
