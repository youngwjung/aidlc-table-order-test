# 코드 요약 - Unit 2: Menu & Category Management

## 생성된 파일 목록

### 백엔드 (6개 파일)

| 파일 | 유형 | 설명 |
|---|---|---|
| `backend/app/services/image_service.py` | 생성 | 이미지 업로드/삭제/검증 서비스 |
| `backend/app/services/category_service.py` | 생성 | 카테고리 CRUD + 순서 관리 서비스 |
| `backend/app/services/menu_service.py` | 생성 | 메뉴 CRUD + 이미지 오케스트레이션 서비스 |
| `backend/app/routers/categories.py` | 생성 | 카테고리 API 라우터 (5 엔드포인트) |
| `backend/app/routers/menus.py` | 생성 | 메뉴 API 라우터 (5 엔드포인트, FormData) |
| `backend/app/main.py` | 수정 | 새 라우터 등록 추가 |

### 프론트엔드 (9개 파일)

| 파일 | 유형 | 설명 |
|---|---|---|
| `frontend/src/lib/format-utils.ts` | 생성 | 가격 포맷팅 유틸리티 |
| `frontend/src/components/admin/image-uploader.tsx` | 생성 | 이미지 업로더 컴포넌트 |
| `frontend/src/components/admin/menu-form-modal.tsx` | 생성 | 메뉴 등록/수정 모달 폼 |
| `frontend/src/components/customer/category-tabs.tsx` | 생성 | 카테고리 탭 바 컴포넌트 |
| `frontend/src/components/customer/menu-card.tsx` | 생성 | 메뉴 카드 컴포넌트 |
| `frontend/src/components/customer/menu-detail-modal.tsx` | 생성 | 메뉴 상세 모달 컴포넌트 |
| `frontend/src/app/admin/categories/page.tsx` | 생성 | 관리자 카테고리 관리 페이지 |
| `frontend/src/app/admin/menus/page.tsx` | 생성 | 관리자 메뉴 관리 페이지 |
| `frontend/src/app/customer/menu/page.tsx` | 수정 | 고객 메뉴 조회 페이지 |

### 합계
- **생성**: 14개 파일
- **수정**: 2개 파일 (main.py, customer/menu/page.tsx)
- **총 변경**: 16개 파일

---

## API 엔드포인트 (10개)

### Category API (`/api/stores/{store_id}/categories`)
| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/` | admin, table | 카테고리 목록 조회 |
| POST | `/` | admin | 카테고리 생성 |
| PUT | `/reorder` | admin | 카테고리 순서 변경 |
| PUT | `/{category_id}` | admin | 카테고리 수정 |
| DELETE | `/{category_id}` | admin | 카테고리 삭제 |

### Menu API (`/api/stores/{store_id}/menus`)
| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/` | admin, table | 메뉴 목록 조회 (?category_id=) |
| POST | `/` | admin | 메뉴 생성 (FormData) |
| PUT | `/reorder` | admin | 메뉴 순서 변경 |
| PUT | `/{menu_id}` | admin | 메뉴 수정 (FormData) |
| DELETE | `/{menu_id}` | admin | 메뉴 삭제 |

---

## 스토리 구현 현황

17개 스토리 모두 구현 완료:
- **고객 스토리**: CS-02 (카테고리별 메뉴 조회), CS-03 (카테고리 빠른 이동), CS-04 (메뉴 상세), CS-ERR-03 (메뉴 로드 실패)
- **관리자 스토리**: AD-12~AD-22 (메뉴/카테고리 CRUD, 순서 관리, 필드 검증, 이미지 업로드)
- **에러 스토리**: AD-ERR-04 (메뉴 저장 실패), AD-ERR-05 (이미지 업로드 실패)
