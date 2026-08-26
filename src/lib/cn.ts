type ClassValue = string | number | boolean | null | undefined;

/** Joins truthy class values into a single string. Deliberately dependency-free. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
