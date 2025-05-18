import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function util(): string {
  return "util";
}

export const myNewUtil = () => {
  return "myNewUtil" as const;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
