# 배포 아키텍처 - Unit 3: Customer Order Flow

> Unit 1 Foundation 배포 아키텍처에 코드를 추가하는 방식입니다.

---

## 1. 파일 구조 (Unit 3 추가분)

```
backend/
├── app/
│   ├── services/
│   │   ├── order_service.py      (NEW - 주문 서비스)
│   │   └── table_service.py      (MODIFIED - start_session 추가)
│   ├── routers/
│   │   └── orders.py             (NEW - 주문 라우터)
│   └── main.py                   (MODIFIED - orders 라우터 등록)
├── seed/
│   ├── __init__.py               (NEW)
│   └── seed_data.py              (NEW - 테스트 데이터)
└── requirements.txt              (변경 없음)

frontend/src/
├── app/customer/
│   ├── cart/
│   │   └── page.tsx              (NEW - 장바구니 페이지)
│   ├── orders/
│   │   └── page.tsx              (NEW - 주문 내역 페이지)
│   └── order-success/
│       └── page.tsx              (NEW - 주문 성공 페이지)
├── components/
│   ├── customer/
│   │   ├── cart-item.tsx         (NEW - 장바구니 항목)
│   │   └── cart-summary.tsx      (NEW - 장바구니 요약)
│   └── ui/
│       └── order-card.tsx        (NEW - 주문 카드)
├── contexts/
│   └── cart-context.tsx          (MODIFIED - 전체 구현)
└── types/
    └── index.ts                  (MODIFIED - Cart/Order 타입 추가)
```

---

## 2. 백엔드 라우터 등록

`backend/app/main.py`에 추가:
```python
from app.routers import orders
app.include_router(orders.router)
```

---

## 3. Seed 데이터 실행 가이드

### 사전 조건
- Docker Compose가 실행 중이어야 합니다
- 최소 1개 Store와 Table이 생성되어 있어야 합니다

### 실행 명령
```bash
# 백엔드 컨테이너에서 seed 스크립트 실행
docker exec -it backend python -m seed.seed_data

# 또는 로컬 개발 환경에서
cd backend && python -m seed.seed_data
```

### Seed 데이터 내용
| 카테고리 | 메뉴 항목 |
|---|---|
| 메인 메뉴 | 김치찌개(9,000), 된장찌개(8,000), 비빔밥(10,000) |
| 사이드 메뉴 | 공기밥(1,000), 계란말이(7,000), 김치전(8,000) |
| 음료 | 콜라(2,000), 사이다(2,000), 맥주(5,000) |

---

## 4. 개발 워크플로우

```
1. Docker Compose 실행 (기존)
   $ docker compose up -d

2. 초기 설정 (기존 - 이미 완료된 경우 건너뛰기)
   - 브라우저에서 http://localhost:3000 접속
   - 매장 초기 설정 + 관리자 계정 생성
   - 테이블 추가

3. Seed 데이터 삽입 (Unit 3 신규)
   $ docker exec -it backend python -m seed.seed_data

4. 개발 (Hot Reload 활용)
   - 백엔드: backend/ 파일 수정 → uvicorn 자동 reload
   - 프론트엔드: frontend/src/ 파일 수정 → Next.js 자동 reload

5. 테스트
   - 태블릿 자동 로그인 → 메뉴 선택 → 장바구니 → 주문 → 성공 → 내역 확인
```
