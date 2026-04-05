# Unit 3: Customer Order Flow - Infrastructure Design Plan

## Plan Overview
Unit 3의 논리적 컴포넌트를 실제 인프라에 매핑합니다. Unit 1 Foundation 인프라(Docker Compose)를 상속합니다.

## Execution Checklist

- [x] Step 1: 설계 산출물 분석
- [x] Step 2: Unit 1 인프라 기반 분석
- [x] Step 3: Unit 3 추가 인프라 요소 식별
- [x] Step 4: 산출물 생성

---

## Clarification Questions (Auto-Selected)

### Q1. Seed 데이터 실행 방식
Seed 데이터를 어떻게 실행할까요?

A) Docker 컨테이너 시작 후 수동 실행 (docker exec)
B) 별도 Docker Compose 서비스로 실행 (depends_on backend)
C) 백엔드 앱 시작 시 자동 실행 (lifespan 이벤트)

[Answer]: A - 프로토타입 수준에서 수동 실행이 가장 단순하고 제어 가능. 필요할 때만 실행.

---
