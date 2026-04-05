# Application Design Plan - 테이블오더 서비스

## Plan Overview
요구사항과 유저 스토리를 기반으로 고수준 컴포넌트 식별, 서비스 레이어 설계, 의존성 정의를 수행합니다.

---

## Design Questions

다음 질문들에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해 주세요.

### Question 1
백엔드 ORM(Object-Relational Mapping)으로 무엇을 사용하시겠습니까?

A) SQLAlchemy (가장 성숙한 Python ORM, 풍부한 기능)
B) Tortoise ORM (async 네이티브, Django 스타일)
C) SQLModel (FastAPI 제작자가 만든 SQLAlchemy + Pydantic 통합)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
프론트엔드 상태 관리 방식은 무엇을 선호하시겠습니까?

A) React Context + useReducer (외부 라이브러리 없이 기본 내장 기능 사용)
B) Zustand (경량, 간단한 API)
C) Redux Toolkit (풍부한 에코시스템, 대규모 앱 적합)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
프론트엔드 UI 컴포넌트 라이브러리를 사용하시겠습니까?

A) Tailwind CSS만 사용 (유틸리티 기반, 커스텀 디자인)
B) shadcn/ui + Tailwind CSS (재사용 가능한 컴포넌트 + 유틸리티 CSS)
C) MUI (Material UI) (풍부한 기본 컴포넌트)
D) Ant Design (엔터프라이즈 스타일)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
API 통신 라이브러리로 무엇을 사용하시겠습니까?

A) fetch API (브라우저 내장, 추가 라이브러리 불필요)
B) Axios (풍부한 기능, 인터셉터 지원)
C) TanStack Query (React Query) + fetch/axios (서버 상태 관리, 캐싱, 자동 재시도)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
이미지 파일 저장소는 어디를 사용하시겠습니까?

A) 서버 로컬 파일 시스템 (Docker 볼륨 마운트)
B) MinIO (S3 호환 오브젝트 스토리지, Docker 컨테이너로 실행)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Design Artifact Generation Checklist

질문 답변 후, 아래 단계에 따라 설계 산출물을 생성합니다.

- [x] Step 1: components.md - 컴포넌트 정의 및 책임
  - [x] 프론트엔드 컴포넌트 (페이지, UI 컴포넌트)
  - [x] 백엔드 컴포넌트 (API 라우터, 서비스, 모델, 인증)
  - [x] 데이터베이스 컴포넌트
- [x] Step 2: component-methods.md - 메서드 시그니처
  - [x] API 엔드포인트 정의
  - [x] 서비스 레이어 메서드
  - [x] 데이터 접근 레이어 메서드
- [x] Step 3: services.md - 서비스 정의 및 오케스트레이션
- [x] Step 4: component-dependency.md - 의존성 관계 및 통신 패턴
- [x] Step 5: application-design.md - 통합 설계 문서
- [x] Step 6: 설계 일관성 및 완전성 검증
