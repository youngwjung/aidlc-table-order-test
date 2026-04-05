# Unit 4 Functional Design Questions

Unit 4 (Admin Dashboard & Table Management)의 Functional Design을 위해 다음 질문에 답변해 주세요.
각 질문의 [Answer]: 태그 뒤에 선택지 문자를 입력해 주세요.

---

## Question 1
SSE(Server-Sent Events) 연결이 끊어졌을 때 재연결 전략은 어떻게 하시겠습니까?

A) 즉시 자동 재연결 (지수 백오프 없이 즉시 재시도)
B) 지수 백오프 자동 재연결 (1초 → 2초 → 4초... 최대 30초 간격)
C) 고정 간격 자동 재연결 (예: 3초마다 재시도)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
관리자 대시보드의 테이블 카드 그리드 레이아웃에서, 테이블 카드에 표시할 최신 주문 미리보기 개수는 몇 개가 적절합니까?

A) 최신 2개 주문 미리보기
B) 최신 3개 주문 미리보기
C) 최신 5개 주문 미리보기
D) 모든 주문 표시 (스크롤)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3
주문 상태 변경 시 (pending → preparing → completed), 역방향 상태 변경(예: preparing → pending으로 되돌리기)을 허용하시겠습니까?

A) 허용하지 않음 (순방향만 가능: pending → preparing → completed)
B) 한 단계 역방향만 허용 (preparing → pending, completed → preparing)
C) 모든 방향 자유롭게 변경 가능
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
테이블 이용 완료(세션 종료) 시, 아직 "대기중" 또는 "준비중" 상태인 미완료 주문이 있을 때 어떻게 처리하시겠습니까?

A) 미완료 주문이 있으면 이용 완료 차단 (모든 주문이 완료 상태여야 함)
B) 경고 메시지 표시 후 관리자가 강제 진행 가능 (미완료 주문도 이력으로 이동)
C) 미완료 주문은 자동으로 "완료" 상태로 변경 후 이력 이동
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
과거 주문 내역 조회에서 날짜 필터의 기본 범위와 조회 방식은 어떻게 하시겠습니까?

A) 기본 오늘 날짜, 단일 날짜 선택 필터
B) 기본 최근 7일, 날짜 범위(시작~종료) 선택 필터
C) 기본 최근 30일, 날짜 범위(시작~종료) 선택 필터
D) 날짜 필터 없이 전체 이력을 페이지네이션으로 표시
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
테이블 관리(CRUD)에서 테이블 삭제 시, 해당 테이블에 활성 세션이나 현재 주문이 있는 경우 어떻게 처리하시겠습니까?

A) 활성 세션/주문이 있으면 삭제 차단 (세션 종료 후에만 삭제 가능)
B) 경고 메시지 표시 후 강제 삭제 허용 (관련 주문도 함께 삭제)
C) 경고 메시지 표시 후 강제 삭제 허용하되 주문은 이력으로 이동
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
대시보드에서 신규 주문 수신 시 시각적 알림 외에 추가 알림 방식이 필요합니까?

A) 시각적 강조(색상/애니메이션)만 사용
B) 시각적 강조 + 브라우저 알림음(beep)
C) 시각적 강조 + 브라우저 Notification API (화면 밖에서도 알림)
D) Other (please describe after [Answer]: tag below)

[Answer]: B
