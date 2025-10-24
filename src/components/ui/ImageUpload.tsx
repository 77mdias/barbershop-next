'use client';

import React from 'react';
import { ReviewUploadSimple } from '@/components/upload/ReviewUploadSimple';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxFiles = 3, 
  disabled = false,
  className 
}: ImageUploadProps) {
  return (
    <div className={className}>
      <ReviewUploadSimple
        maxFiles={maxFiles}
        onUploadComplete={(urls) => {
          // Combinar URLs existentes com as novas
          const allImages = [...images, ...urls];
          onImagesChange(allImages);
        }}
        className="mb-4"
      />
      
      {/* Mostrar imagens existentes */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Imagens da Avaliação ({images.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = images.filter((_, i) => i !== index);
                    onImagesChange(newImages);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}