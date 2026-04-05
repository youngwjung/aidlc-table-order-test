# NFR 설계 패턴 - Unit 1: Foundation

---

## 1. 인증 패턴 (Authentication Pattern)

### 1.1 JWT Bearer Token 패턴
```
클라이언트                       서버
  |                              |
  |-- POST /auth/login --------->|
  |   {credentials}              |
  |                              |-- 자격증명 검증
  |                              |-- JWT 생성 (HS256, 16h)
  |<-- {access_token} -----------|
  |                              |
  |-- GET /api/resource -------->|
  |   Authorization: Bearer {t}  |
  |                              |-- JWT 검증 (미들웨어)
  |                              |-- store_id 추출
  |                              |-- 경로 store_id 일치 검증
  |<-- {data} -------------------|
```

**적용 위치**: 모든 보호된 API 엔드포인트
**구현**: FastAPI Dependency Injection

```python
# 패턴: 인증 의존성
async def get_current_user(request: Request) -> TokenPayload:
    token = extract_bearer_token(request)
    payload = verify_jwt(token)
    validate_store_access(request.path_params, payload.store_id)
    return payload

# 라우터에서 사용
@router.get("/stores/{store_id}/menus")
async def get_menus(store_id: int, user: TokenPayload = Depends(get_current_user)):
    ...
```

### 1.2 역할 기반 접근 제어 (RBAC)
- **admin**: 관리자 전용 엔드포인트 (메뉴 CRUD, 주문 관리, 테이블 관리)
- **table**: 고객 전용 엔드포인트 (메뉴 조회, 주문 생성, 주문 조회)

```python
# 패턴: 역할 검증 의존성
def require_role(role: str):
    async def check_role(user: TokenPayload = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(403, detail="접근 권한이 없습니다")
        return user
    return check_role

# 사용
@router.post("/stores/{store_id}/menus")
async def create_menu(user: TokenPayload = Depends(require_role("admin"))):
    ...
```

---

## 2. 로그인 시도 제한 패턴 (Rate Limiting)

### 인메모리 슬라이딩 윈도우
```python
# 패턴: 인메모리 Rate Limiter
login_attempts: dict[str, list[datetime]] = {}

def check_rate_limit(key: str, max_attempts: int = 3, window_seconds: int = 60):
    now = datetime.utcnow()
    attempts = login_attempts.get(key, [])
    # 윈도우 밖 시도 제거
    recent = [a for a in attempts if (now - a).total_seconds() < window_seconds]
    if len(recent) >= max_attempts:
        raise HTTPException(429, detail="잠시 후 다시 시도해 주세요")
    login_attempts[key] = recent

def record_failed_attempt(key: str):
    login_attempts.setdefault(key, []).append(datetime.utcnow())

def clear_attempts(key: str):
    login_attempts.pop(key, None)
```

**키**: `{store_identifier}:{username}`
**제한**: 3회 / 60초

---

## 3. 데이터베이스 세션 패턴 (DB Session Management)

### 요청당 세션 (Session-per-Request)
```python
# 패턴: Async 세션 의존성
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# 서비스에서 사용
@router.post("/stores/{store_id}/orders")
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    order = await order_service.create_order(db, data)
    return order
```

### DB 초기화 (lifespan 자동 실행)
```python
# 패턴: FastAPI lifespan 이벤트에서 create_all
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 앱 시작 시 테이블 자동 생성
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 앱 종료 시 정리
    await engine.dispose()

app = FastAPI(lifespan=lifespan)
```

---

## 4. 에러 처리 패턴 (Error Handling)

### HTTPException 직접 사용
```python
# 패턴: FastAPI HTTPException 직접 사용 (별도 예외 클래스 없음)

# 서비스에서 에러 발생
async def get_menu(db: AsyncSession, store_id: int, menu_id: int):
    menu = await db.get(Menu, menu_id)
    if not menu or menu.store_id != store_id:
        raise HTTPException(404, detail="메뉴를 찾을 수 없습니다")
    return menu

# 인증 실패
async def authenticate_admin(db, store_identifier, username, password):
    store = await get_store_by_identifier(db, store_identifier)
    if not store:
        raise HTTPException(401, detail="매장 식별자, 사용자명 또는 비밀번호가 올바르지 않습니다")
    ...

# 검증 실패 (Pydantic 자동 처리 → 422)
class MenuCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=0, le=10000000)
    category_id: int
```

### 에러 응답 형식
```json
// HTTPException → 자동 변환
{"detail": "메뉴를 찾을 수 없습니다"}

// Pydantic 검증 실패 → FastAPI 자동 변환 (422)
{"detail": [{"loc": ["body", "name"], "msg": "field required", "type": "value_error.missing"}]}
```

### 프론트엔드 에러 처리
```typescript
// 패턴: apiClient에서 에러 분기
async function request<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(baseUrl + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    // 자동 로그아웃
    logout();
    throw new Error("세션이 만료되었습니다");
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "오류가 발생했습니다");
  }
  return response.json();
}

// 컴포넌트에서 useState로 개별 관리
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleSubmit() {
  setIsLoading(true);
  setError(null);
  try {
    await apiClient.post("/stores/{id}/menus", data);
    // 성공 처리
  } catch (e) {
    setError(e.message);
  } finally {
    setIsLoading(false);
  }
}
```

---

## 5. SSE 패턴 (Server-Sent Events)

### 인메모리 이벤트 브로커
```python
# 패턴: Store별 이벤트 큐
class SSEBroker:
    def __init__(self):
        self._subscribers: dict[int, list[asyncio.Queue]] = {}

    def subscribe(self, store_id: int) -> asyncio.Queue:
        queue = asyncio.Queue()
        self._subscribers.setdefault(store_id, []).append(queue)
        return queue

    def unsubscribe(self, store_id: int, queue: asyncio.Queue):
        if store_id in self._subscribers:
            self._subscribers[store_id].remove(queue)

    async def broadcast(self, store_id: int, event_type: str, data: dict):
        for queue in self._subscribers.get(store_id, []):
            await queue.put({"event": event_type, "data": data})

sse_broker = SSEBroker()  # 싱글턴
```

### SSE 엔드포인트
```python
@router.get("/stores/{store_id}/sse/orders")
async def stream_orders(store_id: int, user = Depends(require_role("admin"))):
    queue = sse_broker.subscribe(store_id)
    async def event_generator():
        try:
            while True:
                event = await queue.get()
                yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"
        finally:
            sse_broker.unsubscribe(store_id, queue)
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### 클라이언트 - EventSource 기본 재연결
```typescript
// 패턴: EventSource 기본 자동 재연결 (별도 로직 없음)
function useSSE(url: string, handlers: Record<string, (data: any) => void>) {
  useEffect(() => {
    const token = getToken();
    const eventSource = new EventSource(`${url}?token=${token}`);

    // 이벤트 타입별 핸들러 등록
    Object.entries(handlers).forEach(([event, handler]) => {
      eventSource.addEventListener(event, (e) => {
        handler(JSON.parse(e.data));
      });
    });

    // EventSource는 연결 끊김 시 자동 재연결 시도
    // 별도 커스텀 재연결 로직 불필요

    return () => eventSource.close();
  }, [url]);
}
```

---

## 6. 멀티테넌트 패턴 (Multi-Tenancy)

### 공유 DB + store_id 필터링
```python
# 패턴: 모든 쿼리에 store_id 자동 필터
async def get_menus(db: AsyncSession, store_id: int, category_id: int = None):
    query = select(Menu).where(Menu.store_id == store_id)
    if category_id:
        query = query.where(Menu.category_id == category_id)
    query = query.order_by(Menu.display_order)
    result = await db.execute(query)
    return result.scalars().all()
```

**규칙**: 모든 서비스 메서드의 첫 번째 필터는 반드시 `store_id`

---

## 7. 프론트엔드 인증 상태 패턴

### Context + localStorage 동기화
```
앱 초기화
  -> localStorage에서 토큰 읽기
  -> JWT 디코딩 (만료 확인)
  -> 유효: authContext에 user 설정
  -> 무효/없음: 로그인/설정 페이지로 리다이렉트

API 호출
  -> apiClient가 localStorage에서 토큰 가져옴
  -> Authorization 헤더 자동 추가
  -> 401 응답 시: localStorage 클리어 -> 리다이렉트
```

### 프론트엔드 로딩/에러 상태 관리
```typescript
// 패턴: 각 컴포넌트에서 useState 개별 관리
function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMenus() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Menu[]>(`/stores/${storeId}/menus`);
      setMenus(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  // isLoading → 로딩 스피너 표시
  // error → Toast 또는 인라인 에러 메시지
  // 성공 → 데이터 렌더링
}
```
