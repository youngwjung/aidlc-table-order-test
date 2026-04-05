# Requirements Verification Questions

다음 질문들에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해 주세요.

---

## Question 1
백엔드 기술 스택으로 무엇을 사용하시겠습니까?

A) Node.js + Express
B) Node.js + NestJS
C) Java + Spring Boot
D) Python + FastAPI
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
프론트엔드 기술 스택으로 무엇을 사용하시겠습니까?

A) React (JavaScript)
B) React (TypeScript)
C) Vue.js
D) Next.js (TypeScript)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 3
데이터베이스로 무엇을 사용하시겠습니까?

A) PostgreSQL
B) MySQL
C) SQLite (개발/프로토타입용)
D) MongoDB
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
고객용 인터페이스와 관리자용 인터페이스의 배포 구조는 어떻게 하시겠습니까?

A) 하나의 프론트엔드 앱에서 경로(route)로 분리
B) 별도의 두 개 프론트엔드 앱으로 분리
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
메뉴 이미지는 어떻게 관리하시겠습니까?

A) 외부 이미지 URL 직접 입력 (이미지 업로드 기능 없음)
B) 서버에 이미지 파일 업로드 후 URL 자동 생성
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
매장(Store)은 단일 매장만 지원하면 됩니까, 아니면 다중 매장(멀티테넌트)을 지원해야 합니까?

A) 단일 매장만 지원 (MVP)
B) 다중 매장 지원 (멀티테넌트)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
관리자 계정은 매장당 하나만 있으면 됩니까, 아니면 여러 관리자 계정이 필요합니까?

A) 매장당 관리자 계정 1개
B) 매장당 여러 관리자 계정 (역할 구분 없음)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8
카테고리 관리 기능이 필요합니까? (메뉴를 분류하는 카테고리의 추가/수정/삭제)

A) 예, 관리자가 카테고리를 CRUD 할 수 있어야 함
B) 아니오, 카테고리는 미리 정의된 고정 목록 사용
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
예상되는 동시 접속 규모는 어느 정도입니까?

A) 소규모 (테이블 10개 이하, 동시 주문 5건 미만)
B) 중규모 (테이블 10~50개, 동시 주문 10~30건)
C) 대규모 (테이블 50개 이상, 동시 주문 30건 이상)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10
배포 환경은 어디를 대상으로 하시겠습니까?

A) 로컬 개발 환경만 (MVP/프로토타입)
B) AWS 클라우드
C) Docker 컨테이너 (로컬 또는 클라우드)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 11: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 SECURITY 규칙을 blocking 제약으로 적용 (프로덕션 수준 애플리케이션 권장)
B) No — SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: B
