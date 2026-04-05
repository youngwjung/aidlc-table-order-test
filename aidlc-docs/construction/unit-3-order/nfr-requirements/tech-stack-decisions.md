# 기술 스택 결정 - Unit 3: Customer Order Flow

> Unit 1 Foundation 기술 스택을 상속하며, Unit 3 특화 결정사항을 추가합니다.

---

## Unit 1 상속 기술 스택

| 영역 | 기술 | 버전 |
|---|---|---|
| 백엔드 프레임워크 | FastAPI | 0.115.x |
| ORM | SQLAlchemy (async) | 2.0.x |
| 데이터베이스 | PostgreSQL | 16.x |
| 프론트엔드 | Next.js (TypeScript) | 15.x |
| 스타일링 | Tailwind CSS | 3.x |
| 상태관리 | React Context + useReducer | React 19.x |
| 인증 | JWT (PyJWT) | 2.9.x |
| 컨테이너 | Docker Compose | 2.x |

---

## Unit 3 특화 기술 결정

### 1. 장바구니 상태 관리
- **기술**: React Context + useReducer (Unit 1 결정 상속)
- **영속화**: Web Storage API (localStorage)
- **직렬화**: JSON.stringify / JSON.parse
- **근거**: 서버 사이드 장바구니 대비 구현 단순, 네트워크 불필요, 프로토타입에 적합

### 2. 주문 API 구현
- **라우터**: FastAPI APIRouter (기존 패턴 준수)
- **서비스**: OrderService 클래스 (async 메서드)
- **DB 세션**: AsyncSession (의존성 주입)
- **트랜잭션**: 주문 생성 시 단일 트랜잭션 (Order + OrderItem 함께 커밋)

### 3. Seed 데이터
- **방식**: Python 스크립트 (`backend/seed/seed_data.py`)
- **실행**: 수동 실행 (`python -m seed.seed_data`)
- **내용**: 테스트 카테고리 3~5개, 테스트 메뉴 8~12개
- **근거**: Unit 2 (메뉴 관리) 없이 독립적 개발/테스트 가능

### 4. 금액 포맷팅
- **방식**: `Intl.NumberFormat('ko-KR')` 또는 직접 포맷
- **단위**: 원 (정수만, 소수점 없음)
- **표시**: 천 단위 쉼표 ("25,000원")

### 5. 라우팅 및 네비게이션
- **방식**: Next.js App Router (`useRouter`, `router.push`)
- **주문 성공 데이터 전달**: URL query parameters (`?orderNumber=001&totalAmount=25000`)
- **근거**: 브라우저 새로고침 시에도 데이터 유지, 상태 의존 없음
