"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { TokenPayload, UserRole } from "@/types";
import { getToken, setToken, removeToken, decodeToken, isTokenExpired } from "@/lib/token-utils";

interface AuthState {
  token: string | null;
  user: { id: number; storeId: number; role: UserRole; tableNumber?: number } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_SUCCESS": {
      const decoded = decodeToken(action.payload);
      return {
        token: action.payload,
        user: decoded
          ? { id: decoded.sub, storeId: decoded.store_id, role: decoded.role, tableNumber: decoded.table_number }
          : null,
        isAuthenticated: true,
        isLoading: false,
      };
    }
    case "LOGOUT":
      return { token: null, user: null, isAuthenticated: false, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      dispatch({ type: "LOGIN_SUCCESS", payload: token });
    } else {
      if (token) removeToken();
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  function login(token: string) {
    setToken(token);
    dispatch({ type: "LOGIN_SUCCESS", payload: token });
  }

  function logout() {
    removeToken();
    dispatch({ type: "LOGOUT" });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
