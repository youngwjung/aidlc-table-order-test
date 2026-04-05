# Code Generation Plan - Unit 2: Menu & Category Management

## Unit 컨텍스트
- **유닛**: Unit 2 - Menu & Category Management
- **프로젝트 타입**: Greenfield (모놀리식)
- **워크스페이스 루트**: /home/ec2-user/environment/unit2/aidlc-table-order-test
- **코드 위치**: 워크스페이스 루트 (backend/, frontend/)
- **스토리 수**: 17개 (CS-02~04, CS-ERR-03, AD-12~22, AD-ERR-04~05)

## 기존 코드 참조
- DB 모델: Category, Menu (이미 구현됨)
- Pydantic 스키마: category.py, menu.py (이미 구현됨)
- 미들웨어: auth.py (get_current_user, require_role 이미 구현됨)
- API Client: api-client.ts (upload, uploadPut 이미 구현됨)
- 타입: types/index.ts (Category, Menu 이미 정의됨)
- 레이아웃: AdminLayout, CustomerLayout (이미 구현됨)
- 공통 UI: Toast, ConfirmModal, StatusBadge, LoadingSpinner (이미 구현됨)

---

## Code Generation Steps

### 백엔드

- [x] Step 1: ImageService 생성 (`backend/app/services/image_service.py`)
  - upload_image, delete_image, get_image_path
  - 파일 형식/크기 검증, UUID 파일명, 비동기 파일 I/O
  - 스토리: AD-22, AD-ERR-05

- [x] Step 2: CategoryService 생성 (`backend/app/services/category_service.py`)
  - create_category, get_categories, get_category, update_category, delete_category, reorder_categories
  - 중복 검사, 메뉴 존재 시 삭제 차단
  - 스토리: AD-17, AD-18, AD-19, AD-20

- [x] Step 3: MenuService 생성 (`backend/app/services/menu_service.py`)
  - create_menu, get_menus, get_menu, update_menu, delete_menu, reorder_menus
  - 이미지 업로드/삭제 오케스트레이션, 카테고리 존재 확인
  - 스토리: AD-13, AD-14, AD-15, AD-16, AD-21

- [x] Step 4: Category Router 생성 (`backend/app/routers/categories.py`)
  - GET, POST, PUT, DELETE, PUT /reorder
  - 인증: admin(CRUD), table+admin(조회)
  - 스토리: AD-17, AD-18, AD-19, AD-20, CS-02

- [x] Step 5: Menu Router 생성 (`backend/app/routers/menus.py`)
  - GET, POST(FormData), PUT(FormData), DELETE, PUT /reorder
  - 인증: admin(CRUD), table+admin(조회)
  - 스토리: AD-12, AD-13, AD-14, AD-15, AD-16, CS-02

- [x] Step 6: main.py 수정 - 새 라우터 등록
  - categories router, menus router 추가

### 프론트엔드

- [x] Step 7: 유틸리티 함수 추가 (`frontend/src/lib/format-utils.ts`)
  - formatPrice: 가격 포맷팅 (천 단위 콤마 + "원")

- [x] Step 8: ImageUploader 컴포넌트 (`frontend/src/components/admin/image-uploader.tsx`)
  - 이미지 미리보기, 파일 선택, 제거 기능
  - 스토리: AD-22

- [x] Step 9: CategoryTabs 컴포넌트 (`frontend/src/components/customer/category-tabs.tsx`)
  - 카테고리 탭 바, 선택 상태 관리
  - 스토리: CS-02, CS-03

- [x] Step 10: MenuCard 컴포넌트 (`frontend/src/components/customer/menu-card.tsx`)
  - 메뉴 카드 (이미지, 이름, 가격, 담기 버튼)
  - 스토리: CS-02, CS-04, CS-05

- [x] Step 11: MenuDetailModal 컴포넌트 (`frontend/src/components/customer/menu-detail-modal.tsx`)
  - 메뉴 상세 모달 (큰 이미지, 설명, 담기 버튼)
  - 스토리: CS-04

- [x] Step 12: MenuFormModal 컴포넌트 (`frontend/src/components/admin/menu-form-modal.tsx`)
  - 메뉴 등록/수정 모달 (폼, 이미지 업로더, 검증)
  - 스토리: AD-13, AD-14, AD-21, AD-ERR-04

- [x] Step 13: AdminCategoryManagementPage (`frontend/src/app/admin/categories/page.tsx`)
  - 카테고리 CRUD, 인라인 편집, 순서 변경
  - 스토리: AD-17, AD-18, AD-19, AD-20

- [x] Step 14: AdminMenuManagementPage (`frontend/src/app/admin/menus/page.tsx`)
  - 메뉴 CRUD, 카테고리 필터, 순서 변경, 모달 폼
  - 스토리: AD-12, AD-13, AD-14, AD-15, AD-16, AD-22, AD-ERR-04, AD-ERR-05

- [x] Step 15: CustomerMenuPage 수정 (`frontend/src/app/customer/menu/page.tsx`)
  - 카테고리 탭, 메뉴 카드 그리드, 상세 모달, 담기 기능
  - 스토리: CS-02, CS-03, CS-04, CS-ERR-03

### 문서

- [x] Step 16: 코드 요약 문서 생성 (`aidlc-docs/construction/unit-2-menu-category/code/code-summary.md`)

---

## 스토리 커버리지
| 스토리 | 구현 단계 | Status |
|---|---|---|
| CS-02 | Step 4, 9, 10, 15 | [x] |
| CS-03 | Step 9, 15 | [x] |
| CS-04 | Step 10, 11, 15 | [x] |
| CS-ERR-03 | Step 15 | [x] |
| AD-12 | Step 5, 14 | [x] |
| AD-13 | Step 3, 5, 12, 14 | [x] |
| AD-14 | Step 3, 5, 12, 14 | [x] |
| AD-15 | Step 3, 5, 14 | [x] |
| AD-16 | Step 3, 5, 14 | [x] |
| AD-17 | Step 2, 4, 13 | [x] |
| AD-18 | Step 2, 4, 13 | [x] |
| AD-19 | Step 2, 4, 13 | [x] |
| AD-20 | Step 2, 4, 13 | [x] |
| AD-21 | Step 3, 5, 12 | [x] |
| AD-22 | Step 1, 8, 12 | [x] |
| AD-ERR-04 | Step 12, 14 | [x] |
| AD-ERR-05 | Step 1, 8, 14 | [x] |
