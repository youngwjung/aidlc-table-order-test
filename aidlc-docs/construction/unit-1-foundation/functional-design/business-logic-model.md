# 비즈니스 로직 모델 - Unit 1: Foundation

---

## 1. 시스템 초기화 흐름

### 1.1 최초 접속 (매장 없음)
```
사용자 접속
  -> GET /api/stores/check-setup
  -> 매장 존재 여부 확인
  -> 매장 없음 -> 초기 설정 화면 리다이렉트
  -> 초기 설정 폼 표시:
     - 매장명
     - 매장 식별자 (영문소문자+숫자+하이픈, 3~30자)
     - 관리자 사용자명
     - 관리자 비밀번호
  -> POST /api/stores/setup
  -> 매장 생성 + 관리자 생성 (트랜잭션)
  -> 성공 -> 관리자 로그인 화면으로 리다이렉트
```

### 1.2 이후 접속 (매장 존재)
```
사용자 접속
  -> GET /api/stores/check-setup
  -> 매장 존재 -> 정상 라우팅 (로그인 또는 자동 로그인)
```

---

## 2. 관리자 인증 흐름

### 2.1 로그인
```
관리자 로그인 요청
  -> POST /api/auth/admin/login
     body: {store_identifier, username, password}

  -> Step 1: 로그인 시도 제한 확인
     - key = store_identifier + ":" + username
     - 3회 연속 실패 & 마지막 실패로부터 1분 미경과
       -> 429 Too Many Requests ("잠시 후 다시 시도해 주세요")

  -> Step 2: 매장 조회
     - Store.identifier == store_identifier
     - 없음 -> 401 Unauthorized (일반 에러 메시지)

  -> Step 3: 관리자 조회
     - AdminUser.store_id == store.id AND AdminUser.username == username
     - 없음 -> 401 Unauthorized (일반 에러 메시지)

  -> Step 4: 비밀번호 검증
     - bcrypt.verify(password, admin_user.password_hash)
     - 불일치 -> 실패 카운터 증가 -> 401 Unauthorized (일반 에러 메시지)

  -> Step 5: JWT 발급
     - payload: {sub: admin_user.id, store_id: store.id, role: "admin"}
     - exp: 현재시각 + 16시간
     - 실패 카운터 초기화

  -> Response: {access_token, token_type: "bearer", expires_in: 57600}
```

### 2.2 토큰 검증 (미들웨어)
```
API 요청 수신
  -> Authorization 헤더 확인
     - 없음 -> 401 Unauthorized

  -> JWT 디코딩
     - 만료됨 -> 401 Unauthorized
     - 유효하지 않음 -> 401 Unauthorized

  -> store_id 추출
     - URL 경로의 store_id와 JWT store_id 비교
     - 불일치 -> 403 Forbidden

  -> 요청 컨텍스트에 사용자 정보 설정
     - request.state.user = {id, store_id, role}
```

### 2.3 자동 로그아웃
```
프론트엔드 API 호출
  -> 401 Unauthorized 응답 수신
  -> authContext: 토큰 제거
  -> localStorage에서 토큰 삭제
  -> 로그인 페이지로 리다이렉트
```

---

## 3. 테이블 인증 흐름

### 3.1 초기 설정 (관리자가 수행)
```
태블릿 초기 설정 화면
  -> 매장 식별자 입력
  -> 테이블 번호 입력
  -> 테이블 비밀번호 입력
  -> "설정" 버튼 클릭

  -> POST /api/auth/table/login
     body: {store_identifier, table_number, password}

  -> 인증 성공:
     - localStorage에 저장:
       {store_identifier, table_number, password, access_token}
     - 메뉴 화면으로 리다이렉트

  -> 인증 실패:
     - 에러 메시지 표시
     - 설정 화면 유지
```

### 3.2 자동 로그인
```
태블릿 브라우저 접속/새로고침
  -> localStorage에서 인증 정보 확인
     - 없음 -> 초기 설정 화면

  -> access_token 유효성 확인 (만료 체크)
     - 유효 -> 메뉴 화면
     - 만료/무효 -> 저장된 정보로 재로그인 시도
       - POST /api/auth/table/login
       - 성공 -> 새 토큰 저장 -> 메뉴 화면
       - 실패 -> "관리자에게 테이블 설정을 요청해 주세요" 메시지
```

### 3.3 테이블 로그인 API
```
테이블 로그인 요청
  -> POST /api/auth/table/login
     body: {store_identifier, table_number, password}

  -> Step 1: 매장 조회
     - Store.identifier == store_identifier
     - 없음 -> 401 Unauthorized

  -> Step 2: 테이블 조회
     - Table.store_id == store.id AND Table.table_number == table_number
     - 없음 -> 401 Unauthorized

  -> Step 3: 비밀번호 검증
     - table.password == password (평문 비교)
     - 불일치 -> 401 Unauthorized

  -> Step 4: JWT 발급
     - payload: {sub: table.id, store_id: store.id, table_number, role: "table"}
     - exp: 현재시각 + 16시간

  -> Response: {access_token, token_type: "bearer", store_id, table_id}
```

---

## 4. 주문 번호 생성 로직

```
주문 생성 시 주문 번호 결정
  -> 해당 매장(store_id)의 오늘(UTC 기준) 주문 수 조회
     SELECT COUNT(*) FROM orders
     WHERE store_id = ? AND DATE(created_at) = CURRENT_DATE
  -> 순번 = COUNT + 1
  -> order_number = 순번을 3자리로 포맷 (예: 1 -> "001", 42 -> "042")
  -> 동시성 고려: DB 레벨 유니크 제약으로 중복 방지
     충돌 시 재시도 (최대 3회)
```

---

## 5. 에러 처리 전략

### 5.1 HTTP 상태 코드 매핑
| 상황 | 상태 코드 | 메시지 |
|---|---|---|
| 인증 실패 | 401 | "인증에 실패했습니다" |
| 권한 없음 (다른 매장) | 403 | "접근 권한이 없습니다" |
| 리소스 없음 | 404 | "[리소스명]을 찾을 수 없습니다" |
| 입력값 검증 실패 | 422 | 필드별 검증 에러 목록 |
| 로그인 시도 초과 | 429 | "잠시 후 다시 시도해 주세요" |
| 서버 오류 | 500 | "서버 오류가 발생했습니다" |

### 5.2 에러 응답 형식
```json
{
  "detail": "에러 메시지",
  "errors": [
    {"field": "username", "message": "필수 필드입니다"}
  ]
}
```
