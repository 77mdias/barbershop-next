'use client';

import React, { useState } from 'react';
import { FileUpload } from './FileUploadSimple';

interface ReviewUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export const ReviewUploadSimple: React.FC<ReviewUploadProps> = ({
  onUploadComplete,
  maxFiles = 3,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    console.log('🖼️ Arquivos selecionados:', files.length, 'arquivos');
    files.forEach(file => {
      console.log('  -', file.name, '(', (file.size / 1024).toFixed(1), 'KB)');
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Por favor, selecione pelo menos uma imagem!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Iniciando upload de imagens de avaliação...');
      
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/reviews', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      console.log('✅ Upload concluído:', result);

      if (result.success && result.files && result.files.length > 0) {
        // Extrair URLs dos arquivos
        const urls = result.files.map((file: any) => file.url);
        onUploadComplete?.(urls);
        alert(`Upload realizado com sucesso! ${result.files.length} imagem(ns) enviada(s).`);
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">🖼️ Upload de Imagens de Avaliação</h3>
        <p className="text-sm text-gray-600">
          Selecione até {maxFiles} imagens para sua avaliação
        </p>

        <FileUpload
          multiple={true}
          accept="image/*"
          maxSize={5 * 1024 * 1024} // 5MB
          onFilesChange={handleFilesChange}
          disabled={isUploading}
          variant="dropzone"
        />

        {selectedFiles.length > 0 && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm font-medium">
              {selectedFiles.length} arquivo(s) selecionado(s):
            </p>
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUploading && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm font-medium">Fazendo upload de {selectedFiles.length} imagem(ns)...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
        >
          {isUploading 
            ? `📤 Fazendo Upload de ${selectedFiles.length} imagem(ns)...` 
            : `📤 Fazer Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length} arquivo${selectedFiles.length > 1 ? 's' : ''})` : ''}`
          }
        </button>
      </div>
    </div>
  );
};