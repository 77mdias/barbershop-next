/**
 * 📤 Upload Hook
 * 
 * Hook React para gerenciar uploads de arquivos com validação,
 * progress tracking e error handling.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ===== TYPES =====

export interface UploadFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  url?: string;
  base64?: string;
  progress?: number;
}

export interface UploadHookOptions {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  autoUpload?: boolean;
  endpoint: string;
}

export interface UploadHookReturn {
  files: UploadFile[];
  isUploading: boolean;
  addFiles: (newFiles: FileList | File[]) => void;
  removeFile: (index: number) => void;
  uploadFiles: () => Promise<void>;
  clearFiles: () => void;
  hasValidFiles: boolean;
  hasUploadedFiles: boolean;
  uploadedUrls: string[];
}

// ===== UPLOAD HOOK =====

export function useUpload(options: UploadHookOptions): UploadHookReturn {
  const {
    maxFiles = 5,
    maxFileSize = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    autoUpload = false,
    endpoint
  } = options;
  
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ===== VALIDATION =====
  
  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.';
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB.`;
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);
  
  // ===== FILE MANAGEMENT =====
  
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    
    if (files.length + filesArray.length > maxFiles) {
      console.warn(`Máximo de ${maxFiles} arquivos permitidos.`);
      return;
    }
    
    const validFiles: UploadFile[] = [];
    
    for (const file of filesArray) {
      const error = validateFile(file);
      
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
        error: error || undefined,
        progress: 0
      });
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Auto upload if enabled and files are valid
    if (autoUpload && validFiles.some(f => !f.error)) {
      setTimeout(() => uploadFiles(), 100);
    }
  }, [files.length, maxFiles, validateFile, autoUpload]);
  
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);
  
  const clearFiles = useCallback(() => {
    // Revoke all object URLs
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
  }, [files]);
  
  // ===== UPLOAD LOGIC =====
  
  const uploadFiles = useCallback(async () => {
    const filesToUpload = files.filter(f => !f.error && !f.uploaded);
    
    if (filesToUpload.length === 0) {
      console.warn('No valid files to upload');
      return;
    }
    
    setIsUploading(true);
    
    // Create new AbortController for this upload session
    abortControllerRef.current = new AbortController();
    
    try {
      // Mark files as uploading
      setFiles(prev => prev.map(f => 
        filesToUpload.includes(f) ? { ...f, uploading: true, progress: 0 } : f
      ));
      
      // Prepare FormData
      const formData = new FormData();
      
      if (endpoint.includes('profile')) {
        // Single file for profile
        formData.append('file', filesToUpload[0].file);
      } else {
        // Multiple files for reviews
        filesToUpload.forEach(({ file }) => {
          formData.append('files', file);
        });
      }
      
      // Upload with progress tracking
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      // Update files with results
      if (endpoint.includes('profile') && result.file) {
        // Single file response
        setFiles(prev => prev.map((f, index) => {
          if (index === 0 && filesToUpload.includes(f)) {
            return {
              ...f,
              uploading: false,
              uploaded: true,
              url: result.file.url,
              base64: result.file.base64,
              progress: 100
            };
          }
          return f;
        }));
      } else if (result.files) {
        // Multiple files response
        setFiles(prev => prev.map(f => {
          const uploadIndex = filesToUpload.findIndex(uf => uf === f);
          if (uploadIndex !== -1 && result.files[uploadIndex]) {
            const uploadedFile = result.files[uploadIndex];
            return {
              ...f,
              uploading: false,
              uploaded: true,
              url: uploadedFile.url,
              base64: uploadedFile.base64,
              progress: 100
            };
          }
          return f;
        }));
      }
      
      console.log('✅ Upload successful:', result);
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      // Mark files as failed
      setFiles(prev => prev.map(f => 
        filesToUpload.includes(f) ? { 
          ...f, 
          uploading: false, 
          uploaded: false,
          error: error.message || 'Upload failed',
          progress: 0
        } : f
      ));
      
      // Re-throw error for handling by components
      throw error;
      
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [files, endpoint]);
  
  // ===== COMPUTED VALUES =====
  
  const hasValidFiles = files.some(f => !f.error);
  const hasUploadedFiles = files.some(f => f.uploaded);
  const uploadedUrls = files
    .filter(f => f.uploaded && f.url)
    .map(f => f.url!);
  
  // ===== CLEANUP ON UNMOUNT =====
  
  useEffect(() => {
    return () => {
      // Cleanup object URLs
      files.forEach(file => URL.revokeObjectURL(file.preview));
      
      // Abort ongoing uploads
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [files]);
  
  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    hasValidFiles,
    hasUploadedFiles,
    uploadedUrls
  };
}