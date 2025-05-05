import React from 'react';
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
import { useSpeech } from '@/app/hooks/use-speech';
import { Button } from './ui/button';

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
  'flex w-full items-center bg-amber-50 space-x-3 p-2 rounded-md cursor-pointer transition-colors',
  {
    variants: {
      selected: {
        true: 'bg-accent text-accent-foreground',
        false: 'hover:bg-accent/50',
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

  const { speak } = useSpeech();

  const channelName = channel.data?.name || 'Unnamed Channel';
  const lastMessageText = latestMessage ?? 'No messages yet';

  const handleSelectChannel = () => {
    if (setActiveChannel) {
      setActiveChannel(channel);
    }
  };

  return (
    <button
      className={cn(channelPreviewVariants({ selected: active }))}
      onClick={handleSelectChannel}
      tabIndex={0}
      aria-label={`Select channel ${channelName}`}
    >
      <Avatar className='w-9 h-9 flex-shrink-0'>
        <AvatarImage src={channel.data?.image as string} alt={channelName} />
        <AvatarFallback>{getInitials(channelName)}</AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-center'>
          <p className='text-sm font-medium truncate'>{channelName}</p>
          {unread !== undefined && unread > 0 && (
            <span className='text-xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5'>
              {unread}
            </span>
          )}
        </div>
        <span className='text-xs text-muted-foreground truncate'>
          {lastMessageText}
        </span>
      </div>
      <button
        onClick={() =>
          speak('JBFqnCBsd6RMkjVDRZzb', {
            text: lastMessageText.toString() ?? 'Test',
          })
        }
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
  const user = client?.user;

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
    <section className='w-full'>
      <h2 className='px-4 py-2 text-lg font-semibold tracking-tight'>
        Channels
      </h2>
      <div className='flex items-center justify-center py-4'>
        {unreadMessagesExist && (
          <Button variant='default' className='cursor-pointer'>
            Get summary of unread messages
          </Button>
        )}
      </div>
      <ScrollArea className='block flex-1 h-full w-full'>{children}</ScrollArea>
    </section>
  );
};
