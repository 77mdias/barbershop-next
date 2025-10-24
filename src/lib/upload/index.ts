/**
 * Upload System - Main Index
 * Exports main upload functions from the modular system
 */

// Re-export main upload functions from upload.ts  
export { uploadSingleFile, uploadMultipleFiles } from '../upload';
export { validateFile } from './validators';
export { UPLOAD_CONFIG as getUploadSystemInfo } from './config';
export { createStorageStrategy } from './storage';