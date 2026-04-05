# NFR Design Plan - Unit 1: Foundation

## Plan Overview
Unit 1(Foundation)의 NFR 요구사항을 구체적인 설계 패턴과 논리적 컴포넌트로 반영합니다.

---

## Design Questions

### Question 1
SSE 연결이 끊어졌을 때 클라이언트 재연결 전략은 어떻게 하시겠습니까?

A) EventSource 기본 재연결 (브라우저 자동 재연결, 별도 로직 없음)
B) 커스텀 재연결 (지수 백오프, 최대 재시도 횟수 제한, 연결 상태 UI 표시)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
백엔드 에러 처리 전략은 어떻게 하시겠습니까?

A) 커스텀 예외 클래스 계층 구조 (NotFoundException, UnauthorizedException 등 도메인별 예외)
B) HTTP 상태 코드 + 메시지만 사용 (FastAPI HTTPException 직접 사용, 별도 예외 클래스 없음)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
프론트엔드 API 호출 시 로딩/에러 상태 관리 패턴은 무엇을 선호하시겠습니까?

A) 각 컴포넌트에서 useState로 개별 관리 (isLoading, error 상태)
B) 커스텀 훅으로 추상화 (useFetch 또는 useApi 훅 생성)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
DB 초기화(create_all) 시점은 언제로 하시겠습니까?

A) FastAPI 앱 시작 시 자동 실행 (lifespan 이벤트)
B) 별도 초기화 스크립트로 수동 실행 (python init_db.py)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Generation Checklist

- [x] Step 1: nfr-design-patterns.md - NFR 설계 패턴
- [x] Step 2: logical-components.md - 논리적 컴포넌트
