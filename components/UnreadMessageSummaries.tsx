import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TextToSpeechRequest, Voice } from 'elevenlabs/api';
import { useSpeech } from '@/app/hooks/use-speech';
import { Channel, OwnUserResponse, UserResponse } from 'stream-chat';
import { DefaultStreamChatGenerics } from 'stream-chat-react';

type UnreadMessageSummariesProps = {
  loadedChannels: Channel[];
  user:
    | OwnUserResponse<DefaultStreamChatGenerics>
    | UserResponse<DefaultStreamChatGenerics>
    | undefined;
};

export default function UnreadMessageSummaries({
  loadedChannels,
  user,
}: UnreadMessageSummariesProps) {
  const [channelSummaries, setChannelSummaries] = useState<
    { channelName: string; summary: string }[]
  >([]);
  const [voiceId, setVoiceId] = useState<string>('JBFqnCBsd6RMkjVDRZzb');
  const [voices, setVoices] = useState<Voice[]>([]);

  const { speak, getVoices } = useSpeech();

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    const fetchVoices = async () => {
      console.log('Fetching voices');
      const voices = await getVoices();
      setVoices(voices);
    };
    fetchVoices();
  }, [getVoices]);

  const playAudio = async (text: string) => {
    console.log('Playing with voice: ', voiceId);

    const requestData: TextToSpeechRequest = {
      text: text,
      model_id: 'eleven_flash_v2_5', // Options: eleven_flash_v2_5, eleven_multilingual_v2, eleven_turbo_v2_5
    };

    try {
      // Use voice ID from Eleven Labs docs
      const audioUrl = await speak(voiceId, requestData);
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
    <section className='flex items-center justify-center px-4 py-4 w-full'>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant='default'
            className='cursor-pointer'
            onClick={() => {
              const fetchChannelSummaries = async () => {
                try {
                  // Get channels with unread messages
                  const channelsWithUnread = loadedChannels?.filter(
                    (channel) =>
                      channel.state.read[user?.id as string]?.unread_messages >
                      0
                  );

                  if (!channelsWithUnread?.length) return;

                  const placeHolderSummaries = channelsWithUnread.map(
                    (channel) => ({
                      channelName: channel.data?.name || 'Unnamed Channel',
                      summary: '',
                    })
                  );

                  setChannelSummaries(placeHolderSummaries);

                  // Fetch summaries for each channel
                  const summaries = await Promise.all(
                    channelsWithUnread.map(async (channel) => {
                      return getSummaryForChannel(channel);
                    })
                  );

                  // Update state with new summaries
                  setChannelSummaries(summaries);
                } catch (error) {
                  console.error('Error fetching channel summaries:', error);
                }
              };

              fetchChannelSummaries();
            }}
          >
            What did I miss?
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='min-w-[70%] max-w-3xl w-full'>
          <AlertDialogHeader>
            <div className='flex items-center justify-between gap-2'>
              <AlertDialogTitle>Unread Message Summaries</AlertDialogTitle>
              <Select
                value={voiceId}
                onValueChange={(value) => setVoiceId(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select Voice' />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AlertDialogDescription>
              Here are AI-generated summaries for channels with unread messages:
              <Table className='w-full mt-4'>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelSummaries.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium text-foreground'>
                        {item.channelName}
                      </TableCell>
                      <TableCell className='w-full text-muted-foreground whitespace-pre-line break-words space-y-2'>
                        {item.summary === '' && (
                          <>
                            <Skeleton className='w-full h-4' />
                            <Skeleton className='w-full h-4' />
                            <Skeleton className='w-full h-4' />
                          </>
                        )}
                        {item.summary !== '' && <>{item.summary}</>}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => playAudio(item.summary)}
                          aria-label={`Read summary for ${item.channelName}`}
                          tabIndex={0}
                          className='px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition focus:outline-none focus:ring-2 focus:ring-primary'
                        >
                          Read
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className='cursor-pointer'
              variant='default'
              onClick={() => {
                const summary = channelSummaries
                  .map((item) => `${item.channelName}: ${item.summary}`)
                  .join('\n');
                console.log('Summary: ', summary);

                playAudio(summary);
              }}
            >
              Read all
            </Button>
            <AlertDialogCancel
              className='cursor-pointer'
              onClick={() => {
                if (audioElement) {
                  audioElement.pause();
                }
              }}
            >
              Close
            </AlertDialogCancel>
            {/* Optional: Add an action like "Mark as Read" or similar */}
            {/* <AlertDialogAction>Mark All Read</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );

  async function getSummaryForChannel(channel: Channel): Promise<{
    channelName: string;
    summary: string;
  }> {
    console.log(
      `Getting summary for ${channel.data?.name} with body: ${JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'You are handed messages from a chat channel. Please summarize them and ensure no context misses. If important also name the people involved and what their intentions and/or questions have been.',
          },
          {
            role: 'user',
            content: `Unread messages: ${getUnreadMessages(channel)}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'summary_response',
            strict: 'true',
            schema: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                },
              },
              required: ['summary'],
            },
          },
        },
      })}`
    );
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'You are handed messages from a chat channel. Please summarize them in 2 sentences and ensure there is no missing information. Respond only with the summary that is relevant to the user and no boilerplate.',
          },
          {
            role: 'user',
            content: `Unread messages: ${getUnreadMessages(channel)}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'summary_response',
            strict: 'true',
            schema: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                },
              },
              required: ['summary'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch summary for ${channel.data?.name}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    console.log('content: ', content);
    return {
      channelName: channel.data?.name || 'Unnamed Channel',
      summary: content['summary'],
    };
  }

  function getUnreadMessages(channel: Channel): string[] {
    const messages = channel.state.messages;
    const numberOfUnreadMessages =
      channel.state.read[user?.id as string].unread_messages;
    return messages
      .slice(-numberOfUnreadMessages)
      .map((message) => `${message.user?.name}: ${message.text}`);
  }
}
