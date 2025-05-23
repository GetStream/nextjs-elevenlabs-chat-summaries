'use client';

import type { TextToSpeechRequest, Voice } from 'elevenlabs/api';
import { useState, useCallback } from 'react';

import { streamSpeech } from '@/app/actions/stream-speech';
import { getVoices as getVoicesAction } from '@/app/actions/get-voices';

type UseSpeechOptions = {
  onError?: (error: string) => void;
};

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate speech from text using ElevenLabs API
   * @param voiceId The voice ID to use for generation
   * @param request The text-to-speech request parameters
   * @returns A blob URL to the generated audio, or null if generation failed
   */
  const speak = useCallback(
    async (
      voiceId: string,
      request: TextToSpeechRequest
    ): Promise<string | null> => {
      if (isLoading) return null;

      setIsLoading(true);
      setError(null);

      try {
        const result = await streamSpeech(voiceId, request);

        if (!result.ok) {
          console.error('Error: ', result.error);
          throw new Error(result.error);
        }

        const stream = result.value;
        const response = new Response(stream);
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        return audioUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, options]
  );

  const getVoices = useCallback(async (): Promise<Voice[]> => {
    const voices = await getVoicesAction();
    return voices;
  }, []);

  return {
    speak,
    getVoices,
    isLoading,
    error,
  };
}
