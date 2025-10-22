"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { reviewFormSchema, type ReviewFormData } from '@/schemas/reviewSchemas';
import { createReview, updateReview } from '@/server/reviewActions';
import { showToast } from '@/lib/toast-utils';

interface ReviewFormProps {
  serviceHistoryId: string;
  existingReview?: {
    id: string;
    rating: number;
    feedback: string | null;
    images: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ 
  serviceHistoryId, 
  existingReview, 
  onSuccess, 
  onCancel 
}: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const isEditing = !!existingReview;

  const form = useForm({
    resolver: zodResolver(reviewFormSchema),
    mode: 'onChange',
    defaultValues: {
      rating: existingReview?.rating || 0,
      feedback: existingReview?.feedback || '',
      images: existingReview?.images || [],
    },
  });

  const { watch, setValue, formState: { errors }, handleSubmit } = form;
  const currentRating = watch('rating');
  const currentImages = watch('images');
  const currentFeedback = watch('feedback');

  const handleImageUpload = (uploadedUrls: string[]) => {
    const newImages = [...(currentImages || []), ...uploadedUrls];
    setValue('images', newImages);
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = (currentImages || []).filter((_, index) => index !== indexToRemove);
    setValue('images', newImages);
  };

  const onSubmit = async (data: ReviewFormData) => {
    startTransition(async () => {
      try {
        let result;
        
        if (isEditing && existingReview) {
          result = await updateReview({
            id: existingReview.id,
            ...data,
          });
        } else {
          result = await createReview({
            serviceHistoryId,
            ...data,
          });
        }

        if (result.success) {
          setSubmitStatus('success');
          showToast.success('Avaliação salva!', result.message || 'Sua avaliação foi salva com sucesso');
          onSuccess?.();
        } else {
          setSubmitStatus('error');
          showToast.error('Erro ao salvar', result.error || 'Erro ao salvar avaliação');
        }
      } catch (error) {
        setSubmitStatus('error');
        showToast.error('Erro inesperado', 'Erro inesperado ao salvar avaliação');
        console.error('Erro no formulário:', error);
      }
    });
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue('rating', star)}
            className={`p-1 rounded transition-colors hover:bg-gray-100 ${
              currentRating >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={isPending}
          >
            <Star
              size={24}
              fill={currentRating >= star ? 'currentColor' : 'none'}
              className="transition-colors"
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
          {submitStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {submitStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Avaliação <span className="text-red-500">*</span>
            </label>
            {renderStars()}
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Comentário (opcional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Compartilhe sua experiência... (mínimo 10 caracteres)"
              value={currentFeedback}
              onChange={(e) => setValue('feedback', e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isPending}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {currentFeedback?.length || 0}/1000 caracteres
              </span>
              {currentFeedback && currentFeedback.length >= 10 && (
                <span className="text-green-600">✓ Válido</span>
              )}
            </div>
            {errors.feedback && (
              <p className="text-sm text-red-500">{errors.feedback.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fotos (opcional - máximo 5)
            </label>
            
            {/* Display uploaded images */}
            {currentImages && currentImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {currentImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isPending}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload component */}
            {(!currentImages || currentImages.length < 5) && (
              <ImageUpload
                onUploadComplete={handleImageUpload}
                maxFiles={5 - (currentImages?.length || 0)}
                disabled={isPending}
              />
            )}
            
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending || currentRating === 0}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : (
                isEditing ? 'Atualizar' : 'Enviar Avaliação'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}