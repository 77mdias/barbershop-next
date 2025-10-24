/**
 * 📤 File Upload Component
 * 
 * Componente universal de upload com drag-and-drop, preview e validação.
 * Suporta tanto upload único quanto múltiplo.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useUpload, UploadHookOptions } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// ===== TYPES =====

export interface FileUploadProps extends Omit<UploadHookOptions, 'endpoint'> {
  onUpload?: (urls: string[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  endpoint: string;
}

// ===== COMPONENT =====

export function FileUpload({
  onUpload,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  placeholder,
  maxFiles = 5,
  maxFileSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  autoUpload = false,
  endpoint
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    hasValidFiles,
    hasUploadedFiles,
    uploadedUrls
  } = useUpload({
    maxFiles,
    maxFileSize,
    allowedTypes,
    autoUpload,
    endpoint
  });
  
  // ===== EVENT HANDLERS =====
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles, disabled]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);
  
  const handleUpload = useCallback(async () => {
    try {
      await uploadFiles();
      
      if (uploadedUrls.length > 0) {
        onUpload?.(uploadedUrls);
        onUploadComplete?.(uploadedUrls);
      }
    } catch (error: any) {
      onError?.(error.message || 'Upload failed');
    }
  }, [uploadFiles, uploadedUrls, onUpload, onUploadComplete, onError]);
  
  // ===== RENDER HELPERS =====
  
  const getFileIcon = (file: any) => {
    if (file.uploaded) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (file.error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (file.uploading) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    return null;
  };
  
  const getProgressBar = (file: any) => {
    if (!file.uploading || !file.progress) return null;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
        <div 
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${file.progress}%` }}
        />
      </div>
    );
  };
  
  // ===== RENDER =====
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          'hover:border-gray-400 hover:bg-gray-50',
          {
            'border-blue-400 bg-blue-50': isDragOver,
            'border-gray-300': !isDragOver,
            'opacity-50 cursor-not-allowed': disabled,
            'cursor-pointer': !disabled
          }
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-gray-400" />
          
          <div>
            <p className="text-sm text-gray-600">
              {placeholder || (
                <>
                  Arraste suas imagens aqui ou{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    clique para selecionar
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxFiles} arquivo{maxFiles > 1 ? 's' : ''} • {maxFileSize}MB cada • JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </div>
      
      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Arquivos selecionados ({files.length}):
            </h4>
            
            <div className="flex gap-2">
              {!autoUpload && hasValidFiles && !isUploading && (
                <button
                  onClick={handleUpload}
                  disabled={disabled}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Enviar
                </button>
              )}
              
              <button
                onClick={clearFiles}
                disabled={disabled || isUploading}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Limpar
              </button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Preview */}
                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                  
                  {getProgressBar(file)}
                </div>
                
                {/* Status & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getFileIcon(file)}
                  
                  {!file.uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      disabled={disabled}
                      className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Enviando arquivos...
        </div>
      )}
      
      {hasUploadedFiles && (
        <div className="text-sm text-green-600">
          ✅ {uploadedUrls.length} arquivo{uploadedUrls.length > 1 ? 's' : ''} enviado{uploadedUrls.length > 1 ? 's' : ''} com sucesso!
        </div>
      )}
    </div>
  );
}