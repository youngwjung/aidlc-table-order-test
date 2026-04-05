# Functional Design Plan - Unit 1: Foundation

## Plan Overview
Unit 1(Foundation)의 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 상세 설계합니다.
범위: 프로젝트 구조, DB 모델 전체, 인증 시스템, 매장 API, 로그인/설정 페이지

---

## Design Questions

### Question 1
초기 매장(Store)과 관리자(AdminUser) 데이터는 어떻게 생성합니까? (회원가입 페이지는 요구사항에 없음)

A) 시드 스크립트로 초기 데이터 생성 (DB에 직접 삽입)
B) 별도의 슈퍼 관리자 CLI 명령어로 생성 (예: `python manage.py create-store`)
C) 최초 접속 시 초기 설정 화면(매장+관리자 등록) 제공
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
로그인 시도 제한의 구체적인 정책은 어떻게 하시겠습니까?

A) 5회 실패 시 5분 잠금
B) 10회 실패 시 15분 잠금
C) 3회 실패 시 1분 잠금 (프로토타입에 적합)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
테이블 비밀번호는 어떤 수준으로 관리하시겠습니까?

A) 관리자 비밀번호와 동일하게 bcrypt 해싱 (보안 강화)
B) 평문 저장 (태블릿 내부 인증용이므로 간소화)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
주문 번호(order_number) 생성 방식은 어떻게 하시겠습니까?

A) 매장별 일일 순번 (예: 001, 002, 003... 매일 리셋)
B) 매장별 누적 순번 (예: 1, 2, 3... 리셋 없음)
C) UUID 기반 (고유하지만 고객이 기억하기 어려움)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Generation Checklist

- [x] Step 1: domain-entities.md - 도메인 엔티티 상세 (필드, 타입, 제약조건, 관계)
- [x] Step 2: business-rules.md - 비즈니스 규칙 (인증, 세션, 검증)
- [x] Step 3: business-logic-model.md - 비즈니스 로직 흐름 (인증 플로우, 세션 관리)
- [x] Step 4: frontend-components.md - 프론트엔드 컴포넌트 상세 (로그인, 설정, 레이아웃)
