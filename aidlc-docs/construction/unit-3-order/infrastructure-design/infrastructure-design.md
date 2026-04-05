# 인프라 설계 - Unit 3: Customer Order Flow

> Unit 1 Foundation 인프라(Docker Compose 3-서비스)를 상속합니다.

---

## 1. 인프라 변경 사항 요약

Unit 3는 **기존 인프라에 코드만 추가**하며, 새로운 인프라 컴포넌트가 필요하지 않습니다.

| 항목 | 변경 | 상세 |
|---|---|---|
| Docker Compose | 변경 없음 | 기존 3-서비스 구조 유지 |
| PostgreSQL | 변경 없음 | 기존 DB에 데이터 추가 |
| Backend 컨테이너 | 코드 추가 | 새 라우터/서비스 파일 |
| Frontend 컨테이너 | 코드 추가 | 새 페이지/컴포넌트 파일 |
| Seed 스크립트 | 신규 | 테스트 데이터 스크립트 |

---

## 2. 기존 인프라 구조 (Unit 1 상속)

```
Docker Compose
├── frontend (Next.js, port 3000)
│   ├── 볼륨: ./frontend → /app (hot reload)
│   └── 환경: NEXT_PUBLIC_API_URL
├── backend (FastAPI, port 8000)
│   ├── 볼륨: ./backend → /app (hot reload)
│   ├── 볼륨: uploads → /app/uploads (이미지)
│   └── 환경: DATABASE_URL, JWT_SECRET, CORS_ORIGINS
└── db (PostgreSQL 16, port 5432)
    ├── 볼륨: pgdata → /var/lib/postgresql/data
    └── 환경: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
```

---

## 3. Unit 3 인프라 추가 요소

### 3.1 Seed 데이터 스크립트
- **위치**: `backend/seed/seed_data.py`
- **실행 방법**: `docker exec -it backend python -m seed.seed_data`
- **역할**: 테스트 카테고리 및 메뉴 데이터 삽입 (Unit 2 대체)
- **데이터**: 카테고리 3~5개, 메뉴 8~12개

### 3.2 DB 인덱스 권장사항
Unit 3 쿼리 성능을 위한 인덱스:
```sql
-- 현재 세션 주문 조회 최적화
CREATE INDEX ix_orders_store_table_session 
  ON orders (store_id, table_id, session_id);

-- 일일 주문번호 카운트 최적화
CREATE INDEX ix_orders_store_created 
  ON orders (store_id, created_at);
```
> SQLAlchemy 모델에 `Index()` 추가로 구현

---

## 4. 환경 변수

Unit 3에서 추가되는 환경 변수는 없습니다. 기존 `.env` 설정을 그대로 사용합니다.

| 변수 | 용도 | 사용처 |
|---|---|---|
| DATABASE_URL | DB 연결 (기존) | OrderService |
| JWT_SECRET | 토큰 검증 (기존) | order_router 인증 |

---

## 5. 네트워크 흐름

```
Customer Tablet
    │
    │ HTTP (port 3000)
    ▼
┌──────────┐     HTTP (port 8000)     ┌──────────┐
│ Frontend │ ──────────────────────── │ Backend  │
│ Next.js  │  POST /api/.../orders    │ FastAPI  │
│          │  GET  /api/.../current    │          │
└──────────┘                          └────┬─────┘
                                           │ TCP (5432)
                                      ┌────┴─────┐
                                      │    DB    │
                                      │PostgreSQL│
                                      └──────────┘
```

모든 통신은 Docker 내부 네트워크에서 이루어지며, 외부 노출은 frontend(3000), backend(8000)만 해당됩니다.
