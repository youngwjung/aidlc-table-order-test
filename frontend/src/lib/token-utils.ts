import { TokenPayload } from "@/types";

const TOKEN_KEY = "access_token";
const TABLE_CREDS_KEY = "table_credentials";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

export interface TableCredentials {
  storeIdentifier: string;
  tableNumber: number;
  password: string;
}

export function getTableCredentials(): TableCredentials | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TABLE_CREDS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setTableCredentials(creds: TableCredentials): void {
  localStorage.setItem(TABLE_CREDS_KEY, JSON.stringify(creds));
}

export function removeTableCredentials(): void {
  localStorage.removeItem(TABLE_CREDS_KEY);
}
