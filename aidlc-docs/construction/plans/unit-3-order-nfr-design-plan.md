# Unit 3: Customer Order Flow - NFR Design Plan

## Plan Overview
Unit 3의 NFR 요구사항을 설계 패턴과 논리적 컴포넌트로 구현합니다.

## Execution Checklist

- [x] Step 1: NFR 요구사항 분석
- [x] Step 2: 설계 패턴 결정
- [x] Step 3: 논리적 컴포넌트 설계
- [x] Step 4: 산출물 생성

---

## Clarification Questions (Auto-Selected)

### Q1. 장바구니 상태 변경 시 디바운싱
localStorage 동기화 시 디바운싱을 적용할까요?

A) 디바운싱 없음 - 매 변경마다 즉시 저장
B) 300ms 디바운싱 적용

[Answer]: A - 장바구니 변경 빈도가 낮고, localStorage 쓰기는 동기적이며 매우 빠름. 디바운싱 불필요.

---

### Q2. 주문 생성 트랜잭션 범위
주문 생성 시 트랜잭션 범위는?

A) 단일 트랜잭션 (세션 시작 + 주문 + 항목 모두 포함)
B) 분리 트랜잭션 (세션 시작 따로, 주문+항목 따로)

[Answer]: A - 원자성 보장. 세션 시작과 주문 생성이 함께 성공/실패해야 데이터 일관성 유지.

---
