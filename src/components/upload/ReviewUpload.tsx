/**
 * ⭐ Review Upload Component
 * 
 * Componente específico para upload de imagens em avaliações.
 * Suporta múltiplas imagens com gallery preview.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use client';

import React from 'react';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface ReviewUploadProps {
  onUpload?: (urls: string[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
  showGallery?: boolean;
}

// ===== COMPONENT =====

export function ReviewUpload({
  onUpload,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  maxFiles = 5,
  showGallery = true
}: ReviewUploadProps) {
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  
  const handleUpload = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
    onUpload?.(urls);
  };
  
  const handleUploadComplete = (urls: string[]) => {
    onUploadComplete?.(urls);
  };
  
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Component */}
      <FileUpload
        endpoint="/api/upload/reviews"
        maxFiles={maxFiles}
        maxFileSize={5}
        autoUpload={false}
        onUpload={handleUpload}
        onUploadComplete={handleUploadComplete}
        onError={onError}
        disabled={disabled}
        placeholder="Adicione fotos da sua experiência"
      />
      
      {/* Uploaded Images Gallery */}
      {showGallery && uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">
            Imagens adicionadas ({uploadedImages.length}):
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  ×
                </button>
                
                {/* Image Number */}
                <div className="absolute bottom-1 left-1 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Adicione até {maxFiles} fotos da sua experiência</p>
        <p>• Mostre o ambiente, o resultado do serviço ou detalhes importantes</p>
        <p>• Formatos aceitos: JPEG, PNG, WebP • Máximo 5MB cada</p>
      </div>
      
      {/* Tips */}
      {uploadedImages.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 text-sm mb-2">
            💡 Dicas para boas fotos:
          </h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use boa iluminação (natural é melhor)</li>
            <li>• Mostre o resultado final do serviço</li>
            <li>• Inclua detalhes do ambiente</li>
            <li>• Evite fotos borradas ou muito escuras</li>
          </ul>
        </div>
      )}
    </div>
  );
}