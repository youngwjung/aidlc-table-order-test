# 컴포넌트 의존성 (Component Dependencies)

---

## 1. 백엔드 서비스 의존성 매트릭스

| 서비스 (사용자) | AuthService | StoreService | TableService | CategoryService | MenuService | OrderService | ImageService | SSEService |
|---|---|---|---|---|---|---|---|---|
| **AuthService** | - | R | R | - | - | - | - | - |
| **StoreService** | - | - | - | - | - | - | - | - |
| **TableService** | - | - | - | - | - | R | - | W |
| **CategoryService** | - | - | - | - | R | - | - | - |
| **MenuService** | - | - | - | R | - | - | R/W | - |
| **OrderService** | - | - | R | - | - | - | - | W |
| **ImageService** | - | - | - | - | - | - | - | - |
| **SSEService** | - | - | - | - | - | - | - | - |

> R = Read(조회), W = Write(쓰기/이벤트 발행), R/W = 둘 다

---

## 2. 의존성 다이어그램

```
+-------------+
| AuthService |----> StoreService
|             |----> TableService
+-------------+

+---------------+
| TableService  |----> OrderService (이력 이동)
|               |----> SSEService (이벤트 발행)
+---------------+

+-----------------+
| CategoryService |----> MenuService (삭제 검증: 메뉴 존재 확인)
+-----------------+

+-------------+
| MenuService |----> ImageService (업로드/삭제)
|             |----> CategoryService (카테고리 검증)
+-------------+

+--------------+
| OrderService |----> TableService (세션 확인)
|              |----> SSEService (이벤트 발행)
+--------------+

+--------------+     +------------+
| ImageService |     | SSEService |
| (독립)       |     | (독립)     |
+--------------+     +------------+
```

---

## 3. 프론트엔드-백엔드 통신 패턴

### 3.1 고객 화면 통신
```
+------------------+          +------------------+
| Customer Pages   |   HTTP   | FastAPI Backend  |
|                  |--------->|                  |
| - Menu Page      |  fetch   | - auth/table     |
| - Cart Page      |--------->| - menus (GET)    |
| - Orders Page    |  fetch   | - orders (POST)  |
| - Setup Page     |--------->| - orders (GET)   |
+------------------+          +------------------+
```

### 3.2 관리자 화면 통신
```
+------------------+          +------------------+
| Admin Pages      |   HTTP   | FastAPI Backend  |
|                  |--------->|                  |
| - Dashboard      |  fetch   | - auth/admin     |
| - Table Detail   |--------->| - orders CRUD    |
| - Menu Mgmt      |  fetch   | - menus CRUD     |
| - Category Mgmt  |--------->| - categories     |
| - Table Mgmt     |  fetch   | - tables CRUD    |
|                  |          |                  |
|                  |   SSE    |                  |
|  (Dashboard)     |<---------| - sse/orders     |
+------------------+          +------------------+
```

---

## 4. 데이터 흐름

### 4.1 멀티테넌트 데이터 격리
```
모든 API 요청
  -> JWT에서 store_id 추출
  -> 모든 DB 쿼리에 store_id 조건 추가
  -> 다른 매장 데이터 접근 불가
```

### 4.2 인증 흐름
```
고객 태블릿:
  로컬 저장 정보 -> POST /api/auth/table/login -> JWT -> localStorage

관리자:
  로그인 폼 -> POST /api/auth/admin/login -> JWT -> localStorage
  -> 모든 API 요청 헤더에 Bearer 토큰 포함
  -> 16시간 후 만료 -> 로그인 페이지 리다이렉트
```

### 4.3 장바구니 데이터 흐름
```
메뉴 담기 -> CartContext (React Context)
  -> localStorage 동기화 (새로고침 유지)
  -> 주문 확정 시 -> POST /api/stores/{id}/orders (서버 전송)
  -> 성공 시 -> CartContext 초기화 + localStorage 클리어
```

---

## 5. Docker 컨테이너 간 통신

```
+-------------------+     +-------------------+     +-------------------+
|   frontend        |     |   backend         |     |   db              |
|   (Next.js)       |     |   (FastAPI)       |     |   (PostgreSQL)    |
|   Port: 3000      |---->|   Port: 8000      |---->|   Port: 5432      |
+-------------------+     +-------------------+     +-------------------+
                                    |
                                    v
                          +-------------------+
                          |   uploads volume  |
                          |   (이미지 저장)    |
                          +-------------------+
```

- **frontend → backend**: HTTP (fetch), SSE
- **backend → db**: TCP (SQLAlchemy async)
- **backend → uploads**: 로컬 파일 시스템 (Docker 볼륨 마운트)
