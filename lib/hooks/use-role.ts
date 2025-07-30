"use client";

import { useAuthData } from "@/lib/context/auth-context";

/**
 * @deprecated Use useAuthData from @/lib/context/auth-context instead
 * This hook is kept for backward compatibility but will be removed in future versions
 */
export function useRole() {
  return useAuthData();
}
