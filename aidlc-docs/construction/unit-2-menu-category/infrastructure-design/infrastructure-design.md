# 인프라 설계 - Unit 2: Menu & Category Management

> Unit 1의 Docker Compose 인프라를 그대로 사용합니다. Unit 2에서 추가되는 인프라 변경사항만 기록합니다.

---

## 1. 인프라 변경사항

### 변경 없음

Unit 2는 Unit 1에서 설정된 인프라 위에서 동작합니다:
- **Docker Compose**: 기존 3-컨테이너 구성 유지 (frontend, backend, db)
- **uploads 볼륨**: Unit 1에서 이미 `./uploads:/app/uploads` 바인드 마운트 설정됨
- **네트워크**: 기존 브리지 네트워크 그대로 사용
- **환경 변수**: 추가 환경 변수 불필요

---

## 2. 기존 인프라 활용 상세

### 이미지 저장소 (uploads 볼륨)
```yaml
# docker-compose.yml (Unit 1에서 이미 설정됨)
backend:
  volumes:
    - ./uploads:/app/uploads
```

- **호스트 경로**: `./uploads/` (프로젝트 루트)
- **컨테이너 경로**: `/app/uploads/`
- **용도**: 메뉴 이미지 파일 저장/서빙
- **바인드 마운트**: 호스트에서도 직접 파일 확인 가능

### StaticFiles 서빙
```python
# main.py에서 설정 (Unit 2 코드 생성 시 추가)
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

- **URL**: `http://localhost:8000/uploads/{filename}`
- **경로 매핑**: `/uploads/` → `uploads/` 디렉토리
- **인증**: 불필요 (public 접근)

---

## 3. uploads 디렉토리 구조

```
uploads/                          # Docker 볼륨 마운트 포인트
  {uuid}.jpg                     # 메뉴 이미지 파일들
  {uuid}.png
  {uuid}.webp
  .gitkeep                       # Git에서 빈 디렉토리 추적용
```

### 디렉토리 생성
- `uploads/` 디렉토리는 프로젝트 루트에 존재 (Unit 1에서 생성됨)
- `.gitkeep` 파일로 Git 추적
- `.gitignore`에서 `uploads/*`는 무시하되 `.gitkeep`은 유지

---

## 4. 배포 고려사항

### 개발 환경
- 바인드 마운트로 호스트-컨테이너 간 파일 공유
- 이미지 파일은 호스트 `./uploads/`에서 직접 확인 가능

### 운영 환경 (미래)
- 바인드 마운트 대신 네임드 볼륨 사용 권장
- 또는 클라우드 오브젝트 스토리지(S3 등)로 교체
- 현재는 프로토타입이므로 로컬 파일 시스템 충분
