'use client';

import React, { useState } from 'react';
import { FileUpload } from './FileUploadSimple';

interface ProfileUploadProps {
  onUploadComplete?: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export const ProfileUploadSimple: React.FC<ProfileUploadProps> = ({
  onUploadComplete,
  currentImageUrl,
  className
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      console.log('📸 Arquivo selecionado:', files[0].name, 'Tamanho:', files[0].size);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione uma imagem primeiro!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Iniciando upload de foto de perfil...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/upload/profile', {
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

      if (result.success && result.file && result.file.url) {
        onUploadComplete?.(result.file.url);
        alert(`Upload realizado com sucesso! URL: ${result.file.url}`);
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
        <h3 className="text-lg font-medium">📸 Upload de Foto de Perfil</h3>
        
        {currentImageUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
            <img 
              src={currentImageUrl} 
              alt="Foto atual" 
              className="w-20 h-20 rounded-full object-cover border"
            />
          </div>
        )}

        <FileUpload
          multiple={false}
          accept="image/*"
          maxSize={5 * 1024 * 1024} // 5MB
          onFilesChange={handleFilesChange}
          disabled={isUploading}
          variant="dropzone"
        />

        {selectedFile && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium">Arquivo selecionado:</p>
            <p className="text-sm text-gray-600">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm font-medium">Fazendo upload...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isUploading ? '📤 Fazendo Upload...' : '📤 Fazer Upload'}
        </button>
      </div>
    </div>
  );
};