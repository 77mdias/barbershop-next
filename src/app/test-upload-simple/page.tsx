'use client';

import { ProfileUploadSimple } from '@/components/upload/ProfileUploadSimple';
import { ReviewUploadSimple } from '@/components/upload/ReviewUploadSimple';

export default function TestUploadSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-8">
            🧪 Teste dos Uploads - Versão Simples
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload de Perfil */}
            <div className="border border-gray-200 rounded-lg p-6">
              <ProfileUploadSimple 
                onUploadComplete={(url) => {
                  console.log('✅ Profile upload completo:', url);
                  alert(`Foto de perfil carregada: ${url}`);
                }}
                currentImageUrl="/images/default-avatar.png"
              />
            </div>

            {/* Upload de Avaliação */}
            <div className="border border-gray-200 rounded-lg p-6">
              <ReviewUploadSimple 
                maxFiles={3}
                onUploadComplete={(urls) => {
                  console.log('✅ Review uploads completos:', urls);
                  alert(`${urls.length} imagem(ns) de avaliação carregada(s)`);
                }}
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 Instruções de Teste:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Foto de Perfil:</strong> Selecione 1 imagem (máx 5MB)</li>
              <li>• <strong>Imagens de Avaliação:</strong> Selecione até 3 imagens (máx 5MB cada)</li>
              <li>• <strong>Formatos aceitos:</strong> JPG, PNG, WEBP</li>
              <li>• <strong>Funcionalidades:</strong> Drag & drop, preview, validação de tamanho</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">🔍 Debug Info:</h3>
            <p className="text-sm text-yellow-800">
              Verifique o console do navegador para logs detalhados do upload.
            </p>
            <p className="text-sm text-yellow-800">
              APIs disponíveis: <code>/api/upload/profile</code> e <code>/api/upload/reviews</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}