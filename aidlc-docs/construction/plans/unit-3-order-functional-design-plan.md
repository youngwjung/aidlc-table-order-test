# Unit 3: Customer Order Flow - Functional Design Plan

## Plan Overview
Unit 3의 고객 주문 플로우에 대한 상세 비즈니스 로직을 설계합니다.

## Execution Checklist

- [x] Step 1: Unit 3 컨텍스트 분석 (스토리, 컴포넌트, 서비스 매핑)
- [x] Step 2: 장바구니 도메인 엔티티 설계 (클라이언트 사이드 모델)
- [x] Step 3: 주문 도메인 엔티티 상세 설계 (Order, OrderItem 비즈니스 로직)
- [x] Step 4: 장바구니 비즈니스 규칙 정의 (추가/수정/삭제/초기화)
- [x] Step 5: 주문 생성 비즈니스 로직 모델 (주문 플로우 상세)
- [x] Step 6: 테이블 세션 자동 시작 로직 설계
- [x] Step 7: 프론트엔드 컴포넌트 설계 (Cart, OrderSuccess, Orders 페이지)
- [x] Step 8: 에러 시나리오 및 예외 처리 설계
- [x] Step 9: 산출물 생성 (domain-entities, business-rules, business-logic-model, frontend-components)

---

## Clarification Questions

### Q1. 장바구니 항목 표시 정보
B) 메뉴명 + 가격 + 수량 + 이미지 썸네일

[Answer]: B

---

### Q2. 주문 확인 UI 방식
A) 장바구니 페이지에서 바로 확인 모달 표시 후 제출

[Answer]: A

---

### Q3. 동일 세션 내 추가 주문
A) 가능 - 기존 세션에 새 주문이 추가됨 (주문번호 별도 부여)

[Answer]: A

---

### Q4. 주문 성공 후 리다이렉트 대상
A) 메뉴 페이지 (추가 주문 가능)

[Answer]: A

---

### Q5. 주문 내역 페이지 표시 범위
A) 현재 세션의 주문만 표시

[Answer]: A

---

### Q6. 장바구니 수량 변경 방식
C) +/- 버튼만, 수량 0이 되면 자동 삭제

[Answer]: C

---

### Q7. 주문 제출 시 재고/메뉴 유효성 검증
A) 검증함 - 메뉴 존재 여부 및 현재 가격으로 재계산

[Answer]: A

---
