import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to a URL-friendly string with hyphens instead of spaces
 * @param str to convert
 * @returns URL-friendly string
 */
export function strToUrl(str: string) {
  return str.toLowerCase().replace(/\s/g, '-');
}
