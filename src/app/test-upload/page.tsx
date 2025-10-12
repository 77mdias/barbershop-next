"use client";

import { ReviewForm } from '@/components/ReviewForm';

export default function TestUploadPage() {
  const handleReviewSubmit = (data: any) => {
    console.log('Avaliação submetida:', data);
    alert('Avaliação enviada com sucesso! Verifique o console para ver os dados.');
  };

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Upload de Imagens
          </h1>
          <p className="text-gray-600">
            Esta é uma página de teste para o sistema de upload de imagens nas avaliações.
          </p>
        </div>

        <ReviewForm
          serviceHistoryId="test-service-history-id"
          onSuccess={() => console.log('Review submitted successfully!')}
        />        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades Implementadas:</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Upload seguro de imagens com validação de tipo e tamanho</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Verificação de assinatura de arquivo (magic numbers)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Otimização automática de imagens com Sharp</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Rate limiting para prevenir abuso</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Detecção de duplicatas baseada em hash</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Preview em tempo real com drag & drop</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Autenticação obrigatória para upload</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Schema do banco atualizado com campo de imagens</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Para testar completamente, você precisa estar logado no sistema. 
                As imagens serão salvas em <code>/public/uploads/reviews/</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}