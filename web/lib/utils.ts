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

/**
 * Format number as Vietnamese currency
 * @param value Number to format
 * @returns Formatted currency string (e.g., "1.000.000 ₫")
 */
export const formatCurrency = (value: number): string => {
  return value?.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

/**
 * Format number with Vietnamese locale
 * @param value Number to format
 * @returns Formatted number string (e.g., "1.000.000")
 */
export const formatNumber = (value: number): string => {
  return value?.toLocaleString('vi-VN');
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Calculate discount percentage
 * @param originalPrice Original price
 * @param discountedPrice Discounted price
 * @returns Discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number,
): number => {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Format duration in days and nights
 * @param days Number of days
 * @param nights Number of nights
 * @returns Formatted duration string (e.g., "3N2Đ")
 */
export const formatDuration = (days: number, nights: number): string => {
  return `${days}N${nights}Đ`;
};
