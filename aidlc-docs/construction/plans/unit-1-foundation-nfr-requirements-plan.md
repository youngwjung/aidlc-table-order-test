# NFR Requirements Plan - Unit 1: Foundation

## Plan Overview
Unit 1(Foundation)의 비기능 요구사항을 평가합니다.
기술 스택은 이미 결정되어 있으므로(FastAPI, Next.js, PostgreSQL, SQLAlchemy, Tailwind, Docker),
인프라/운영 수준의 NFR에 집중합니다.

---

## NFR Questions

### Question 1
백엔드 로깅 수준은 어떻게 설정하시겠습니까?

A) 최소 로깅 - 에러만 기록 (프로토타입에 적합)
B) 표준 로깅 - 요청/응답 + 에러 + 주요 비즈니스 이벤트 기록
C) 상세 로깅 - 모든 DB 쿼리 포함 디버그 수준
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
데이터베이스 마이그레이션 관리 도구를 사용하시겠습니까?

A) Alembic (SQLAlchemy 공식 마이그레이션 도구)
B) 마이그레이션 도구 없이 SQLAlchemy create_all()로 직접 생성 (프로토타입에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
API 응답 시간 목표는 어느 정도입니까?

A) 일반 API 500ms 이내, SSE 연결 2초 이내 (프로토타입 수준)
B) 일반 API 200ms 이내, SSE 연결 1초 이내 (프로덕션 수준)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Generation Checklist

- [x] Step 1: nfr-requirements.md - 비기능 요구사항 정의
- [x] Step 2: tech-stack-decisions.md - 기술 스택 결정 및 라이브러리 버전
