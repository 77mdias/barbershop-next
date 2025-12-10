/**
 * Upload System - Client-Safe Exports
 * 
 * This module only exports client-safe utilities and types.
 * Server-side upload logic is in /src/server/uploadServerActions.ts
 */

export { UploadType } from "@/types/upload";

// Client-safe constants
export const UPLOAD_CONFIG_CLIENT = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles: 5
} as const;

// Client-safe function to get system info
export function getUploadSystemInfo() {
  return {
    environment: typeof window !== 'undefined' ? 'client' : 'server',
    storageStrategy: "filesystem",
    features: ["File validation", "Image processing", "Rate limiting"],
    config: UPLOAD_CONFIG_CLIENT
  };
}

// Client-side file validation (basic checks only)
export function validateFileClient(file: File): {
  valid: boolean;
  error?: string;
} {
  if (file.size > UPLOAD_CONFIG_CLIENT.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${UPLOAD_CONFIG_CLIENT.maxFileSize / 1024 / 1024}MB`
    };
  }

  if (!UPLOAD_CONFIG_CLIENT.allowedTypes.includes(
    file.type as (typeof UPLOAD_CONFIG_CLIENT.allowedTypes)[number]
  )) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${UPLOAD_CONFIG_CLIENT.allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

// Re-export server actions for convenience
// These should be imported from /src/server/uploadServerActions.ts
export type { } from "@/server/uploadServerActions";
