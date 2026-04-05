export interface Store {
  id: number;
  name: string;
  identifier: string;
}

export interface AdminUser {
  id: number;
  storeId: number;
  username: string;
}

export interface TableInfo {
  id: number;
  storeId: number;
  tableNumber: number;
  sessionId: string | null;
  sessionStartedAt: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  storeId: number;
  name: string;
  displayOrder: number;
}

export interface Menu {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  storeId: number;
  tableId: number;
  sessionId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderHistoryItem {
  id: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderHistory {
  id: number;
  storeId: number;
  tableId: number;
  tableNumber: number;
  sessionId: string;
  orderNumber: string;
  totalAmount: number;
  orderedAt: string;
  completedAt: string;
  items: OrderHistoryItem[];
}

export type OrderStatus = "pending" | "preparing" | "completed";
export type UserRole = "admin" | "table";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  store_id?: number;
  table_id?: number;
}

export interface TokenPayload {
  sub: number;
  store_id: number;
  role: UserRole;
  table_number?: number;
  exp: number;
}

export interface CartItem {
  menuId: number;
  menuName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export interface SSEEvent {
  event: string;
  data: any;
}
