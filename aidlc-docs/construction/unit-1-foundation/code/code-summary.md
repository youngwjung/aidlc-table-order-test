# Code Summary - Unit 1: Foundation

## 생성된 파일 목록

### 루트 인프라 (4개)
- `docker-compose.yml` - Docker Compose 설정 (3 서비스)
- `.env.example` - 환경 변수 템플릿
- `.gitignore` - Git 제외 파일 목록
- `uploads/.gitkeep` - 이미지 업로드 디렉토리

### 백엔드 (25개)
- `backend/Dockerfile`
- `backend/requirements.txt`
- `backend/app/__init__.py`
- `backend/app/config.py` - 환경 변수 로드
- `backend/app/database.py` - SQLAlchemy async 엔진, 세션
- `backend/app/main.py` - FastAPI 앱 (lifespan, CORS, 라우터)
- **Models (8개)**: `models/__init__.py`, `store.py`, `admin_user.py`, `table.py`, `category.py`, `menu.py`, `order.py`, `order_history.py`
- **Schemas (7개)**: `schemas/__init__.py`, `auth.py`, `store.py`, `table.py`, `category.py`, `menu.py`, `order.py`
- **Middleware (3개)**: `middleware/__init__.py`, `auth.py` (JWT, bcrypt, RBAC), `rate_limiter.py`
- **Services (3개)**: `services/__init__.py`, `auth_service.py`, `store_service.py`
- **Routers (3개)**: `routers/__init__.py`, `auth.py`, `stores.py`

### 프론트엔드 (22개)
- `frontend/Dockerfile`
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/next.config.js`
- `frontend/tailwind.config.ts`
- `frontend/postcss.config.js`
- **Types**: `src/types/index.ts` (전체 TypeScript 타입)
- **Lib**: `src/lib/api-client.ts`, `src/lib/token-utils.ts`
- **Contexts**: `src/contexts/auth-context.tsx`, `src/contexts/cart-context.tsx`
- **UI Components (4개)**: `toast.tsx`, `confirm-modal.tsx`, `status-badge.tsx`, `loading-spinner.tsx`
- **Layouts (2개)**: `admin-layout.tsx`, `customer-layout.tsx`
- **Pages (7개)**: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/setup/page.tsx`, `app/admin/login/page.tsx`, `app/admin/dashboard/page.tsx`, `app/customer/setup/page.tsx`, `app/customer/menu/page.tsx`

### 총 파일 수: **51개**

## 실행 방법

```bash
cp .env.example .env
docker compose up --build
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
