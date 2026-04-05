# Functional Design Plan - Unit 2: Menu & Category Management

## Unit 개요
- **유닛명**: Unit 2 - Menu & Category Management (메뉴/카테고리 관리)
- **담당**: 개발자 A
- **전제 조건**: Phase 0 (Unit 1: Foundation) 완료
- **스토리 수**: 17개 (Must: 12, Should: 5)

## 관련 스토리
CS-02, CS-03, CS-04, CS-ERR-03, AD-12, AD-13, AD-14, AD-15, AD-16, AD-17, AD-18, AD-19, AD-20, AD-21, AD-22, AD-ERR-04, AD-ERR-05

## 기존 아티팩트 참조
- DB 모델: Category, Menu (Unit 1에서 정의 완료)
- Pydantic 스키마: CategoryCreate/Update/Response, MenuCreate/Update/Response (Unit 1에서 정의 완료)
- 서비스 시그니처: CategoryService, MenuService, ImageService (Application Design에서 정의)
- API 엔드포인트: Category API, Menu API, Image API (Application Design에서 정의)

---

## Functional Design 실행 계획

### Part 1: 비즈니스 로직 모델 (business-logic-model.md)
- [x] 1.1 카테고리 CRUD 흐름 상세화
- [x] 1.2 카테고리 순서 변경 로직
- [x] 1.3 메뉴 CRUD 흐름 상세화 (이미지 포함)
- [x] 1.4 메뉴 순서 변경 로직
- [x] 1.5 이미지 업로드/삭제/서빙 흐름
- [x] 1.6 고객 메뉴 조회 흐름 (카테고리별)
- [x] 1.7 에러 처리 흐름 (CS-ERR-03, AD-ERR-04, AD-ERR-05)

### Part 2: 비즈니스 규칙 (business-rules.md)
- [x] 2.1 카테고리 관련 비즈니스 규칙
- [x] 2.2 메뉴 관련 비즈니스 규칙
- [x] 2.3 이미지 관련 비즈니스 규칙
- [x] 2.4 표시 순서 관련 규칙
- [x] 2.5 검증 규칙 (필수 필드, 가격, 이미지 형식)
- [x] 2.6 멀티테넌트 격리 규칙 (카테고리/메뉴)

### Part 3: 도메인 엔티티 (domain-entities.md)
- [x] 3.1 Category 엔티티 상세 (Unit 1 정의 확인 및 보완)
- [x] 3.2 Menu 엔티티 상세 (Unit 1 정의 확인 및 보완)
- [x] 3.3 이미지 파일 관리 모델

### Part 4: 프론트엔드 컴포넌트 (frontend-components.md)
- [x] 4.1 AdminCategoryManagementPage 상세
- [x] 4.2 AdminMenuManagementPage 상세
- [x] 4.3 CustomerMenuPage 상세
- [x] 4.4 MenuCard 컴포넌트
- [x] 4.5 MenuDetailModal 컴포넌트
- [x] 4.6 CategoryTabs 컴포넌트
- [x] 4.7 ImageUploader 컴포넌트

---

## 질문
질문 파일: `aidlc-docs/construction/unit-2-menu-category-functional-design-questions.md`
답변: 자동 선택 완료 (Q1:A, Q2:B, Q3:A, Q4:B, Q5:B, Q6:A, Q7:C, Q8:B, Q9:A, Q10:A)
