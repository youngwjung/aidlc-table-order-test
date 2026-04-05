# 도메인 엔티티 상세 - Unit 2: Menu & Category Management

> Unit 1에서 Category, Menu 모델이 이미 정의/구현되었습니다. 이 문서는 Unit 2에서 사용하는 엔티티를 확인하고 보완합니다.

---

## Category (카테고리) - Unit 1 정의 확인

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 카테고리 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| name | String(50) | NOT NULL | 카테고리명 |
| display_order | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |

**복합 유니크**: `(store_id, name)` - 매장 내 카테고리명 고유
**관계**: Store(1) -> Category(N), Category(1) -> Menu(N)
**변경 없음**: Unit 1 정의 그대로 사용

---

## Menu (메뉴) - Unit 1 정의 확인

| 필드 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | Integer | PK, Auto Increment | 메뉴 고유 ID |
| store_id | Integer | FK(stores.id), NOT NULL | 소속 매장 |
| category_id | Integer | FK(categories.id), NOT NULL | 소속 카테고리 |
| name | String(100) | NOT NULL | 메뉴명 |
| price | Integer | NOT NULL, CHECK(price >= 0) | 가격 (원 단위) |
| description | Text | NULLABLE | 메뉴 설명 |
| image_url | String(500) | NULLABLE | 이미지 URL 경로 |
| display_order | Integer | NOT NULL, DEFAULT 0 | 표시 순서 |
| created_at | DateTime | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | DateTime | NOT NULL, DEFAULT NOW, ON UPDATE | 수정 시각 |

**관계**: Store(1) -> Menu(N), Category(1) -> Menu(N)
**변경 없음**: Unit 1 정의 그대로 사용

---

## 이미지 파일 관리 (파일 시스템 기반)

> 이미지는 DB 엔티티가 아닌 파일 시스템에서 관리됩니다.

### 저장 구조
```
uploads/
  {uuid}.jpg
  {uuid}.png
  {uuid}.webp
```

### 이미지-메뉴 연결
- Menu.image_url 필드에 `/uploads/{uuid}.{ext}` 형태로 저장
- image_url이 NULL이면 이미지 미등록 메뉴
- 메뉴 삭제 시 연결된 이미지 파일도 삭제 (best-effort)

---

## Pydantic 스키마 - Unit 1 정의 확인

### Category 스키마
- **CategoryCreate**: `{name: str, display_order: int}`
- **CategoryUpdate**: `{name?: str, display_order?: int}`
- **CategoryResponse**: `{id, store_id, name, display_order}`
- **CategoryReorderRequest**: `{category_ids: list[int]}`

### Menu 스키마
- **MenuCreate**: `{name: str, price: int, description?: str, category_id: int, display_order: int}`
- **MenuUpdate**: `{name?: str, price?: int, description?: str, category_id?: int, display_order?: int}`
- **MenuResponse**: `{id, store_id, category_id, name, price, description, image_url, display_order}`
- **MenuReorderRequest**: `{menu_ids: list[int]}`

> Note: 메뉴 생성/수정 시 이미지는 FormData로 별도 전송되며, Pydantic 스키마에는 포함되지 않습니다. 라우터에서 Form 필드와 UploadFile을 함께 처리합니다.

---

## 엔티티 관계 (Unit 2 범위)

```
Store (1) ----< Category (N) ----< Menu (N)
                                      |
                                      +-- image_url -> uploads/{filename}
```
