# 기술 스택 결정 - Unit 1: Foundation

---

## 백엔드

| 기술 | 버전 | 용도 |
|---|---|---|
| **Python** | 3.11+ | 런타임 |
| **FastAPI** | 0.110+ | 웹 프레임워크 |
| **Uvicorn** | 0.29+ | ASGI 서버 |
| **SQLAlchemy** | 2.0+ | ORM (async) |
| **asyncpg** | 0.29+ | PostgreSQL async 드라이버 |
| **Pydantic** | 2.0+ | 데이터 검증, 스키마 |
| **PyJWT** | 2.8+ | JWT 토큰 발급/검증 |
| **bcrypt** | 4.1+ | 비밀번호 해싱 |
| **python-multipart** | 0.0.9+ | 파일 업로드 (FormData) |
| **aiofiles** | 23.2+ | 비동기 파일 I/O |

### requirements.txt
```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
pydantic>=2.0.0
pyjwt>=2.8.0
bcrypt>=4.1.0
python-multipart>=0.0.9
aiofiles>=23.2.0
```

---

## 프론트엔드

| 기술 | 버전 | 용도 |
|---|---|---|
| **Node.js** | 20 LTS | 런타임 |
| **Next.js** | 14+ | React 프레임워크 (App Router) |
| **React** | 18+ | UI 라이브러리 |
| **TypeScript** | 5.0+ | 타입 안전성 |
| **Tailwind CSS** | 3.4+ | 스타일링 |

### package.json 주요 의존성
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 데이터베이스

| 기술 | 버전 | 용도 |
|---|---|---|
| **PostgreSQL** | 16 | 관계형 데이터베이스 |

### 연결 설정
- 드라이버: asyncpg (비동기)
- 연결 문자열: `postgresql+asyncpg://user:password@db:5432/tableorder`
- 풀 크기: 기본값 (5)
- 최대 오버플로우: 10

---

## 인프라

| 기술 | 버전 | 용도 |
|---|---|---|
| **Docker** | 24+ | 컨테이너화 |
| **Docker Compose** | 2.0+ | 멀티 컨테이너 오케스트레이션 |

### 컨테이너 구성
```yaml
services:
  frontend:    # Next.js (Node 20 Alpine)
    port: 3000
  backend:     # FastAPI (Python 3.11 Slim)
    port: 8000
    volumes: [uploads]
  db:          # PostgreSQL 16 Alpine
    port: 5432
    volumes: [pgdata]
```

### 환경 변수 (.env)
```
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/tableorder

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=16

# Backend
BACKEND_CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 기술 선택 근거 요약

| 결정 | 근거 |
|---|---|
| Python 3.11+ | 안정적, FastAPI async 지원 |
| FastAPI | 높은 성능, 자동 Swagger, async 네이티브, Pydantic 통합 |
| SQLAlchemy 2.0 async | 성숙한 ORM, async 지원, 풍부한 생태계 |
| asyncpg | 가장 빠른 Python PostgreSQL async 드라이버 |
| create_all() | 프로토타입 수준, Alembic 복잡성 불필요 |
| Next.js 14 App Router | SSR/SSG 지원, 파일 기반 라우팅, React 최신 기능 |
| Tailwind CSS | 유틸리티 기반, 빠른 스타일링, 번들 최적화 |
| fetch API | 브라우저 내장, 추가 의존성 불필요 |
| React Context | 경량 상태관리, 외부 라이브러리 불필요 |
| Docker Compose | 개발환경 일관성, 단일 명령어 기동 |
| PostgreSQL 16 | 안정적, 풍부한 기능, 멀티테넌트 적합 |
