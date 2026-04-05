# Unit 3: Customer Order Flow - NFR Requirements Plan

## Plan Overview
Unit 3의 비기능 요구사항을 평가합니다. Unit 1 Foundation NFR을 기반으로 Unit 3 특화 요구사항을 추가합니다.

## Execution Checklist

- [x] Step 1: Functional Design 분석
- [x] Step 2: Unit 1 NFR 기반 분석
- [x] Step 3: Unit 3 특화 NFR 식별
- [x] Step 4: 산출물 생성

---

## Clarification Questions (Auto-Selected)

### Q1. localStorage 장바구니 용량 제한
장바구니에 담을 수 있는 최대 항목 수를 제한할까요?

A) 제한 없음 (프로토타입 수준)
B) 최대 50개 항목으로 제한
C) 최대 20개 항목으로 제한

[Answer]: A - 프로토타입 수준이므로 제한 불필요. 실제로 식당 주문에서 50개 이상 항목은 비현실적.

---

### Q2. 주문 제출 타임아웃
주문 API 호출 시 타임아웃은 얼마로 설정할까요?

A) 10초 (일반적)
B) 30초 (여유있게)
C) 5초 (빠른 실패)

[Answer]: A - 일반 API 응답 500ms 목표 대비 충분한 여유. 네트워크 지연 고려.

---

### Q3. 주문 제출 중복 방지
더블 클릭 등으로 주문이 중복 제출되는 것을 방지할까요?

A) 클라이언트 사이드만 (버튼 비활성화)
B) 서버 사이드 + 클라이언트 사이드
C) 방지하지 않음

[Answer]: A - 프로토타입 수준에서 클라이언트 비활성화로 충분. 서버 사이드 중복 방지는 복잡도 과다.

---
