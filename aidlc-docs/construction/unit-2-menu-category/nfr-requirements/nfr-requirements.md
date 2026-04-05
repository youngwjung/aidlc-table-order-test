# 비기능 요구사항 - Unit 2: Menu & Category Management

> Unit 1의 NFR을 상속하며, Unit 2 고유의 이미지/파일 관련 NFR을 추가합니다.

---

## 1. 성능 (Performance)

| 항목 | 목표 | 비고 |
|---|---|---|
| 카테고리/메뉴 CRUD API | 500ms 이내 | Unit 1 기준 동일 |
| 메뉴 목록 조회 (카테고리별) | 500ms 이내 | 인덱스 활용 (store_id, category_id) |
| 이미지 업로드 | 3초 이내 | 5MB 기준, 서버 로컬 저장 |
| 이미지 서빙 | 200ms 이내 | StaticFiles 미들웨어, 정적 파일 |
| 메뉴 목록 + 이미지 로딩 | 3초 이내 | 고객 화면 초기 로드 기준 |

### 최적화 전략
- 메뉴 목록은 카테고리별 필터링으로 한 번에 로드하는 데이터 최소화
- 이미지는 `<img loading="lazy">` 지연 로딩 적용
- 카테고리 목록은 데이터 양이 적어 캐싱 불필요

---

## 2. 확장성 (Scalability)

| 항목 | 목표 |
|---|---|
| 매장당 카테고리 수 | 최대 50개 |
| 매장당 메뉴 수 | 최대 500개 |
| 이미지 저장 용량 | 제한 없음 (Docker 볼륨 디스크 의존) |
| 동시 이미지 업로드 | 5건 이하 (관리자만 업로드) |

### 용량 추정
- 메뉴당 평균 이미지 크기: 1MB
- 500개 메뉴 전체 이미지: 약 500MB
- Docker 볼륨 권장 크기: 2GB 이상

---

## 3. 보안 (Security)

| 항목 | 구현 |
|---|---|
| 파일 업로드 검증 | Content-Type 화이트리스트 (JPEG, PNG, WebP) |
| 파일 크기 제한 | 서버에서 5MB 제한 적용 |
| 파일명 보안 | UUID로 파일명 생성 (원본 파일명 미사용) |
| 디렉토리 트래버설 방지 | StaticFiles 미들웨어 (경로 검증 내장) |
| 이미지 실행 방지 | 확장자 화이트리스트 + Content-Type 검증 |
| 카테고리/메뉴 API 인증 | 관리자 CRUD: role=="admin" 필수, 고객 조회: role=="table" 허용 |
| 멀티테넌트 격리 | store_id 기반 필터링 (Unit 1과 동일) |

### 이미지 업로드 보안 체크리스트
1. Content-Type 헤더 검증 (image/jpeg, image/png, image/webp만)
2. 파일 크기 검증 (5MB 초과 거부)
3. UUID 기반 파일명 (원본 파일명 미노출)
4. uploads/ 디렉토리만 서빙 (다른 경로 접근 불가)

---

## 4. 사용성 (Usability)

| 항목 | 구현 |
|---|---|
| 이미지 미리보기 | 업로드 전 클라이언트에서 미리보기 표시 |
| 이미지 플레이스홀더 | 이미지 미등록 메뉴에 기본 아이콘 표시 |
| 가격 포맷팅 | 천 단위 콤마 + "원" 접미사 (예: "15,000원") |
| 폼 에러 표시 | 필드 아래 인라인 에러 + 서버 에러 Toast |
| 폼 상태 유지 | 에러 시 폼 입력 내용 유지 |
| 인라인 편집 | 카테고리명 클릭 → 편집 모드 전환 |
| 순서 변경 | 위/아래 화살표 버튼 (즉시 서버 반영) |
| 로딩 상태 | 업로드 중 프로그레스/스피너 표시 |
| 삭제 확인 | ConfirmModal로 실수 방지 |
| 터치 타겟 | 최소 44x44px (Unit 1 기준 동일) |

---

## 5. 데이터 관리 (Data Management)

| 항목 | 구현 |
|---|---|
| 이미지 저장소 | 로컬 파일 시스템 (uploads/ 디렉토리) |
| 이미지 영속화 | Docker named volume 마운트 |
| 이미지 정리 | 메뉴 삭제 시 이미지 파일 삭제 (best-effort) |
| 메뉴 수정 시 이미지 교체 | 기존 파일 삭제 → 새 파일 저장 |
| 고아 이미지 처리 | 미구현 (MVP, 필요 시 수동 정리) |
| 카테고리-메뉴 참조 무결성 | DB FK + 서비스 레이어 검증 |

---

## 6. 접근 제어 매트릭스

| API 엔드포인트 | admin | table | 비인증 |
|---|---|---|---|
| GET /categories | O | O | X |
| POST /categories | O | X | X |
| PUT /categories/{id} | O | X | X |
| DELETE /categories/{id} | O | X | X |
| PUT /categories/reorder | O | X | X |
| GET /menus | O | O | X |
| POST /menus | O | X | X |
| PUT /menus/{id} | O | X | X |
| DELETE /menus/{id} | O | X | X |
| PUT /menus/reorder | O | X | X |
| GET /uploads/{file} | O | O | O |
