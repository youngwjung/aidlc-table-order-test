# NFR 디자인 패턴 - Unit 2: Menu & Category Management

---

## 1. 파일 업로드 보안 패턴

### 패턴: Whitelist Validation + UUID Naming

```
파일 업로드 요청
  -> Step 1: Content-Type 화이트리스트 검증
     허용: ["image/jpeg", "image/png", "image/webp"]
     거부: 그 외 모든 타입

  -> Step 2: 파일 크기 검증
     최대: 5MB (5,242,880 bytes)
     FastAPI UploadFile에서 읽기 전 크기 확인

  -> Step 3: UUID 기반 파일명 생성
     원본 파일명 무시 (디렉토리 트래버설 방지)
     확장자만 추출: .jpg, .png, .webp
     새 파일명: {uuid4()}.{ext}

  -> Step 4: 비동기 파일 저장
     aiofiles로 비동기 쓰기
     저장 경로: uploads/{uuid_filename}
```

### 구현 주의사항
- Content-Type 헤더 외에 파일 확장자도 교차 검증
- 파일 크기는 스트리밍 읽기 중 체크 (메모리 초과 방지)
- UUID v4로 파일명 생성하여 예측 불가능하게 처리

---

## 2. 정적 파일 서빙 패턴

### 패턴: FastAPI StaticFiles Mount

```python
# main.py에서 설정
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### 보안 고려사항
- StaticFiles는 지정된 디렉토리 내 파일만 서빙 (경로 이탈 방지 내장)
- 디렉토리 리스팅 비활성화 (기본값)
- 파일 존재하지 않으면 404 자동 반환

---

## 3. 폼 검증 패턴 (이중 검증)

### 패턴: Frontend Validation + Backend Validation

```
프론트엔드 (즉시 피드백):
  -> 필수 필드 빈 값 체크
  -> 가격: 숫자 여부, 범위 (0 ~ 10,000,000)
  -> 메뉴명: 길이 (1~100자)
  -> 카테고리: 선택 여부

백엔드 (최종 검증):
  -> Pydantic 모델 자동 검증
     - Field(..., min_length=1, max_length=100)
     - Field(..., ge=0, le=10000000)
  -> 서비스 레이어 비즈니스 검증
     - 카테고리 존재 여부 (FK 검증)
     - 카테고리명 중복 (UNIQUE 검증)
  -> DB 레벨 제약조건
     - CHECK(price >= 0)
     - UNIQUE(store_id, name) for categories
```

### 에러 응답 형식
```json
{
  "detail": [
    {
      "loc": ["body", "price"],
      "msg": "ensure this value is greater than or equal to 0",
      "type": "value_error"
    }
  ]
}
```

---

## 4. 에러 처리 패턴

### 패턴: Layered Error Handling

```
Router Layer:
  -> HTTPException 발생 (적절한 상태코드 + 메시지)

Service Layer:
  -> 비즈니스 에러 → HTTPException으로 변환
  -> DB 에러 → 500 Internal Server Error
  -> 이미지 에러 → 적절한 메시지로 변환

프론트엔드:
  -> API 에러 응답 → Toast 메시지 표시
  -> 네트워크 에러 → "서버에 연결할 수 없습니다" 표시
  -> 폼 에러 시 입력 내용 유지
```

### HTTP 상태 코드 매핑 (Unit 2)
| 상황 | 코드 | 메시지 |
|---|---|---|
| 카테고리/메뉴 없음 | 404 | "[리소스]를 찾을 수 없습니다" |
| 카테고리명 중복 | 409 | "이미 존재하는 카테고리명입니다" |
| 카테고리에 메뉴 존재 (삭제 시) | 400 | "해당 카테고리에 메뉴가 있어 삭제할 수 없습니다" |
| 존재하지 않는 카테고리 참조 | 400 | "존재하지 않는 카테고리입니다" |
| 이미지 형식 오류 | 400 | "JPEG, PNG, WebP 형식만 허용됩니다" |
| 이미지 크기 초과 | 400 | "파일 크기는 5MB 이하여야 합니다" |
| 입력값 검증 실패 | 422 | Pydantic 자동 검증 에러 |

---

## 5. 접근 제어 패턴

### 패턴: Role-Based Middleware + Route-Level Check

```
모든 API 요청:
  -> JWT 미들웨어 (Unit 1에서 구현)
     - Authorization 헤더 → JWT 디코딩 → request.state.user 설정

카테고리/메뉴 CRUD API (관리자 전용):
  -> 라우터에서 role == "admin" 확인
  -> role != "admin" → 403 Forbidden

카테고리/메뉴 조회 API (고객 허용):
  -> role in ["admin", "table"] 확인
  -> store_id 일치 확인 (멀티테넌트 격리)

이미지 서빙 (/uploads/):
  -> 인증 불필요 (StaticFiles, public 접근)
  -> UUID 파일명으로 URL 추측 불가
```

### 라우터별 인증 설정
```python
# 관리자 전용 엔드포인트
@router.post("/", dependencies=[Depends(require_admin)])

# 고객+관리자 조회 엔드포인트
@router.get("/", dependencies=[Depends(require_authenticated)])
```
