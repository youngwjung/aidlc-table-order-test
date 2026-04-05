# 기술 스택 결정 - Unit 4: Admin Dashboard & Table Management

> Unit 1에서 결정된 기술 스택을 그대로 사용. Unit 4 특화 기술 결정만 추가.

---

## 1. Unit 1 상속 기술 스택

| 영역 | 기술 | 버전 |
|---|---|---|
| Backend | Python + FastAPI | 3.11+ / 0.100+ |
| Frontend | Next.js + TypeScript | 14+ / 5+ |
| Database | PostgreSQL | 16 |
| ORM | SQLAlchemy (async) | 2.0+ |
| CSS | Tailwind CSS | 3+ |
| Container | Docker + Docker Compose | - |
| Auth | JWT (PyJWT, HS256) | - |

---

## 2. Unit 4 특화 기술 결정

### SSE (Server-Sent Events) 구현

| 결정 | 선택 | 대안 | 이유 |
|---|---|---|---|
| SSE 서버 | FastAPI StreamingResponse | WebSocket | SSE는 단방향(서버→클라이언트)으로 충분, 구현 단순 |
| 이벤트 큐 | asyncio.Queue | Redis Pub/Sub | 단일 프로세스 프로토타입, 외부 의존성 불필요 |
| 구독 관리 | 인메모리 Dict[store_id, List[Queue]] | Redis Streams | 동일 이유 |
| Heartbeat | 서버측 30초 ping | - | 프록시 타임아웃 방지 표준 패턴 |

### SSE 클라이언트 (프론트엔드)

| 결정 | 선택 | 대안 | 이유 |
|---|---|---|---|
| SSE 클라이언트 | fetch + ReadableStream | EventSource API | EventSource는 커스텀 헤더 불가. fetch로 토큰 전달 유연성 확보 |
| 토큰 전달 | Query parameter (?token=) | fetch headers | EventSource 호환성도 유지 가능, 구현 단순 |
| 재연결 | 커스텀 useSSE 훅 | eventsource-polyfill | 지수 백오프 + 데이터 동기화 커스텀 로직 필요 |
| 상태 관리 | React useState + useEffect | Redux/Zustand | 대시보드 단일 페이지 범위, 외부 라이브러리 불필요 |

### 알림음

| 결정 | 선택 | 대안 | 이유 |
|---|---|---|---|
| 사운드 재생 | Web Audio API | Audio 태그 / mp3 파일 | 외부 파일 불필요, 간단한 beep 생성 |

### 날짜 관리

| 결정 | 선택 | 대안 | 이유 |
|---|---|---|---|
| 날짜 필터 UI | HTML native date input | date-fns-picker / react-datepicker | 외부 의존성 최소화, 브라우저 기본 date picker 충분 |
| 날짜 포맷 | ISO 8601 (YYYY-MM-DD) | - | API 표준 포맷 |

---

## 3. 추가 패키지 필요 없음

Unit 4는 Unit 1에서 설치한 패키지만으로 구현 가능:
- **Backend**: FastAPI, SQLAlchemy, PyJWT, bcrypt, python-multipart (이미 설치)
- **Frontend**: Next.js, TypeScript, Tailwind CSS (이미 설치)
- **추가 패키지**: 없음
