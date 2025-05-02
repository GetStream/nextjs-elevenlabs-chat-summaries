import React from 'react';
import {
  ChannelList,
  ChannelListProps,
  ChannelPreviewUIComponentProps,
} from 'stream-chat-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority'; // For styling variants (e.g., selected)
import type { ChannelListMessengerProps } from 'stream-chat-react';

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
  'flex items-center min-w-80 bg-amber-50 space-x-3 p-2 rounded-md cursor-pointer transition-colors',
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
const CustomChannelPreview: React.FC<ChannelPreviewUIComponentProps> = (
  props
) => {
  const { channel, setActiveChannel, latestMessage, unread, active } = props;

  const channelName = channel.data?.name || 'Unnamed Channel';
  const lastMessageText = latestMessage ?? 'No messages yet';

  console.log('I here');

  const handleSelectChannel = () => {
    console.log('handleSelectChannel', channel);
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
        <p className='text-xs text-muted-foreground truncate'>
          {lastMessageText}
        </p>
      </div>
    </button>
  );
};

// Main Custom Channel List component using the default logic
const CustomChannelList: React.FC<ChannelListProps> = (props) => {
  // Error state is typically handled by the ChannelList component internally
  // or by providing an EmptyStateIndicator prop.
  // We will rely on the LoadingIndicator for now.

  // Custom Loading Skeleton using Shadcn Skeleton
  const ListLoadingSkeleton = () => (
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

  // Use ScrollArea for the list container, accepting the correct props type
  // Explicitly add children to the props type
  const CustomListContainer = ({
    children,
    loading,
    loadedChannels,
    error,
  }: React.PropsWithChildren<ChannelListMessengerProps>) => {
    console.log('I here: ', children, loading, loadedChannels);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    if (loadedChannels?.length === 0) {
      return <div>No channels found</div>;
    }

    console.dir('Loaded channels: ', loadedChannels?.[0].state.read);

    return <ScrollArea className='flex-1 h-full w-full'>{children}</ScrollArea>;
  };

  return (
    <div className='w-64 border-r flex flex-col h-full'>
      <div className='p-4 border-b'>
        <h2 className='text-lg font-semibold'>Channels</h2>
      </div>
      <ChannelList
        {...props} // Pass down all original props
        List={CustomListContainer} // Use ScrollArea for the list itself
        LoadingIndicator={ListLoadingSkeleton} // Use Shadcn Skeleton
        Preview={CustomChannelPreview} // Use our custom preview component
        // Hide default pagination, handle via props.options.limit or add custom pagination if needed
        Paginator={() => null}
        sendChannelsToList
      />
    </div>
  );
};

export default CustomChannelList;
