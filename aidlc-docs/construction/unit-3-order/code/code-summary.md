# Unit 3: Customer Order Flow - Code Summary

## Generated Files

### Backend (4 new, 2 modified)

| File | Status | Description |
|---|---|---|
| `backend/app/services/order_service.py` | NEW | OrderService: create_order, get_current_session_orders |
| `backend/app/routers/orders.py` | NEW | Order API endpoints (POST create, GET current) |
| `backend/seed/__init__.py` | NEW | Seed package init |
| `backend/seed/seed_data.py` | NEW | Test data (3 categories, 9 menus) |
| `backend/app/schemas/order.py` | MODIFIED | Added OrderCreateRequest, CurrentSessionOrdersResponse |
| `backend/app/main.py` | MODIFIED | Registered orders router |

### Frontend (6 new, 1 modified)

| File | Status | Description |
|---|---|---|
| `frontend/src/app/customer/cart/page.tsx` | NEW | Cart page with order submission |
| `frontend/src/app/customer/order-success/page.tsx` | NEW | Order success with 5s countdown |
| `frontend/src/app/customer/orders/page.tsx` | NEW | Current session orders view |
| `frontend/src/components/customer/cart-item.tsx` | NEW | Cart item with +/- controls |
| `frontend/src/components/customer/cart-summary.tsx` | NEW | Cart total and submit button |
| `frontend/src/components/ui/order-card.tsx` | NEW | Order card with status badge |
| `frontend/src/contexts/cart-context.tsx` | MODIFIED | Max 99 quantity limit |

## Story Implementation

| Story | Implementation |
|---|---|
| CS-05 | cartContext.addItem() → CartItem component |
| CS-06 | cartContext.updateQuantity() → +/- buttons |
| CS-07 | Auto-delete at quantity 0 |
| CS-08 | clearCart() with ConfirmModal |
| CS-09 | CartSummary real-time total |
| CS-10 | localStorage persistence in cartContext |
| CS-11 | CartPage → ConfirmModal → POST /orders API |
| CS-12 | OrderSuccessPage with 5-second countdown |
| CS-13 | OrdersPage → GET /orders/table/{id}/current |
| CS-ERR-02 | try/catch with Toast error, cart preserved |
| CS-ERR-04 | Submit button disabled when cart empty |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/stores/{store_id}/orders` | Create order (table JWT required) |
| GET | `/api/stores/{store_id}/orders/table/{table_id}/current` | Get current session orders |

## Key Implementation Details

- **Server-side menu validation**: Order creation validates menu_id existence and uses server price
- **Session auto-start**: First order on a table auto-creates UUID session_id
- **Order numbering**: Daily sequential per store (001, 002, ...)
- **Single transaction**: Session start + order + items in one DB transaction
- **Cart persistence**: localStorage with JSON serialization, graceful degradation
- **Quantity limits**: Min 1, Max 99, auto-delete at 0
