# Unit 3: Customer Order Flow - Code Generation Plan

## Unit Context
- **Stories**: CS-05~CS-13, CS-ERR-02, CS-ERR-04 (11 stories)
- **Dependencies**: Unit 1 Foundation (complete)
- **Parallel Strategy**: Seed data for menus (Unit 2 대체)

## Code Generation Steps

- [x] Step 1: Backend - OrderService (order_service.py)
  - create_order() with menu validation, session auto-start, order number generation
  - get_current_session_orders() with session filtering
  - Stories: CS-11, CS-13, CS-ERR-02, CS-ERR-04

- [x] Step 2: Backend - Order Router (orders.py)
  - POST /api/stores/{store_id}/orders (create order)
  - GET /api/stores/{store_id}/orders/table/{table_id}/current (session orders)
  - JWT table auth, store_id validation
  - Stories: CS-11, CS-13

- [x] Step 3: Backend - Register router in main.py
  - Add orders router to FastAPI app

- [x] Step 4: Backend - Seed Data Script (seed/seed_data.py)
  - Test categories (3) and menus (9) for development
  - Idempotent execution (check before insert)

- [x] Step 5: Backend - Order Schema Updates (schemas/order.py)
  - Added OrderCreateRequest (menu_id + quantity only, server validates)
  - Added CurrentSessionOrdersResponse

- [x] Step 6: Frontend - Update Cart Context (cart-context.tsx)
  - Enhanced ADD_ITEM with quantity merge and max 99 limit
  - Enhanced UPDATE_QUANTITY with max 99 clamping
  - Stories: CS-05, CS-06, CS-07, CS-08, CS-09, CS-10

- [x] Step 7: Frontend - Cart Page (customer/cart/page.tsx)
  - Cart item list with quantity controls
  - Cart summary with total and submit button
  - Confirm modal for order submission + clear cart
  - Empty cart message with link to menu
  - Stories: CS-05~CS-09, CS-11, CS-ERR-02, CS-ERR-04

- [x] Step 8: Frontend - Cart UI Components (cart-item.tsx, cart-summary.tsx)
  - CartItem with image/placeholder, name, price, +/- controls, item total
  - CartSummary with total amount and submit button (fixed bottom)

- [x] Step 9: Frontend - Order Success Page (customer/order-success/page.tsx)
  - Success icon + order number + total amount
  - 5-second countdown redirect to menu
  - Manual "메뉴로 돌아가기" button
  - Story: CS-12

- [x] Step 10: Frontend - Orders Page (customer/orders/page.tsx)
  - Current session order list with session total
  - Loading state, empty state, error handling
  - Story: CS-13

- [x] Step 11: Frontend - Order UI Components (order-card.tsx)
  - OrderCard with order number, status badge, time, items, total
  - StatusBadge already existed from Unit 1

- [x] Step 12: Frontend - Types (types/index.ts)
  - All required types already existed (Order, OrderItem, CartItem)
  - No changes needed

- [x] Step 13: Documentation - Code Summary
  - Generated code summary markdown

## Story Coverage
- [x] CS-05: Add menu to cart (cartContext.addItem)
- [x] CS-06: Adjust cart quantity (cartContext.updateQuantity, CartItem +/-)
- [x] CS-07: Delete from cart (auto-delete at qty 0, removeItem)
- [x] CS-08: Clear entire cart (clearCart with ConfirmModal)
- [x] CS-09: Real-time total amount (CartSummary, cartContext.totalAmount)
- [x] CS-10: Cart persistence on refresh (localStorage in cartContext)
- [x] CS-11: Order confirmation and submission (CartPage → ConfirmModal → API)
- [x] CS-12: Order success with redirect (OrderSuccessPage, 5s countdown)
- [x] CS-13: View current order history (OrdersPage, OrderCard)
- [x] CS-ERR-02: Order submission failure (try/catch, toast, cart preserved)
- [x] CS-ERR-04: Empty cart order prevention (disabled button)
