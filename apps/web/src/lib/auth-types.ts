export type AuthRole = "CUSTOMER" | "SELLER" | "GOVERNMENT";
export type AuthUser = { id: string; role: AuthRole; displayName: string };
