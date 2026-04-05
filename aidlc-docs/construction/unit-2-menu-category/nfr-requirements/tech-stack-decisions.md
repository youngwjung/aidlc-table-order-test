# 기술 스택 결정 - Unit 2: Menu & Category Management

> Unit 1의 기술 스택을 그대로 사용합니다. Unit 2에서 추가되는 기술 결정만 기록합니다.

---

## 추가 기술 결정

### 이미지 업로드/서빙

| 항목 | 결정 | 근거 |
|---|---|---|
| 파일 업로드 라이브러리 | `python-multipart` (Unit 1에 포함) | FastAPI의 `UploadFile` 지원 |
| 비동기 파일 I/O | `aiofiles` (Unit 1에 포함) | 비동기 파일 읽기/쓰기 |
| 정적 파일 서빙 | FastAPI `StaticFiles` | 내장 미들웨어, 추가 설정 불필요 |
| 이미지 리사이징 | 없음 (원본 저장) | MVP 단계, 복잡성 최소화 |
| 이미지 최적화 | 없음 | 클라이언트에서 lazy loading으로 대응 |

### 프론트엔드 추가 사항

| 항목 | 결정 | 근거 |
|---|---|---|
| 이미지 미리보기 | `URL.createObjectURL()` | 브라우저 내장, 추가 라이브러리 불필요 |
| 드래그 앤 드롭 | 미사용 | 화살표 버튼으로 순서 변경 (구현 단순화) |
| 가격 포맷팅 | `Intl.NumberFormat('ko-KR')` | 브라우저 내장, 한국어 천 단위 콤마 |

---

## 추가 의존성

**없음** - Unit 1에서 설정된 의존성으로 Unit 2의 모든 기능 구현 가능

### 확인된 기존 의존성 활용
- `python-multipart`: FormData 파싱 (이미지 업로드)
- `aiofiles`: 비동기 파일 저장/삭제
- FastAPI `StaticFiles`: 이미지 정적 파일 서빙
- Tailwind CSS: 모든 UI 스타일링

---

## 기술 스택 전체 요약 (Unit 1 + Unit 2)

변경 없음. Unit 1의 `tech-stack-decisions.md` 참조.
