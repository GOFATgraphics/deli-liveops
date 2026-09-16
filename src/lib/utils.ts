import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function naira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function emailLooksValid(value: string): boolean | null {
  const email = value.trim();
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email);
}
