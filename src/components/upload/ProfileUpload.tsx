/**
 * 👤 Profile Upload Component
 * 
 * Componente específico para upload de foto de perfil.
 * Suporta apenas uma imagem com preview circular.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use client';

import React from 'react';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface ProfileUploadProps {
  currentImageUrl?: string;
  onUpload?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ===== COMPONENT =====

export function ProfileUpload({
  currentImageUrl,
  onUpload,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  size = 'md'
}: ProfileUploadProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const handleUpload = (urls: string[]) => {
    if (urls.length > 0) {
      onUpload?.(urls[0]);
    }
  };
  
  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      onUploadComplete?.(urls[0]);
    }
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Profile Image */}
      {currentImageUrl && (
        <div className="text-center">
          <div className={cn(
            'mx-auto rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300',
            sizeClasses[size]
          )}>
            <img
              src={currentImageUrl}
              alt="Foto de perfil atual"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Foto atual</p>
        </div>
      )}
      
      {/* Upload Component */}
      <FileUpload
        endpoint="/api/upload/profile"
        maxFiles={1}
        maxFileSize={5}
        autoUpload={true}
        onUpload={handleUpload}
        onUploadComplete={handleUploadComplete}
        onError={onError}
        disabled={disabled}
        placeholder="Selecione uma nova foto de perfil"
        className="max-w-md mx-auto"
      />
      
      {/* Guidelines */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>• Recomendamos imagens quadradas (400x400px)</p>
        <p>• Formatos aceitos: JPEG, PNG, WebP</p>
        <p>• Tamanho máximo: 5MB</p>
      </div>
    </div>
  );
}