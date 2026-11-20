import React, { useEffect, useReducer } from 'react';
import type { Channel, ChannelPaginator } from 'stream-chat';
import {
  useChannelPaginatorState,
  useChatContext,
  useWorkspaceNavigation,
  type ChannelListItemUIProps,
} from 'stream-chat-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority'; // For styling variants (e.g., selected)

// We use the SDK's ChannelList for its logic (pagination, live updates)
// and provide custom UI components to it.

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
export const CustomChannelPreview = (props: ChannelListItemUIProps) => {
  const { channel, previewedMessage, unread, active } = props;
  const { openChannel } = useWorkspaceNavigation();

  const channelName = channel.data?.custom?.name || 'Unnamed Channel';
  const lastMessageText = previewedMessage?.text || 'No messages yet';

  const handleSelectChannel = (event: React.MouseEvent) => {
    openChannel(channel, { event });
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
      role='option'
      aria-selected={active || undefined}
      aria-label={`Select channel ${channelName}`}
    >
      <Avatar className='w-9 h-9 flex-shrink-0'>
        <AvatarImage src={channel.data?.custom?.image} alt={channelName} />
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
        <span className='latestMessageText'>
          <p>{lastMessageText}</p>
        </span>
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

// Re-renders the caller when the current user's unread count changes in one of
// the channels. The paginator's items only change when the list itself does.
const useUnreadCountUpdates = (
  channels: Channel[] | undefined,
  userId: string | undefined
) => {
  const [, forceUpdate] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    if (!channels || !userId) return;
    const unsubscribes = channels.map((channel) =>
      channel.state.subscribeWithSelector(
        ({ read }) => ({ unread: read[userId]?.unread_messages ?? 0 }),
        forceUpdate
      )
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [channels, userId]);
};

export const CustomListContainer = ({
  children,
  paginator,
}: React.PropsWithChildren<{ paginator: ChannelPaginator }>) => {
  const { client } = useChatContext();
  const user = client?.user;

  // The channels loaded by the channel list so far.
  const { channels: loadedChannels } = useChannelPaginatorState(paginator);
  // Keeps unread checks on loadedChannels up to date.
  useUnreadCountUpdates(loadedChannels, user?.id);

  return (
    <>
      <h2 className='px-4 py-2 text-lg font-semibold tracking-tight w-full'>
        Channels
      </h2>
      <div className='flex min-h-0 w-full flex-1 flex-col'>{children}</div>
    </>
  );
};
