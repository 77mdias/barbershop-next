'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'dropzone';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  onFilesChange,
  disabled = false,
  className,
  variant = 'default'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Arquivo ${file.name} é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB.`;
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return `Arquivo ${file.name} não é válido. Tipos aceitos: ${accept}`;
    }
    
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    
    if (multiple) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
      onFilesChange?.(validFiles.slice(0, 1));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={disabled}
          className={cn(
            'px-3 py-2 border border-gray-300 rounded-md text-sm font-medium',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          📁 Escolher Arquivo
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {selectedFiles.length > 0 && (
          <span className="text-sm text-gray-600">
            {selectedFiles.length} arquivo(s) selecionado(s)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {dragActive ? 'Solte os arquivos aqui' : 'Clique para fazer upload ou arraste e solte'}
            </p>
            <p className="text-xs text-gray-500">
              {accept} até {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Arquivos Selecionados:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                {file.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};