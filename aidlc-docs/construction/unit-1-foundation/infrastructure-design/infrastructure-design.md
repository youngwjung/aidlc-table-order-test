# 인프라 설계 - Unit 1: Foundation

---

## 1. 컨테이너 구성

### 전체 구조
```
docker-compose.yml
  |
  +-- frontend (Next.js dev)
  |     Port: 3000
  |     Volume: ./frontend/src → /app/src (핫 리로드)
  |
  +-- backend (FastAPI + uvicorn --reload)
  |     Port: 8000
  |     Volume: ./backend/app → /app/app (핫 리로드)
  |     Volume: ./uploads → /app/uploads (이미지)
  |
  +-- db (PostgreSQL 16)
        Port: 5432
        Volume: pgdata → /var/lib/postgresql/data
```

### 컨테이너 상세

#### frontend
| 항목 | 값 |
|---|---|
| 이미지 | node:20-alpine |
| 포트 | 3000:3000 |
| 명령어 | `npm run dev` |
| 볼륨 | `./frontend/src:/app/src` (소스 핫 리로드) |
| 환경변수 | NEXT_PUBLIC_API_URL |
| 의존 | backend |

#### backend
| 항목 | 값 |
|---|---|
| 이미지 | python:3.11-slim (Dockerfile 빌드) |
| 포트 | 8000:8000 |
| 명령어 | `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |
| 볼륨 | `./backend/app:/app/app` (소스 핫 리로드), `./uploads:/app/uploads` (이미지 저장) |
| 환경변수 | DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_HOURS, BACKEND_CORS_ORIGINS |
| 의존 | db (healthcheck 대기) |

#### db
| 항목 | 값 |
|---|---|
| 이미지 | postgres:16-alpine |
| 포트 | 5432:5432 |
| 볼륨 | `pgdata:/var/lib/postgresql/data` (데이터 영속) |
| 환경변수 | POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB |
| 헬스체크 | `pg_isready -U postgres` |

---

## 2. 네트워크

### 기본 네트워크 (Docker Compose default)
- 모든 컨테이너가 동일 브리지 네트워크에 연결
- 서비스명으로 DNS 해석 (frontend → backend → db)

### 통신 경로
```
브라우저 (localhost:3000)
    |
    v
frontend (Next.js, port 3000)
    |  fetch("http://backend:8000/api/...")  ← 서버 사이드
    |  fetch("http://localhost:8000/api/...") ← 클라이언트 사이드
    v
backend (FastAPI, port 8000)
    |  postgresql+asyncpg://postgres:postgres@db:5432/tableorder
    v
db (PostgreSQL, port 5432)
```

> **Note**: 클라이언트 사이드 API 호출은 `localhost:8000`으로, 서버 사이드(SSR)는 `backend:8000`으로 접근. NEXT_PUBLIC_API_URL은 클라이언트용 `http://localhost:8000` 설정.

---

## 3. 볼륨

| 볼륨 | 타입 | 용도 |
|---|---|---|
| `./frontend/src:/app/src` | 바인드 마운트 | 프론트엔드 소스 핫 리로드 |
| `./backend/app:/app/app` | 바인드 마운트 | 백엔드 소스 핫 리로드 |
| `./uploads:/app/uploads` | 바인드 마운트 | 이미지 파일 저장 (호스트에서도 접근 가능) |
| `pgdata` | 네임드 볼륨 | PostgreSQL 데이터 영속 |

---

## 4. 환경 변수 관리

### .env 파일 (루트)
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tableorder
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/tableorder

# JWT
JWT_SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=16

# Backend
BACKEND_CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. 헬스체크 및 의존성

### 시작 순서
```
1. db (PostgreSQL) → healthcheck: pg_isready
2. backend (FastAPI) → depends_on: db (healthy) → lifespan: create_all()
3. frontend (Next.js) → depends_on: backend
```

### 헬스체크
- **db**: `pg_isready -U postgres` (interval: 5s, retries: 5)
- **backend**: `GET /health` → `{"status": "ok", "database": "connected"}`
