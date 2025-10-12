"use client";

import { useState } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  serviceHistoryId: string;
  onSubmit?: (data: any) => void;
}

export function ReviewForm({ serviceHistoryId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (uploadedUrls: string[]) => {
    setImages(prev => [...prev, ...uploadedUrls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        serviceHistoryId,
        rating,
        feedback,
        images
      };

      // Aqui você pode chamar uma API para salvar a avaliação
      // const response = await fetch('/api/reviews', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reviewData)
      // });

      console.log('Dados da avaliação:', reviewData);
      
      if (onSubmit) {
        onSubmit(reviewData);
      }

      // Reset form
      setRating(0);
      setFeedback('');
      setImages([]);

    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Avaliar Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Avaliação *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {rating > 0 && (
                <>
                  {rating === 1 && 'Muito ruim'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </>
              )}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium mb-2">
              Comentário (opcional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Conte-nos sobre sua experiência..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500 caracteres
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fotos (opcional)
            </label>
            <ImageUpload
              onUpload={handleImageUpload}
              maxFiles={3}
              maxSize={5}
              disabled={isSubmitting}
            />
            
            {/* Preview das imagens enviadas */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Imagens enviadas:</p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRating(0);
                setFeedback('');
                setImages([]);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}