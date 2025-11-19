import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Safely parse JSON field from FormData
 * @param data FormData object
 * @param key Field name
 * @returns Parsed value or empty array if invalid
 */
export const parseJsonField = <T>(data: FormData, key: string): T => {
  const value = data.get(key);
  if (!value) return [] as unknown as T;
  try {
    return JSON.parse(value as string) as T;
  } catch {
    return [] as unknown as T;
  }
};
