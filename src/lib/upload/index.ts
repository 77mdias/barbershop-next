/**
 * Upload System - Main Index
 * Exports main upload functions from the modular system
 */

// Re-export main upload functions from the server implementation
export {
	uploadSingleFile,
	uploadMultipleFiles,
	validateFile,
	getUploadSystemInfo,
	deleteUploadedFile,
	checkFileExists,
} from "../upload-server";

// Re-export config helpers
export {
	UPLOAD_CONFIG,
	ENVIRONMENT,
	getStorageConfig,
	getProcessingOptions,
	ERROR_MESSAGES,
	UploadType,
} from "./config";

export { createStorageStrategy } from "./storage";