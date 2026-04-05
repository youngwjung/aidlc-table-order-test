# Unit 3: Customer Order Flow - Business Logic Model

## Overview
Unit 3의 핵심 비즈니스 로직 플로우를 단계별로 정의합니다.

---

## 1. 장바구니 관리 로직

### 1.1 메뉴 추가 (CS-05)

```
addToCart(menuId, menuName, price, imageUrl, quantity = 1):
  1. 기존 장바구니에서 동일 menuId 검색
  2. IF 동일 항목 존재:
     - existingItem.quantity += quantity
     - IF existingItem.quantity > 99: existingItem.quantity = 99
  3. ELSE:
     - 새 CartItem 생성 { menuId, menuName, price, quantity, imageUrl }
     - items 배열에 추가
  4. 합계 재계산: totalAmount = Σ(item.price × item.quantity)
  5. localStorage 동기화
```

### 1.2 수량 변경 (CS-06)

```
updateQuantity(menuId, delta):   // delta: +1 또는 -1
  1. items에서 menuId로 항목 검색
  2. newQuantity = item.quantity + delta
  3. IF newQuantity <= 0:
     - items에서 해당 항목 제거
  4. ELSE IF newQuantity > 99:
     - item.quantity = 99
  5. ELSE:
     - item.quantity = newQuantity
  6. 합계 재계산
  7. localStorage 동기화
```

### 1.3 항목 삭제 (CS-07)

```
removeItem(menuId):
  1. items에서 menuId로 항목 검색
  2. items 배열에서 해당 항목 제거
  3. 합계 재계산
  4. localStorage 동기화
```

### 1.4 전체 초기화 (CS-08)

```
clearCart():
  1. 확인 모달 표시: "장바구니를 비우시겠습니까?"
  2. IF 확인:
     - items = []
     - totalAmount = 0
     - localStorage에서 해당 키 삭제
```

### 1.5 localStorage 복원 (CS-10)

```
restoreCart(storeId, tableId):
  1. key = `cart_${storeId}_${tableId}`
  2. data = localStorage.getItem(key)
  3. IF data:
     - TRY: items = JSON.parse(data)
     - CATCH: items = [] (손상된 데이터 무시)
  4. ELSE:
     - items = []
  5. 합계 재계산
```

---

## 2. 주문 생성 로직

### 2.1 주문 제출 플로우 (CS-11)

```
submitOrder(storeId, tableId, cartItems[]):
  
  [클라이언트]
  1. 빈 장바구니 검증: IF items.length === 0 → 에러 (BR-C08)
  2. 확인 모달 표시 (항목 목록 + 총 금액)
  3. 사용자 확인 후 API 호출

  [서버 - OrderService.create_order()]
  4. 인증 확인: JWT 토큰에서 store_id, table_id 추출
  5. 멀티테넌트 검증: 요청 store_id == 토큰 store_id
  
  6. 메뉴 유효성 검증 (BR-O02):
     FOR EACH item IN cartItems:
       menu = SELECT * FROM menus WHERE id = item.menuId AND store_id = storeId
       IF menu IS NULL:
         - invalidItems에 추가
       ELSE:
         - validatedItem = { menu_name: menu.name, unit_price: menu.price, quantity: item.quantity }
     
     IF invalidItems.length > 0:
       - RETURN 422 { error: "invalid_menu_items", items: invalidItems }
  
  7. 세션 확인/시작 (BR-SS01):
     table = SELECT * FROM tables WHERE id = tableId AND store_id = storeId
     IF table.session_id IS NULL:
       - table.session_id = uuid4()
       - table.session_started_at = now()
       - UPDATE table
  
  8. 주문번호 생성 (BR-O03):
     today = date.today()
     count = SELECT COUNT(*) FROM orders 
             WHERE store_id = storeId AND DATE(created_at) = today
     order_number = format(count + 1, "03d")
  
  9. 주문 레코드 생성:
     order = INSERT INTO orders {
       store_id: storeId,
       table_id: tableId,
       session_id: table.session_id,
       order_number: order_number,
       status: "waiting",
       total_amount: Σ(validatedItem.unit_price × validatedItem.quantity),
       created_at: now()
     }
  
  10. 주문 항목 생성:
      FOR EACH validatedItem:
        INSERT INTO order_items {
          order_id: order.id,
          menu_name: validatedItem.menu_name,
          quantity: validatedItem.quantity,
          unit_price: validatedItem.unit_price
        }
  
  11. RETURN OrderResponse { id, orderNumber, status, totalAmount, items, createdAt }

  [클라이언트 - 성공 시]
  12. 주문 성공 페이지로 이동 (orderNumber 전달)
  13. 장바구니 초기화

  [클라이언트 - 실패 시]
  14. 장바구니 유지
  15. 에러 메시지 표시
  16. 재시도 가능
```

### 2.2 주문 성공 후 플로우 (CS-12)

```
orderSuccess(orderNumber, orderItems):
  1. 주문 완료 메시지 표시: "주문번호 #{orderNumber}"
  2. 주문 항목 요약 표시
  3. 5초 카운트다운 타이머 시작
  4. 타이머 완료 → 메뉴 페이지로 자동 리다이렉트
  5. 사용자가 "메뉴로 돌아가기" 클릭 시 즉시 이동 가능
```

---

## 3. 주문 내역 조회 로직

### 3.1 현재 세션 주문 조회 (CS-13)

```
getCurrentSessionOrders(storeId, tableId):
  
  [서버 - OrderService.get_current_session_orders()]
  1. 테이블 조회:
     table = SELECT * FROM tables WHERE id = tableId AND store_id = storeId
  
  2. 세션 확인:
     IF table.session_id IS NULL:
       - RETURN [] (빈 목록)
  
  3. 주문 조회:
     orders = SELECT * FROM orders 
              WHERE store_id = storeId 
              AND table_id = tableId 
              AND session_id = table.session_id
              ORDER BY created_at DESC
  
  4. 각 주문에 OrderItem 목록 포함하여 반환
  
  [클라이언트]
  5. 주문 목록을 카드 형태로 표시
  6. 각 카드: 주문번호, 주문 시각, 항목 목록, 금액, 상태 배지
```

### 3.2 테이블 합계 조회

```
getTableTotal(storeId, tableId):
  
  [서버 - OrderService.get_table_total()]
  1. 테이블의 현재 세션 주문 합계:
     total = SELECT SUM(total_amount) FROM orders
             WHERE store_id = storeId 
             AND table_id = tableId 
             AND session_id = (SELECT session_id FROM tables WHERE id = tableId)
  
  2. RETURN { totalAmount: total || 0 }
```

---

## 4. 세션 자동 시작 로직

### 4.1 TableService.start_session()

```
start_session(table_id, store_id):
  1. table = SELECT * FROM tables WHERE id = table_id AND store_id = store_id
  2. IF table IS NULL:
     - RAISE 404 "Table not found"
  3. IF table.session_id IS NOT NULL:
     - RETURN table.session_id (이미 활성 세션)
  4. new_session_id = uuid4()
  5. UPDATE tables SET 
       session_id = new_session_id,
       session_started_at = now()
     WHERE id = table_id
  6. RETURN new_session_id
```

**호출 시점**: OrderService.create_order() 내부에서 주문 생성 직전에 호출

---

## 5. API 엔드포인트 상세

### 5.1 POST /api/stores/{store_id}/orders
- **Purpose**: 새 주문 생성
- **Auth**: Table JWT 필요
- **Request Body**:
  ```json
  {
    "table_id": 1,
    "items": [
      { "menu_id": 5, "quantity": 2 },
      { "menu_id": 8, "quantity": 1 }
    ]
  }
  ```
- **Success Response** (201):
  ```json
  {
    "id": 1,
    "order_number": "001",
    "status": "waiting",
    "total_amount": 25000,
    "items": [
      { "id": 1, "menu_name": "김치찌개", "quantity": 2, "unit_price": 9000 },
      { "id": 2, "menu_name": "공기밥", "quantity": 1, "unit_price": 7000 }
    ],
    "created_at": "2026-04-05T12:30:00Z"
  }
  ```
- **Error Responses**:
  - 401: 인증 실패
  - 403: store_id 불일치
  - 404: 테이블 없음
  - 422: 유효하지 않은 메뉴 항목

### 5.2 GET /api/stores/{store_id}/orders/table/{table_id}/current
- **Purpose**: 현재 세션 주문 목록 조회
- **Auth**: Table JWT 필요
- **Success Response** (200):
  ```json
  {
    "orders": [
      {
        "id": 2,
        "order_number": "002",
        "status": "preparing",
        "total_amount": 15000,
        "items": [...],
        "created_at": "2026-04-05T12:45:00Z"
      },
      {
        "id": 1,
        "order_number": "001",
        "status": "done",
        "total_amount": 25000,
        "items": [...],
        "created_at": "2026-04-05T12:30:00Z"
      }
    ],
    "session_total": 40000
  }
  ```

---

## 6. 에러 처리 로직

### 6.1 주문 제출 실패 (CS-ERR-02)
```
handleOrderError(error):
  1. IF error.status === 422 (유효하지 않은 메뉴):
     - 에러 메시지에서 invalidItems 추출
     - 토스트: "일부 메뉴가 변경되었습니다. 장바구니를 확인해주세요."
     - 장바구니에서 해당 항목 하이라이트 또는 제거 안내
  2. IF error.status === 401:
     - 인증 만료 → 재로그인 플로우
  3. IF error.status === 500 OR 네트워크 오류:
     - 토스트: "주문 실패. 다시 시도해주세요."
     - 장바구니 데이터 보존
     - 재시도 가능
```

### 6.2 빈 장바구니 주문 방지 (CS-ERR-04)
```
validateCartBeforeOrder():
  1. IF cart.items.length === 0:
     - "주문하기" 버튼 비활성화 (disabled)
     - 빈 장바구니 안내 메시지 표시
  2. ELSE:
     - 버튼 활성화
```
