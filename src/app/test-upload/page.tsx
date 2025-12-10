/**
 * 🧪 Test Upload Page
 * 
 * Página para testar o sistema de upload em desenvolvimento.
 * Inclui testes para profile e review uploads.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

'use client';

import React, { useState } from 'react';
import { ProfileUpload, ReviewUpload } from '@/components/upload';
import { getUploadSystemInfo } from '@/lib/upload';
import { ENVIRONMENT } from '@/lib/upload/config';

export default function TestUploadPage() {
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [reviewUrls, setReviewUrls] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [systemInfo] = useState(() => getUploadSystemInfo());
  const environmentDetails = ENVIRONMENT;
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };
  
  const handleProfileUpload = (url: string) => {
    setProfileUrl(url);
    addLog(`✅ Profile uploaded: ${url}`);
  };
  
  const handleProfileError = (error: string) => {
    addLog(`❌ Profile error: ${error}`);
  };
  
  const handleReviewUpload = (urls: string[]) => {
    setReviewUrls(prev => [...prev, ...urls]);
    addLog(`✅ Reviews uploaded: ${urls.length} files`);
  };
  
  const handleReviewError = (error: string) => {
    addLog(`❌ Review error: ${error}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🧪 Upload System Test
          </h1>
          <p className="text-gray-600 mt-2">
            Teste o sistema de upload renovado
          </p>
        </div>
        
        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">📊 System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Environment</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Production: {environmentDetails.isProduction ? '✅' : '❌'}</p>
                <p>• Vercel: {environmentDetails.isVercel ? '✅' : '❌'}</p>
                <p>• Read-only FS: {environmentDetails.isReadOnlyFS ? '✅' : '❌'}</p>
                <p>• Development: {environmentDetails.isDevelopment ? '✅' : '❌'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Configuration</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Storage: {systemInfo.storageStrategy}</p>
                <p>• Features: {systemInfo.features.length} enabled</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Upload Test */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">👤 Profile Upload</h2>
            
            <ProfileUpload
              currentImageUrl={profileUrl}
              onUpload={handleProfileUpload}
              onError={handleProfileError}
              size="lg"
            />
            
            {profileUrl && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Profile URL: <code className="text-xs">{profileUrl}</code>
                </p>
              </div>
            )}
          </div>
          
          {/* Review Upload Test */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">⭐ Review Upload</h2>
            
            <ReviewUpload
              onUpload={handleReviewUpload}
              onError={handleReviewError}
              maxFiles={5}
              showGallery={true}
            />
            
            {reviewUrls.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  ✅ Review URLs ({reviewUrls.length}):
                </p>
                <div className="space-y-1">
                  {reviewUrls.map((url, index) => (
                    <code key={index} className="block text-xs text-green-700">
                      {index + 1}. {url}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Upload Gallery */}
        {(profileUrl || reviewUrls.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-lg font-semibold mb-4">🖼️ Upload Gallery</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {profileUrl && (
                <div className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={profileUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-600">Profile</p>
                </div>
              )}
              
              {reviewUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={url}
                      alt={`Review ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-600">
                    Review {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">📋 Upload Logs</h2>
          
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum upload realizado ainda...</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs font-mono p-2 rounded bg-gray-50"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setLogs([])}
            className="mt-3 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Limpar Logs
          </button>
        </div>
        
        {/* API Test Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">🔧 API Tests</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/upload/profile');
                  const data = await response.json();
                  addLog(`📊 Profile API info: ${JSON.stringify(data)}`);
                } catch (error: any) {
                  addLog(`❌ Profile API error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Test Profile API Info
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/upload/reviews');
                  const data = await response.json();
                  addLog(`📊 Reviews API info: ${JSON.stringify(data)}`);
                } catch (error: any) {
                  addLog(`❌ Reviews API error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Test Reviews API Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}