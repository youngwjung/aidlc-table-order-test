# 배포 아키텍처 - Unit 1: Foundation

---

## 1. docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      JWT_ALGORITHM: ${JWT_ALGORITHM}
      JWT_EXPIRE_HOURS: ${JWT_EXPIRE_HOURS}
      BACKEND_CORS_ORIGINS: ${BACKEND_CORS_ORIGINS}
    volumes:
      - ./backend/app:/app/app
      - ./uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    volumes:
      - ./frontend/src:/app/src
    depends_on:
      - backend
    command: npm run dev

volumes:
  pgdata:
```

---

## 2. backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 (개발 시 볼륨 마운트로 오버라이드됨)
COPY . .

# uploads 디렉토리 생성
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 3. frontend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 의존성
COPY package.json package-lock.json* ./
RUN npm install

# 소스 코드 (개발 시 볼륨 마운트로 오버라이드됨)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## 4. .env.example

```env
# ===== Database =====
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tableorder
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/tableorder

# ===== JWT =====
JWT_SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=16

# ===== Backend =====
BACKEND_CORS_ORIGINS=http://localhost:3000

# ===== Frontend =====
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. .gitignore 관련

```gitignore
# 환경 변수
.env

# 업로드 이미지
uploads/*
!uploads/.gitkeep

# Docker
pgdata/

# Python
__pycache__/
*.pyc

# Node
node_modules/
.next/
```

---

## 6. 실행 방법

### 최초 실행
```bash
# 1. 환경 변수 설정
cp .env.example .env

# 2. 전체 서비스 시작
docker compose up --build

# 3. 접속
# - 프론트엔드: http://localhost:3000
# - 백엔드 API: http://localhost:8000
# - Swagger UI: http://localhost:8000/docs
# - DB: localhost:5432
```

### 개발 워크플로우
```bash
# 서비스 시작 (백그라운드)
docker compose up -d

# 로그 확인
docker compose logs -f backend
docker compose logs -f frontend

# 서비스 중지
docker compose down

# 데이터 포함 전체 삭제
docker compose down -v
```

### 핫 리로드
- **백엔드**: `./backend/app/` 파일 수정 → uvicorn 자동 재시작
- **프론트엔드**: `./frontend/src/` 파일 수정 → Next.js 자동 갱신
- **DB 스키마 변경**: 컨테이너 재시작 필요 (`docker compose restart backend`)

---

## 7. 디렉토리 구조 (루트)

```
aidlc-table-order/
  docker-compose.yml
  .env.example
  .env                    # .gitignore
  .gitignore
  backend/
    Dockerfile
    requirements.txt
    app/
      main.py
      config.py
      database.py
      models/
      schemas/
      services/
      routers/
      middleware/
  frontend/
    Dockerfile
    package.json
    tsconfig.json
    tailwind.config.ts
    next.config.js
    src/
      app/
      components/
      contexts/
      hooks/
      lib/
      types/
  uploads/
    .gitkeep
```
