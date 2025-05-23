'use server';

import { ElevenLabsClient } from 'elevenlabs';

export async function getVoices() {
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
  const response = await client.voices.search({
    include_total_count: false,
  });
  console.log('Voices: ', response.voices);
  return response.voices;
}
