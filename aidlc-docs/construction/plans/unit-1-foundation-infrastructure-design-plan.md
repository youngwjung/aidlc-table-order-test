# Infrastructure Design Plan - Unit 1: Foundation

## Plan Overview
Unit 1(Foundation)의 논리적 컴포넌트를 실제 Docker 인프라로 매핑합니다.
배포 환경: Docker Compose (로컬/개발)

---

## Infrastructure Questions

### Question 1
Docker 개발 환경에서 프론트엔드 핫 리로드(코드 변경 시 자동 반영)를 지원하시겠습니까?

A) 예, 소스 코드 볼륨 마운트 + Next.js dev 모드 (개발 편의성 우선)
B) 아니오, 프로덕션 빌드만 사용 (docker build 후 실행)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
백엔드도 핫 리로드를 지원하시겠습니까?

A) 예, 소스 코드 볼륨 마운트 + uvicorn --reload (개발 편의성 우선)
B) 아니오, 프로덕션 모드만 사용
C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
Docker Compose 프로필을 개발용(dev)과 프로덕션용(prod)으로 분리하시겠습니까?

A) 단일 docker-compose.yml만 사용 (개발용, 간단하게)
B) docker-compose.yml (기본) + docker-compose.prod.yml (프로덕션 오버라이드)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Generation Checklist

- [x] Step 1: infrastructure-design.md - 인프라 설계 (컨테이너 구성, 네트워크, 볼륨)
- [x] Step 2: deployment-architecture.md - 배포 아키텍처 (Dockerfile, docker-compose, 환경변수)
