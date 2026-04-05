"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CartItem } from "@/types";

const CART_STORAGE_KEY = "cart_items";

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { menuId: number; quantity: number } }
  | { type: "CLEAR" }
  | { type: "LOAD"; payload: CartItem[] };

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let items: CartItem[];
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.menuId === action.payload.menuId);
      if (existing) {
        items = state.items.map((i) =>
          i.menuId === action.payload.menuId
            ? { ...i, quantity: Math.min(i.quantity + (action.payload.quantity || 1), 99) }
            : i
        );
      } else {
        items = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      return { items, totalAmount: calcTotal(items) };
    }
    case "REMOVE_ITEM":
      items = state.items.filter((i) => i.menuId !== action.payload);
      return { items, totalAmount: calcTotal(items) };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        items = state.items.filter((i) => i.menuId !== action.payload.menuId);
      } else {
        const clamped = Math.min(action.payload.quantity, 99);
        items = state.items.map((i) =>
          i.menuId === action.payload.menuId ? { ...i, quantity: clamped } : i
        );
      }
      return { items, totalAmount: calcTotal(items) };
    case "CLEAR":
      return { items: [], totalAmount: 0 };
    case "LOAD":
      return { items: action.payload, totalAmount: calcTotal(action.payload) };
    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], totalAmount: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        dispatch({ type: "LOAD", payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (menuId: number) => dispatch({ type: "REMOVE_ITEM", payload: menuId });
  const updateQuantity = (menuId: number, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { menuId, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR" });
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
