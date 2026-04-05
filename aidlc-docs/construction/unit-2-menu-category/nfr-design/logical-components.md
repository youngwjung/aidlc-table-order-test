# 논리적 컴포넌트 - Unit 2: Menu & Category Management

---

## 1. ImageService 컴포넌트

### 책임
- 이미지 파일 업로드 (검증 + UUID 명명 + 비동기 저장)
- 이미지 파일 삭제 (비동기)
- 파일 경로 관리

### 인터페이스
```
ImageService:
  ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
  MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
  UPLOAD_DIR = "uploads"

  async upload_image(file: UploadFile) -> str
    - 입력: FastAPI UploadFile 객체
    - 출력: URL 경로 문자열 (예: "/uploads/uuid.jpg")
    - 에러: ValueError (형식/크기 초과)

  async delete_image(filename: str) -> None
    - 입력: 파일명 (uuid.ext)
    - 동작: 파일 존재 시 삭제, 없으면 무시

  get_image_path(filename: str) -> str
    - 입력: 파일명
    - 출력: 파일 시스템 절대 경로
```

### 의존성
- `aiofiles`: 비동기 파일 I/O
- `uuid`: UUID v4 생성
- `os.path`: 경로 처리

---

## 2. CategoryService 컴포넌트

### 책임
- 카테고리 CRUD 비즈니스 로직
- 카테고리 순서 관리
- 삭제 시 메뉴 존재 여부 검증

### 인터페이스
```
CategoryService:
  async create_category(db, store_id, data: CategoryCreate) -> Category
  async get_categories(db, store_id) -> list[Category]
  async get_category(db, store_id, category_id) -> Category
  async update_category(db, store_id, category_id, data: CategoryUpdate) -> Category
  async delete_category(db, store_id, category_id) -> None
  async reorder_categories(db, store_id, category_ids: list[int]) -> list[Category]
  async has_menus(db, store_id, category_id) -> bool
```

### 의존성
- SQLAlchemy AsyncSession (DB)
- Menu 모델 (메뉴 존재 확인용)

---

## 3. MenuService 컴포넌트

### 책임
- 메뉴 CRUD 비즈니스 로직
- 메뉴 순서 관리
- 이미지 업로드/삭제 오케스트레이션

### 인터페이스
```
MenuService:
  async create_menu(db, store_id, data: MenuCreate, image: UploadFile?) -> Menu
  async get_menus(db, store_id, category_id?) -> list[Menu]
  async get_menu(db, store_id, menu_id) -> Menu
  async update_menu(db, store_id, menu_id, data: MenuUpdate, image: UploadFile?) -> Menu
  async delete_menu(db, store_id, menu_id) -> None
  async reorder_menus(db, store_id, menu_ids: list[int]) -> list[Menu]
```

### 의존성
- SQLAlchemy AsyncSession (DB)
- ImageService (이미지 처리)
- Category 모델 (카테고리 존재 확인용)

---

## 4. API 라우터 컴포넌트

### Category Router (`/api/stores/{store_id}/categories`)
```
category_router:
  GET    /                    -> get_categories()    [admin, table]
  POST   /                    -> create_category()   [admin]
  PUT    /{category_id}       -> update_category()   [admin]
  DELETE /{category_id}       -> delete_category()   [admin]
  PUT    /reorder             -> reorder_categories() [admin]
```

### Menu Router (`/api/stores/{store_id}/menus`)
```
menu_router:
  GET    /                    -> get_menus()          [admin, table]
  POST   /                    -> create_menu()        [admin] (FormData)
  PUT    /{menu_id}           -> update_menu()        [admin] (FormData)
  DELETE /{menu_id}           -> delete_menu()        [admin]
  PUT    /reorder             -> reorder_menus()      [admin]
```

### FormData 처리 패턴
```python
# 메뉴 생성/수정은 JSON이 아닌 FormData로 처리 (이미지 포함)
@router.post("/")
async def create_menu(
    store_id: int,
    name: str = Form(...),
    price: int = Form(...),
    description: str = Form(None),
    category_id: int = Form(...),
    display_order: int = Form(0),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin),
):
```

---

## 5. 프론트엔드 논리적 컴포넌트

### API 호출 함수 (lib/api-client.ts 확장)
```
apiClient 확장:
  upload<T>(url, formData) -> Promise<T>
    - Content-Type: multipart/form-data 자동 설정
    - Authorization 헤더 자동 추가
```

### 가격 포맷팅 유틸리티
```
formatPrice(price: number) -> string
  - Intl.NumberFormat('ko-KR') 사용
  - 예: 15000 -> "15,000원"
```

---

## 6. 컴포넌트 의존성 다이어그램

```
category_router -----> CategoryService -----> DB (Category, Menu)
                                        |
menu_router ---------> MenuService -----+--> DB (Menu, Category)
                            |
                            +----------> ImageService --> File System (uploads/)

StaticFiles ("/uploads") ----------------> File System (uploads/)
```
