# 유닛 의존성 (Unit of Work Dependencies)

**개발 모델**: 3인 병렬 개발 (Phase 0 → Phase 1 병렬 → Phase 2 통합)

---

## 1. Phase별 의존성 다이어그램

```
+============================================+
|  Phase 0: Foundation (3명 공동)             |
|                                            |
|  개발자A        개발자B        개발자C      |
|  백엔드구조     프론트구조     인증시스템    |
|  DB모델         공통컴포넌트   JWT/로그인    |
|  Docker         레이아웃       미들웨어      |
+============================================+
         |               |              |
         v               v              v
+==============+ +==============+ +==============+
| Phase 1      | | Phase 1      | | Phase 1      |
|              | |              | |              |
| 개발자A      | | 개발자B      | | 개발자C      |
| Unit 2:      | | Unit 3:      | | Unit 4:      |
| Menu &       | | Customer     | | Admin        |
| Category     | | Order Flow   | | Dashboard &  |
|              | |              | | Table Mgmt   |
| - Category   | | - Cart       | | - SSEService |
|   CRUD       | | - Order      | | - Dashboard  |
| - Menu CRUD  | |   Create     | | - Order      |
| - Image      | | - Order      | |   Status/Del |
|   Upload     | |   History    | | - Table CRUD |
| - Customer   | | - Session    | | - Session    |
|   Menu Page  | |   Start      | |   Complete   |
+--------------+ +--------------+ +--------------+
         |               |              |
         v               v              v
+============================================+
|  Phase 2: 통합 (3명 공동)                   |
|                                            |
|  - 메뉴 -> 주문 연동 (A+B)                 |
|  - SSE 이벤트 연결 (B+C)                   |
|  - OrderService 병합 검증 (B+C)            |
|  - E2E 전체 흐름 테스트 (전원)              |
|  - 멀티테넌트 검증 (전원)                   |
+============================================+
```

---

## 2. Phase 1 병렬 의존성 매트릭스

| 유닛 \ 의존 대상 | Unit 1 (Phase 0) | Unit 2 (개발자A) | Unit 3 (개발자B) | Unit 4 (개발자C) |
|---|---|---|---|---|
| **Unit 2** (개발자A) | **필수** (DB, 인증, 공통구조) | - | - | - |
| **Unit 3** (개발자B) | **필수** (DB, 인증, 공통구조) | 시드 데이터로 대체 → Phase 2 연동 | - | - |
| **Unit 4** (개발자C) | **필수** (DB, 인증, 공통구조) | - | OrderService 분담 → Phase 2 병합 | - |

---

## 3. 공유 코드 충돌 관리

### OrderService 분할 전략

OrderService는 개발자 B와 C가 동시에 작업하므로 **메서드 단위로 명확히 분리**합니다:

```
order_service.py
  |
  +-- 개발자 B 담당 (주문 생성 흐름)
  |     create_order()
  |     get_current_session_orders()
  |     get_table_total()
  |
  +-- 개발자 C 담당 (주문 관리 흐름)
  |     get_orders()
  |     update_order_status()
  |     delete_order()
  |     get_order_history()
  |     move_orders_to_history()
  |
  +-- Phase 2 통합 (B+C 공동)
        SSE broadcast 연결
```

**충돌 방지 규칙**:
- 각 개발자는 자신의 담당 메서드만 구현
- Phase 0에서 order_service.py의 클래스 뼈대(메서드 시그니처만)를 미리 정의
- Phase 2에서 병합 및 통합 테스트

### Git 브랜치 전략 (권장)

```
main
  |
  +-- phase-0/foundation     (3명 공동 → merge to main)
  |
  +-- phase-1/unit-2-menu    (개발자 A)
  +-- phase-1/unit-3-order   (개발자 B)
  +-- phase-1/unit-4-admin   (개발자 C)
  |
  +-- phase-2/integration    (3명 공동 → merge to main)
```

---

## 4. Phase 1 병렬 가능 근거

| 유닛 | 원래 의존성 | 병렬화 해결 방법 |
|---|---|---|
| Unit 2 (개발자A) | Unit 1만 의존 | Phase 0 완료 후 바로 시작 가능 |
| Unit 3 (개발자B) | Unit 1 + Unit 2(메뉴 데이터) | 시드 스크립트로 테스트 메뉴 데이터 삽입 → 메뉴 API 없이 독립 개발 |
| Unit 4 (개발자C) | Unit 1 + Unit 3(주문 데이터) | OrderService 메서드 분담으로 독립 개발. 테스트 시 직접 주문 데이터 생성 |
