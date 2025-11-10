export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

/**
 * type Role = "user" | "admin" | ...;
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];
