/**
 * 🛡️ Upload Validators
 * 
 * Validação robusta de arquivos para o sistema de upload.
 * Inclui validação de tipo MIME, magic numbers e segurança.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { UPLOAD_CONFIG, ERROR_MESSAGES } from './config';

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Arquivo vazio'
    };
  }
  
  return { valid: true };
}

/**
 * Validate file type (MIME type and extension)
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check MIME type
  if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = UPLOAD_CONFIG.ALLOWED_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  
  return { valid: true };
}

/**
 * Validate file signature (magic numbers) for security
 */
export async function validateFileSignature(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    // Read first 8 bytes of the file
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to hex string
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Get expected signatures for this MIME type
    const expectedSignatures = UPLOAD_CONFIG.FILE_SIGNATURES[file.type];
    
    if (!expectedSignatures) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_FILE_TYPE
      };
    }
    
    // Check if file starts with any valid signature
    const isValidSignature = expectedSignatures.some(signature => 
      hex.toLowerCase().startsWith(signature.toLowerCase())
    );
    
    if (!isValidSignature) {
      return {
        valid: false,
        error: ERROR_MESSAGES.FILE_CORRUPTED
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating file signature:', error);
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_CORRUPTED
    };
  }
}

/**
 * Validate multiple files at once
 */
export function validateMultipleFiles(files: File[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.NO_FILE_PROVIDED
    };
  }
  
  if (files.length > UPLOAD_CONFIG.MAX_FILES_PER_REQUEST) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TOO_MANY_FILES
    };
  }
  
  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Validate size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  // Validate type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // Validate signature (magic numbers)
  const signatureValidation = await validateFileSignature(file);
  if (!signatureValidation.valid) {
    return signatureValidation;
  }
  
  return { valid: true };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Check if filename is safe for storage
 */
export function isFilenameSafe(filename: string): boolean {
  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./,  // Directory traversal
    /^\./,   // Hidden files
    /\//,    // Path separators
    /\\/,    // Windows path separators
    /\0/,    // Null bytes
    /[<>:"|?*]/ // Invalid filename characters
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(filename));
}

/**
 * Validate upload based on user permissions
 */
export function validateUserPermissions(userId?: string): { valid: boolean; error?: string } {
  if (!userId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.UNAUTHORIZED
    };
  }
  
  return { valid: true };
}

// ===== VALIDATION RESULT TYPES =====

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface DetailedValidationResult extends ValidationResult {
  details?: {
    size: ValidationResult;
    type: ValidationResult;
    signature: ValidationResult;
    filename: ValidationResult;
    permissions: ValidationResult;
  };
}

/**
 * Run complete validation suite on a file
 */
export async function runFullValidation(
  file: File, 
  userId?: string
): Promise<DetailedValidationResult> {
  const results: DetailedValidationResult = {
    valid: true,
    details: {
      size: validateFileSize(file),
      type: validateFileType(file),
      signature: await validateFileSignature(file),
      filename: { valid: isFilenameSafe(file.name) },
      permissions: validateUserPermissions(userId)
    }
  };
  
  // Check if any validation failed
  const allValidations = Object.values(results.details!);
  const hasFailure = allValidations.some(validation => !validation.valid);
  
  if (hasFailure) {
    results.valid = false;
    // Return first error found
    const firstError = allValidations.find(validation => !validation.valid);
    results.error = firstError?.error || 'Validação falhou';
  }
  
  return results;
}

/**
 * Main validation function for upload system
 */
export async function validateUploadFile(
  file: File, 
  uploadType: string, 
  userId?: string
): Promise<ValidationResult> {
  try {
    console.log(`🔍 Validating file: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Run complete validation
    const result = await runFullValidation(file, userId);
    
    if (!result.valid) {
      console.log(`❌ File validation failed: ${result.error}`);
      return { valid: false, error: result.error };
    }
    
    console.log(`✅ File validation passed: ${file.name}`);
    return { valid: true };
    
  } catch (error) {
    console.error('💥 Error in validateUploadFile:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}