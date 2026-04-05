# 논리적 컴포넌트 - Unit 1: Foundation

---

## 시스템 논리 아키텍처

```
+------------------------------------------------------------------+
|                        Docker Compose                             |
|                                                                   |
|  +------------------+  +---------------------+  +--------------+  |
|  |   frontend       |  |   backend           |  |   db         |  |
|  |   (Next.js)      |  |   (FastAPI)         |  | (PostgreSQL) |  |
|  |                   |  |                     |  |              |  |
|  | +---------------+ |  | +-----------------+ |  | +----------+ |  |
|  | | App Router    | |  | | API Routers     | |  | | stores   | |  |
|  | | /customer/*   | |  | | /api/auth       | |  | | admin_   | |  |
|  | | /admin/*      | |  | | /api/stores     | |  | |  users   | |  |
|  | | /setup        | |  | | /api/.../tables | |  | | tables   | |  |
|  | +---------------+ |  | | /api/.../menus  | |  | | categor  | |  |
|  |        |          |  | | /api/.../orders | |  | |  ies     | |  |
|  | +---------------+ |  | | /api/.../sse    | |  | | menus    | |  |
|  | | Contexts      | |  | +-----------------+ |  | | orders   | |  |
|  | | authContext   | |  |        |             |  | | order_   | |  |
|  | | cartContext   | |  | +-----------------+ |  | |  items   | |  |
|  | +---------------+ |  | | Middleware      | |  | | order_   | |  |
|  |        |          |  | | JWT Auth       | |  | |  history | |  |
|  | +---------------+ |  | | CORS           | |  | | order_h  | |  |
|  | | apiClient     |------| Rate Limiter   | |  | |  _items  | |  |
|  | | (fetch)       | |  | +-----------------+ |  | +----------+ |  |
|  | +---------------+ |  |        |             |  |              |  |
|  |        |          |  | +-----------------+ |  |              |  |
|  | +---------------+ |  | | Services        | |  |              |  |
|  | | useSSE        |<-----| SSE Broker     | |  |              |  |
|  | | (EventSource) | |  | | (in-memory)    | |  |              |  |
|  | +---------------+ |  | +-----------------+ |  |              |  |
|  |                   |  |        |             |  |              |  |
|  | +---------------+ |  | +-----------------+ |  |              |  |
|  | | localStorage  | |  | | SQLAlchemy     |-------->          |  |
|  | | - JWT token   | |  | | Async Sessions | |  |              |  |
|  | | - Cart data   | |  | | + lifespan     | |  |              |  |
|  | | - Table creds | |  | |   create_all() | |  |              |  |
|  | +---------------+ |  | +-----------------+ |  |              |  |
|  |                   |  |                     |  |              |  |
|  +------------------+  | +-----------------+ |  +--------------+  |
|                         | | Image Storage   | |                    |
|                         | | /uploads/       | |                    |
|                         | +-----------------+ |                    |
|                         +---------------------+                    |
|                                  |                                 |
|                         +---------------------+                    |
|                         |   uploads volume    |                    |
|                         +---------------------+                    |
+------------------------------------------------------------------+
```

---

## 논리적 컴포넌트 목록

### 1. 인증 컴포넌트 (Authentication)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **JWT Auth Dependency** | 백엔드 | 토큰 검증, 사용자 컨텍스트 설정 | FastAPI Depends |
| **Role Check Dependency** | 백엔드 | admin/table 역할 검증 | RBAC |
| **Rate Limiter** | 백엔드 | 로그인 시도 제한 (3회/1분) | 인메모리 슬라이딩 윈도우 |
| **authContext** | 프론트엔드 | 인증 상태 관리 | Context + useReducer |
| **tokenUtils** | 프론트엔드 | JWT 저장/조회/만료확인 | localStorage |

### 2. 데이터 접근 컴포넌트 (Data Access)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **SQLAlchemy Engine** | 백엔드 | DB 연결 풀 관리 | 연결 풀 (5+10) |
| **Async Session** | 백엔드 | 요청별 DB 세션 | Session-per-Request |
| **Lifespan Init** | 백엔드 | 앱 시작 시 create_all() 자동 실행 | FastAPI lifespan |
| **ORM Models** | 백엔드 | 엔티티-테이블 매핑 | Declarative Base |

### 3. 실시간 통신 컴포넌트 (Real-time)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **SSE Broker** | 백엔드 | 이벤트 브로드캐스트 | Pub-Sub (인메모리 asyncio.Queue) |
| **useSSE Hook** | 프론트엔드 | SSE 연결/이벤트 수신 | EventSource 기본 자동 재연결 |

### 4. API 통신 컴포넌트 (API Communication)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **apiClient** | 프론트엔드 | HTTP 요청 래퍼 | fetch + 인증 헤더 자동 추가 |
| **CORS Middleware** | 백엔드 | 크로스 오리진 허용 | 화이트리스트 |

### 5. 파일 저장 컴포넌트 (File Storage)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **ImageService** | 백엔드 | 이미지 업로드/서빙 | 로컬 파일시스템 + UUID 파일명 |
| **uploads volume** | Docker | 이미지 영구 저장 | 볼륨 마운트 |

### 6. 에러 처리 컴포넌트 (Error Handling)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **HTTPException** | 백엔드 | FastAPI 내장 예외 직접 사용 | 상태코드 + detail 메시지 |
| **Pydantic Validation** | 백엔드 | 요청 데이터 자동 검증 | 422 자동 응답 |
| **apiClient 에러 분기** | 프론트엔드 | 401 자동 로그아웃, 에러 throw | fetch 응답 상태 확인 |
| **useState 개별 관리** | 프론트엔드 | 컴포넌트별 isLoading/error 상태 | useState 패턴 |
| **Toast** | 프론트엔드 | 사용자 에러/성공 피드백 | 알림 컴포넌트 |

### 7. 상태 관리 컴포넌트 (State Management)

| 컴포넌트 | 위치 | 역할 | 패턴 |
|---|---|---|---|
| **authContext** | 프론트엔드 | 인증 상태 | Context + useReducer + localStorage |
| **cartContext** | 프론트엔드 | 장바구니 상태 | Context + useReducer + localStorage |

---

## 컨테이너 구성 상세

### frontend (Next.js)
- **베이스 이미지**: node:20-alpine
- **포트**: 3000
- **환경 변수**: NEXT_PUBLIC_API_URL
- **빌드**: `npm run build` → `npm start`

### backend (FastAPI)
- **베이스 이미지**: python:3.11-slim
- **포트**: 8000
- **환경 변수**: DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_HOURS, BACKEND_CORS_ORIGINS
- **볼륨**: ./uploads:/app/uploads
- **실행**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **DB 초기화**: lifespan 이벤트에서 create_all() 자동 실행

### db (PostgreSQL)
- **베이스 이미지**: postgres:16-alpine
- **포트**: 5432
- **환경 변수**: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- **볼륨**: pgdata:/var/lib/postgresql/data

---

## 헬스체크

```
GET /health → {"status": "ok", "database": "connected"}
```
- DB 연결 확인 포함
- Docker Compose healthcheck에서 사용
