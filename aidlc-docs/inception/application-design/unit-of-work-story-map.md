# 스토리-유닛 매핑 (Story-Unit Map)

**개발 모델**: 3인 병렬 개발

---

## Phase 0: Unit 1 - Foundation (3명 공동)

| 스토리 ID | 스토리 제목 | Priority | 담당 |
|---|---|---|---|
| CS-01 | 태블릿 자동 로그인 | Must | 개발자 C |
| CS-ERR-01 | 자동 로그인 실패 처리 | Must | 개발자 C |
| AD-01 | 관리자 로그인 | Must | 개발자 C |
| AD-02 | 관리자 자동 로그아웃 | Must | 개발자 C |
| AD-ERR-01 | 로그인 실패 처리 | Must | 개발자 C |

**합계**: 5개 스토리 (Must: 5)

---

## Phase 1: 병렬 개발

### 개발자 A: Unit 2 - Menu & Category Management

| 스토리 ID | 스토리 제목 | Priority |
|---|---|---|
| CS-02 | 카테고리별 메뉴 목록 조회 | Must |
| CS-03 | 카테고리 간 빠른 이동 | Must |
| CS-04 | 메뉴 상세 정보 확인 | Must |
| CS-ERR-03 | 메뉴 로드 실패 처리 | Should |
| AD-12 | 메뉴 목록 조회 | Must |
| AD-13 | 메뉴 등록 | Must |
| AD-14 | 메뉴 수정 | Must |
| AD-15 | 메뉴 삭제 | Must |
| AD-16 | 메뉴 노출 순서 조정 | Should |
| AD-17 | 카테고리 등록 | Must |
| AD-18 | 카테고리 수정 | Must |
| AD-19 | 카테고리 삭제 | Should |
| AD-20 | 카테고리 표시 순서 관리 | Should |
| AD-21 | 메뉴 필수 필드 검증 | Must |
| AD-22 | 이미지 파일 업로드 | Must |
| AD-ERR-04 | 메뉴 등록/수정 실패 처리 | Must |
| AD-ERR-05 | 이미지 업로드 실패 처리 | Should |

**합계**: 17개 스토리 (Must: 12, Should: 5)

---

### 개발자 B: Unit 3 - Customer Order Flow

| 스토리 ID | 스토리 제목 | Priority |
|---|---|---|
| CS-05 | 장바구니에 메뉴 추가 | Must |
| CS-06 | 장바구니 메뉴 수량 조절 | Must |
| CS-07 | 장바구니 메뉴 삭제 | Must |
| CS-08 | 장바구니 비우기 | Should |
| CS-09 | 장바구니 총 금액 실시간 확인 | Must |
| CS-10 | 장바구니 새로고침 유지 | Must |
| CS-11 | 주문 내역 확인 및 확정 | Must |
| CS-12 | 주문 성공 확인 및 리다이렉트 | Must |
| CS-13 | 주문 내역 조회 | Must |
| CS-ERR-02 | 주문 전송 실패 처리 | Must |
| CS-ERR-04 | 빈 장바구니 주문 방지 | Must |

**합계**: 11개 스토리 (Must: 10, Should: 1)

---

### 개발자 C: Unit 4 - Admin Dashboard & Table Management

| 스토리 ID | 스토리 제목 | Priority |
|---|---|---|
| AD-03 | 실시간 주문 대시보드 조회 | Must |
| AD-04 | 실시간 주문 수신 (SSE) | Must |
| AD-05 | 주문 상세 보기 | Must |
| AD-06 | 주문 상태 변경 | Must |
| AD-07 | 테이블별 필터링 | Should |
| AD-08 | 테이블 초기 설정 | Must |
| AD-09 | 주문 삭제 (직권 수정) | Must |
| AD-10 | 테이블 이용 완료 처리 | Must |
| AD-11 | 과거 주문 내역 조회 | Must |
| AD-ERR-02 | SSE 연결 끊김 처리 | Should |
| AD-ERR-03 | 주문 삭제 실패 처리 | Must |

**합계**: 11개 스토리 (Must: 9, Should: 2)

---

## 전체 매핑 요약

| Phase | 유닛 | 담당 | 스토리 수 | Must | Should |
|---|---|---|---|---|---|
| 0 | Unit 1: Foundation | 전원 (인증: 개발자C) | 5 | 5 | 0 |
| 1 | Unit 2: Menu & Category | 개발자 A | 17 | 12 | 5 |
| 1 | Unit 3: Customer Order | 개발자 B | 11 | 10 | 1 |
| 1 | Unit 4: Admin Dashboard | 개발자 C | 11 | 9 | 2 |
| 2 | 통합 | 전원 | - | - | - |
| | **합계** | | **44** | **36** | **8** |

---

## 개발자별 작업량 요약

| 개발자 | Phase 0 담당 | Phase 1 유닛 | 스토리 수 | 비고 |
|---|---|---|---|---|
| **개발자 A** | 백엔드 구조, DB 모델, Docker | Unit 2: 메뉴/카테고리 | 17 | 가장 많은 스토리, 대부분 CRUD |
| **개발자 B** | 프론트엔드 구조, 공통 컴포넌트 | Unit 3: 고객 주문 | 11 | 장바구니 상태관리 복잡도 있음 |
| **개발자 C** | 인증 시스템 (5개 스토리) | Unit 4: 관리자 대시보드 | 11 | SSE 실시간 통신 복잡도 있음 |

---

## 스토리 커버리지 검증

- **전체 스토리 41개 중 할당된 스토리**: 41개 (중복 포함 44건)
- **미할당 스토리**: 0개
- **커버리지**: 100%
