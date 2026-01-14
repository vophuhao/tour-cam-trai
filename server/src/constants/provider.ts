export const PROVIDERS = {
  LOCAL: "local",
  GOOGLE: "google",
  GOOGLE_LOCAL: "google+local",
} as const;

/**
 * type Provider = "local" | "google" | ...;
 */
export type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];
