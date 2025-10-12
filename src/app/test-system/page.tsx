"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestReviewSystemPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestServiceHistory = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test/create-service-history', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setTimeout(() => {
          window.location.href = '/test-review-form';
        }, 2000);
      } else {
        setMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erro de rede: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Sistema de Teste de Avaliações
          </h1>
          <p className="text-gray-600">
            Configure dados de teste para verificar o sistema de avaliações
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🎯 Passo 1: Criar Dados de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Crie um ServiceHistory sem avaliação para poder testar o formulário de nova avaliação.
            </p>
            
            <Button 
              onClick={createTestServiceHistory}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Criando...' : 'Criar ServiceHistory para Teste'}
            </Button>
            
            {message && (
              <div className={`p-3 rounded ${
                message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔗 Passo 2: Links de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <a 
                href="/test-review-form" 
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded border text-blue-700 hover:text-blue-800 transition-colors"
              >
                📝 <strong>Formulário de Teste</strong><br/>
                <span className="text-sm">Teste criar/editar avaliações com dados reais</span>
              </a>
              
              <a 
                href="/test-reviews-real" 
                className="block p-3 bg-green-50 hover:bg-green-100 rounded border text-green-700 hover:text-green-800 transition-colors"
              >
                🎨 <strong>Cliente Review Integrado</strong><br/>
                <span className="text-sm">Veja dados reais no componente da homepage</span>
              </a>
              
              <a 
                href="/reviews" 
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded border text-purple-700 hover:text-purple-800 transition-colors"
              >
                🏢 <strong>Sistema Completo</strong><br/>
                <span className="text-sm">Interface completa de gerenciamento de avaliações</span>
              </a>
              
              <a 
                href="/test-upload" 
                className="block p-3 bg-orange-50 hover:bg-orange-100 rounded border text-orange-700 hover:text-orange-800 transition-colors"
              >
                📸 <strong>Upload de Imagens</strong><br/>
                <span className="text-sm">Teste o sistema de upload de imagens</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Usuário atual:</strong> Logado como cliente</p>
              <p><strong>Objetivo:</strong> Testar se o formulário de avaliação salva corretamente</p>
              <p><strong>Problema encontrado:</strong> Formulário não estava salvando por falta de ServiceHistory válido</p>
              <p><strong>Solução:</strong> Criar ServiceHistory real para testar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}