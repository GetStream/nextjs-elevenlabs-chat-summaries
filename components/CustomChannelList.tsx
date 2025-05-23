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

import UnreadMessageSummaries from './UnreadMessageSummaries';

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

  const unreadMessagesExist =
    loadedChannels?.some(
      (loadedChannel) =>
        loadedChannel.state.read[user?.id as string]?.unread_messages > 0
    ) ?? false;

  return (
    <>
      <h2 className='px-4 py-2 text-lg font-semibold tracking-tight w-full'>
        Channels
      </h2>
      {unreadMessagesExist && loadedChannels && (
        <UnreadMessageSummaries loadedChannels={loadedChannels} user={user} />
      )}
      <ScrollArea className='h-full w-full'>{children}</ScrollArea>
    </>
  );
};
