# 배포 아키텍처 - Unit 2: Menu & Category Management

> Unit 1의 배포 아키텍처를 그대로 사용합니다.

---

## 변경 없음

Unit 2는 기존 Docker Compose 아키텍처에 코드만 추가합니다:

```
+------------------------------------------+
|              Docker Compose               |
|                                          |
|  +----------+  +----------+  +--------+  |
|  | frontend |  | backend  |  |   db   |  |
|  | Next.js  |  | FastAPI  |  | PgSQL  |  |
|  | :3000    |->| :8000    |->| :5432  |  |
|  +----------+  +-----+----+  +--------+  |
|                      |                    |
|                      v                    |
|                +----------+               |
|                | uploads/ |               |
|                | (volume) |               |
|                +----------+               |
+------------------------------------------+
```

### Unit 2에서 추가되는 것
- **백엔드 코드**: CategoryService, MenuService, ImageService, category_router, menu_router
- **프론트엔드 코드**: 관리자 카테고리/메뉴 페이지, 고객 메뉴 페이지, 관련 컴포넌트
- **인프라**: 변경 없음 (기존 uploads 볼륨 + StaticFiles 마운트 활용)

### 참조
전체 배포 아키텍처는 `aidlc-docs/construction/unit-1-foundation/infrastructure-design/` 참조
