"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload?: (urls: string[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // em MB
  disabled?: boolean;
  className?: string;
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

export function ImageUpload({
  onUpload,
  onUploadComplete,
  maxFiles = 5,
  maxSize = 5,
  disabled = false,
  className,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.';
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB.`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    
    if (files.length + filesArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos.`);
      return;
    }

    const validFiles: UploadedFile[] = [];
    
    for (const file of filesArray) {
      const error = validateFile(file);
      
      validFiles.push({
        file,
        preview: createPreview(file),
        uploading: false,
        error: error || undefined
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, validateFile, createPreview]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Liberar URL do preview
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    const filesToUpload = files.filter(f => !f.error && !f.url);
    
    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Marcar arquivos como uploading
      setFiles(prev => prev.map(f => 
        filesToUpload.includes(f) ? { ...f, uploading: true } : f
      ));

      const formData = new FormData();
      filesToUpload.forEach(({ file }) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      // Atualizar arquivos com URLs
      setFiles(prev => prev.map((f, index) => {
        const uploadIndex = filesToUpload.findIndex(uf => uf === f);
        if (uploadIndex !== -1 && result.files[uploadIndex]) {
          return {
            ...f,
            url: result.files[uploadIndex].url,
            uploading: false
          };
        }
        return { ...f, uploading: false };
      }));

      // Chamar callback com URLs
      const uploadedUrls = result.files.map((f: any) => f.url);
      onUpload?.(uploadedUrls);
      onUploadComplete?.(uploadedUrls);

    } catch (error) {
      console.error('Erro no upload:', error);
      
      // Marcar arquivos com erro
      setFiles(prev => prev.map(f => 
        filesToUpload.includes(f) 
          ? { ...f, uploading: false, error: 'Erro no upload' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

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
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const hasValidFiles = files.some(f => !f.error);
  const hasUploadedFiles = files.some(f => f.url);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver && !disabled 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">
              Arraste suas imagens aqui ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-primary hover:text-primary-dark font-medium"
              >
                clique para selecionar
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxFiles} arquivos • {maxSize}MB cada • JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Arquivos selecionados:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map((fileItem, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={fileItem.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay de Status */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {fileItem.uploading && (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {fileItem.url && (
                      <Check className="w-6 h-6 text-green-400" />
                    )}
                    {fileItem.error && (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                </div>

                {/* Botão Remover */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={fileItem.uploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Status */}
                <div className="mt-1 text-xs">
                  {fileItem.error && (
                    <p className="text-red-600">{fileItem.error}</p>
                  )}
                  {fileItem.uploading && (
                    <p className="text-blue-600">Enviando...</p>
                  )}
                  {fileItem.url && (
                    <p className="text-green-600">Enviado</p>
                  )}
                  {!fileItem.error && !fileItem.uploading && !fileItem.url && (
                    <p className="text-gray-600">Pronto</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Upload */}
      {hasValidFiles && !hasUploadedFiles && (
        <button
          type="button"
          onClick={uploadFiles}
          disabled={isUploading || disabled}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium transition-colors",
            "bg-primary text-white hover:bg-primary-dark",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            'Enviar Imagens'
          )}
        </button>
      )}
    </div>
  );
}