import React, { useState } from 'react';
import {
  ChannelPreviewUIComponentProps,
  useChatContext,
} from 'stream-chat-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority'; // For styling variants (e.g., selected)
import type { ChannelListMessengerProps } from 'stream-chat-react';
import { DefaultGenerics } from 'stream-chat';
import { Channel } from 'stream-chat';
import { useSpeech } from '@/app/hooks/use-speech';
import { Button } from './ui/button';
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
import { TextToSpeechRequest } from 'elevenlabs/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// We'll use the original ChannelList for its logic initially,
// but provide custom UI components to it.
// Or completely replace it depending on complexity needed.

// Function to get initials (move to utils)
const getInitials = (name: string = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

// Define styles for the preview item, including a selected variant
const channelPreviewVariants = cva(
  'flex w-full max-w-full items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors',
  {
    variants: {
      selected: {
        true: 'bg-slate-300 text-accent-foreground',
        false: 'bg-slate-50 hover:bg-slate-100',
      },
      unread: {
        true: 'bg-amber-100 ',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

// Custom Component for rendering a single channel preview
export const CustomChannelPreview: React.ComponentType<
  ChannelPreviewUIComponentProps<DefaultGenerics>
> = (props: ChannelPreviewUIComponentProps<DefaultGenerics>) => {
  const { channel, setActiveChannel, latestMessage, unread, active } = props;

  const channelName = channel.data?.name || 'Unnamed Channel';
  const lastMessageText = latestMessage ?? 'No messages yet';

  const handleSelectChannel = () => {
    if (setActiveChannel) {
      setActiveChannel(channel);
    }
  };

  return (
    <button
      className={cn(
        channelPreviewVariants({
          selected: active,
          unread: unread ? unread > 0 : false,
        })
      )}
      onClick={handleSelectChannel}
      tabIndex={0}
      aria-label={`Select channel ${channelName}`}
    >
      <Avatar className='w-9 h-9 flex-shrink-0'>
        <AvatarImage src={channel.data?.image as string} alt={channelName} />
        <AvatarFallback>{getInitials(channelName)}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <div className='flex justify-between items-center'>
          <p className='text-sm font-medium truncate'>{channelName}</p>
          {unread !== undefined && unread > 0 && (
            <span className='text-xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5'>
              {unread}
            </span>
          )}
        </div>
        <span className='latestMessageText'>{lastMessageText}</span>
      </div>
    </button>
  );
};

export const ListLoadingSkeleton = () => (
  <div className='p-4 space-y-3'>
    <div className='flex items-center space-x-3'>
      <Skeleton className='h-9 w-9 rounded-full' />
      <div className='space-y-1 flex-1'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
    </div>
    <div className='flex items-center space-x-3'>
      <Skeleton className='h-9 w-9 rounded-full' />
      <div className='space-y-1 flex-1'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
    </div>
    <div className='flex items-center space-x-3'>
      <Skeleton className='h-9 w-9 rounded-full' />
      <div className='space-y-1 flex-1'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
    </div>
  </div>
);

export const CustomListContainer = ({
  children,
  loading,
  loadedChannels,
  error,
}: React.PropsWithChildren<ChannelListMessengerProps>) => {
  const { client } = useChatContext();
  const { speak } = useSpeech();
  const [placeholderSummaries, setPlaceholderSummaries] = useState<
    { channelName: string; summary: string }[]
  >([]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const user = client?.user;

  const playAudio = async (text: string) => {
    const requestData: TextToSpeechRequest = {
      text: text,
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (loadedChannels?.length === 0) {
    return <div>No channels found</div>;
  }

  console.log('loadedChannels: ', loadedChannels);
  const unreadMessagesExist =
    loadedChannels?.some(
      (loadedChannel) =>
        loadedChannel.state.read[user?.id as string]?.unread_messages > 0
    ) ?? false;
  console.log('unreadMessagesExist: ', unreadMessagesExist);

  // TODO: use AlertDialog to show summary for channels and read the summaries out loud

  return (
    <>
      <h2 className='px-4 py-2 text-lg font-semibold tracking-tight w-full'>
        Channels
      </h2>
      <div className='flex items-center justify-center px-4 py-4 w-full'>
        {unreadMessagesExist && (
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
                          channel.state.read[user?.id as string]
                            ?.unread_messages > 0
                      );

                      if (!channelsWithUnread?.length) return;

                      const placeHolderSummaries = channelsWithUnread.map(
                        (channel) => ({
                          channelName: channel.data?.name || 'Unnamed Channel',
                          summary: '',
                        })
                      );

                      setPlaceholderSummaries(placeHolderSummaries);

                      // Fetch summaries for each channel
                      const summaries = await Promise.all(
                        channelsWithUnread.map(async (channel) => {
                          console.log(
                            `Getting summary for ${
                              channel.data?.name
                            } with body: ${JSON.stringify({
                              messages: [
                                {
                                  role: 'system',
                                  content:
                                    'You are handed messages from a chat channel. Please summarize them and ensure no context misses. If important also name the people involved and what their intentions and/or questions have been.',
                                },
                                {
                                  role: 'user',
                                  content: `Unread messages: ${getUnreadMessages(
                                    channel
                                  )}`,
                                },
                              ],
                            })}`
                          );
                          const response = await fetch(
                            'http://127.0.0.1:1234/v1/chat/completions',
                            {
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
                                    content: `Unread messages: ${getUnreadMessages(
                                      channel
                                    )}`,
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
                            }
                          );

                          if (!response.ok) {
                            throw new Error(
                              `Failed to fetch summary for ${channel.data?.name}`
                            );
                          }

                          const data = await response.json();
                          const content = JSON.parse(
                            data.choices[0].message.content
                          );
                          console.log('content: ', content);
                          return {
                            channelName:
                              channel.data?.name || 'Unnamed Channel',
                            summary: content['summary'],
                          };
                        })
                      );

                      // Update state with new summaries
                      setPlaceholderSummaries(summaries);
                    } catch (error) {
                      console.error('Error fetching channel summaries:', error);
                    }
                  };

                  fetchChannelSummaries();
                }}
              >
                Get summary of unread messages
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='min-w-[70%] max-w-3xl w-full'>
              <AlertDialogHeader>
                <AlertDialogTitle>Unread Message Summaries</AlertDialogTitle>
                <AlertDialogDescription>
                  Here are AI-generated summaries for channels with unread
                  messages:
                  <div className='mt-4'>
                    <Table className='w-full'>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Channel</TableHead>
                          <TableHead>Summary</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {placeholderSummaries.map((item, index) => (
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
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  className='cursor-pointer'
                  variant='default'
                  onClick={() => {
                    const summary = placeholderSummaries
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
        )}
      </div>
      <ScrollArea className='h-full w-full'>{children}</ScrollArea>
    </>
  );

  function getUnreadMessages(channel: Channel): string[] {
    const messages = channel.state.messages;
    const numberOfUnreadMessages =
      channel.state.read[user?.id as string].unread_messages;
    return messages
      .slice(-numberOfUnreadMessages)
      .map((message) => `${message.user?.name}: ${message.text}`);
  }
};
