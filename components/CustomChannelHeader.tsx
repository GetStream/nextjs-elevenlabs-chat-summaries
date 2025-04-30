'use client';

import { useSpeech } from '@/app/hooks/use-speech';
import { TextToSpeechRequest } from 'elevenlabs/api';
import { ChannelHeaderProps } from 'stream-chat-react';
import { useState } from 'react';

const CustomChannelHeader = (props: ChannelHeaderProps) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  const {
    speak,
    isLoading: isSpeaking,
    error,
  } = useSpeech({
    onError: (errorMessage) => console.error('Speech error:', errorMessage),
  });

  const playAudio = async () => {
    const requestData: TextToSpeechRequest = {
      text: 'Hello, how are you?',
      model_id: 'eleven_multilingual_v2', // Add model ID as recommended in docs
    };

    try {
      // Use voice ID from Eleven Labs docs
      const audioUrl = await speak('JBFqnCBsd6RMkjVDRZzb', requestData);
      console.log('Audio URL:', audioUrl);

      if (audioUrl) {
        // Create and play the audio
        if (audioElement) {
          audioElement.pause();
          audioElement.src = audioUrl;
          audioElement.play();
        } else {
          const newAudio = new Audio(audioUrl);
          setAudioElement(newAudio);
          newAudio.play();
        }
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  };

  return (
    <div>
      <h1>{props.title ?? 'My Channel'}</h1>
      <button
        onClick={playAudio}
        disabled={isSpeaking}
        style={{ opacity: isSpeaking ? 0.5 : 1 }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z'
          />
        </svg>
      </button>
      {error && <div style={{ color: 'red', fontSize: '0.8rem' }}>{error}</div>}
    </div>
  );
};

export default CustomChannelHeader;
