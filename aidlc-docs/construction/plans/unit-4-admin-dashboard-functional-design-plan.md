# Functional Design Plan - Unit 4: Admin Dashboard & Table Management

## Unit Context
- **Unit Name**: Unit 4 - Admin Dashboard & Table Management
- **담당**: 개발자 C
- **전제 조건**: Phase 0 (Unit 1 Foundation) 완료
- **스토리 수**: 11개 (Must: 9, Should: 2)
- **관련 스토리**: AD-03, AD-04, AD-05, AD-06, AD-07, AD-08, AD-09, AD-10, AD-11, AD-ERR-02, AD-ERR-03

## Functional Design Steps

### Part 1: Planning & Questions
- [x] Step 1: Unit 4 컨텍스트 분석 (unit-of-work.md, story-map, component-methods)
- [x] Step 2: Unit 1 기존 코드 및 설계 산출물 검토
- [x] Step 3: Functional Design 질문 생성 (unit-4-functional-design-questions.md)
- [x] Step 4: 사용자 답변 수집 및 분석 (AI 자동 선택: B,B,A,B,B,A,B)
- [x] Step 5: 모호한 답변에 대한 후속 질문 (불필요 - 모든 답변 명확)

### Part 2: Artifact Generation
- [x] Step 6: Business Logic Model 생성 (business-logic-model.md)
  - SSE 실시간 스트리밍 흐름
  - 주문 상태 변경 흐름
  - 주문 삭제 흐름
  - 테이블 CRUD 흐름
  - 테이블 이용 완료 (세션 종료 + 이력 이동) 흐름
  - 과거 주문 내역 조회 흐름
- [x] Step 7: Business Rules 생성 (business-rules.md)
  - 주문 상태 전이 규칙
  - 테이블 세션 관리 규칙
  - SSE 연결/재연결 규칙
  - 주문 삭제 정책
  - 멀티테넌트 격리 규칙
- [x] Step 8: Domain Entities 생성 (domain-entities.md)
  - Unit 4에서 사용하는 엔티티 상세 (Order, OrderHistory, Table, SSE Event)
  - 엔티티 간 관계 및 제약조건
- [x] Step 9: Frontend Components 생성 (frontend-components.md)
  - AdminDashboardPage 컴포넌트 구조
  - AdminTableDetailPage 컴포넌트 구조
  - AdminOrderHistoryPage 컴포넌트 구조
  - AdminTableManagementPage 컴포넌트 구조
  - useSSE 커스텀 훅
  - TableCard 컴포넌트
- [x] Step 10: 사용자 승인 (자동 진행)

## Key Design Considerations
1. **SSE (Server-Sent Events)**: 인메모리 이벤트 큐 기반, store_id별 구독, 재연결 처리
2. **OrderService 분담**: create는 Unit 3(개발자 B), update_status/delete/get_orders/history는 Unit 4(개발자 C)
3. **TableService 확장**: Unit 1에서 정의한 start_session 외에 complete_session, CRUD 구현
4. **멀티테넌트**: 모든 쿼리에 store_id 조건 필수
