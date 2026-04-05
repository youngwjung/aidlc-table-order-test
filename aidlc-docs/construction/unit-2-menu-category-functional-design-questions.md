# Unit 2: Menu & Category Management - Functional Design 질문

Unit 2의 Functional Design을 위해 아래 질문에 답변해 주세요.
각 질문의 [Answer]: 태그 뒤에 선택한 옵션의 문자를 입력해 주세요.

---

## Question 1
카테고리 삭제 시, 해당 카테고리에 메뉴가 존재하면 어떻게 처리할까요? (AD-19)

A) 삭제 차단 - "해당 카테고리에 메뉴가 있어 삭제할 수 없습니다" 메시지 표시 (스토리 AC 그대로)
B) 메뉴를 다른 카테고리로 이동 후 삭제 (이동할 카테고리 선택 UI 필요)
C) 메뉴도 함께 삭제 (CASCADE)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
이미지 업로드 시 허용할 파일 형식과 크기 제한은 어떻게 설정할까요?

A) JPEG/PNG만 허용, 최대 5MB
B) JPEG/PNG/WebP 허용, 최대 5MB
C) JPEG/PNG/WebP/GIF 허용, 최대 10MB
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3
이미지 업로드 시 서버에서 이미지 리사이징/최적화 처리를 할까요?

A) 리사이징 없음 - 원본 그대로 저장 (가장 단순)
B) 최대 해상도 제한만 적용 (예: 1200x1200px 초과 시 축소)
C) 썸네일 + 원본 두 버전 저장
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
메뉴/카테고리 순서 변경 UI를 어떤 방식으로 구현할까요? (AD-16, AD-20)

A) 드래그 앤 드롭 (직관적이지만 구현 복잡도 높음)
B) 위/아래 화살표 버튼 (간단한 구현)
C) 순서 번호 직접 입력 (가장 단순)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
고객 메뉴 화면(CustomerMenuPage)에서 카테고리 탐색 방식은 어떻게 할까요? (CS-02, CS-03)

A) 상단 고정 카테고리 탭 + 탭 클릭 시 해당 섹션으로 스크롤
B) 상단 고정 카테고리 탭 + 탭 클릭 시 해당 카테고리만 필터링 표시
C) 좌측 사이드바 카테고리 목록 + 우측에 메뉴 표시
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
고객 메뉴 상세 보기(CS-04)에서 "담기" 버튼 동작은 어디에 배치할까요?

A) 메뉴 카드에 바로 "담기" 버튼 + 카드 클릭 시 모달에서도 "담기" 버튼
B) 메뉴 카드에는 "담기" 버튼 없이, 카드 클릭 → 모달에서만 "담기" 버튼
C) 메뉴 카드에 바로 "담기" 버튼만 (모달에는 정보만 표시)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
관리자 메뉴 관리 화면(AdminMenuManagementPage)의 레이아웃은 어떤 형태가 좋을까요?

A) 테이블(표) 형태 목록 - 각 행에 편집/삭제 버튼
B) 카드 그리드 형태 - 이미지 미리보기 포함
C) 좌측 카테고리 필터 + 우측 테이블 목록
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8
메뉴 등록/수정 폼은 어떤 방식으로 표시할까요?

A) 별도 페이지로 이동 (예: /admin/menus/new, /admin/menus/:id/edit)
B) 모달(팝업) 형태로 현재 페이지 위에 표시
C) 인라인 폼 (목록 내에서 직접 편집)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 9
메뉴에 "판매 중지" (is_available) 기능이 필요할까요? 현재 스토리에는 명시되어 있지 않습니다.

A) 불필요 - 현재 스토리 범위대로 삭제만 지원
B) 필요 - is_available 토글로 고객 화면에서 숨김 처리 (삭제 없이 임시 비활성)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
카테고리 관리 화면(AdminCategoryManagementPage)에서 카테고리 추가/수정은 어떤 방식이 좋을까요?

A) 인라인 편집 - 목록에서 직접 이름 수정, 새 행 추가
B) 모달 팝업 - 추가/수정 시 간단한 모달 표시
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---
