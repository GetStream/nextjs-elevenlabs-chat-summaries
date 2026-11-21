import React, { useEffect, useRef } from 'react';
import {
  nsToDate,
  type LocalMessage,
  type MessagePaginatorState,
} from 'stream-chat';
import { useChannel, useChatContext, useStateStore } from 'stream-chat-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils'; // Assuming you have a utility for classnames

interface CustomMessageProps {
  message: LocalMessage;
}

// Function to get initials from name (can be moved to utils)
const getInitials = (name: string = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

// Updated CustomMessage component with Shadcn Avatar and sender styling
const CustomMessage: React.FC<CustomMessageProps> = ({ message }) => {
  const { user } = message;
  const { client } = useChatContext(); // Get client to check user ID
  const isCurrentUser = user?.id === client.userID;

  const userName = user?.name || user?.id || 'Unknown User';

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-3',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isCurrentUser && (
        <Avatar className='w-8 h-8 flex-shrink-0'>
          <AvatarImage src={user?.image as string} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'flex-grow-0 max-w-[75%] rounded-lg px-3 py-2',
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {!isCurrentUser && (
          <p className='text-xs font-semibold mb-1'>{userName}</p>
        )}
        <p className='text-sm'>{message.text}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isCurrentUser
              ? 'text-primary-foreground/80'
              : 'text-muted-foreground'
          )}
        >
          {message.created_at
            ? nsToDate(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Sending...'}
        </p>
      </div>
      {isCurrentUser && (
        // Placeholder for current user avatar if desired on the right
        <Avatar className='w-8 h-8 flex-shrink-0'>
          <AvatarImage src={user?.image as string} alt={userName} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// The channel's messages live in its message paginator (stream-chat).
// Defined at module scope so the selector stays referentially stable.
const messagePaginatorSelector = (state: MessagePaginatorState) => ({
  messages: state.items,
  loading: state.isLoading,
});

const CustomMessageList: React.FC = () => {
  const channel = useChannel();
  const { messages, loading } = useStateStore(
    channel.messagePaginator.state,
    messagePaginatorSelector
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mark the channel read while it is open and the tab is visible: when it is
  // opened, when a new message arrives and when the tab becomes visible again.
  // While the tab is visible the channel counts as "viewing live", so the LLC
  // does not bump the own unread count on message.new (no badge/button flash).
  useEffect(() => {
    const client = channel.getClient();
    const markReadIfVisible = () => {
      const visible = document.visibilityState === 'visible';
      channel.messagePaginator.setViewingLive(visible);
      if (!visible) return;
      const userId = client.userId;
      const latest = channel.messagePaginator.latestMessage;
      if (!userId || !latest || latest.user?.id === userId) return;
      if (channel.state.read[userId]?.last_read_message_id === latest.id) return;
      client.messageDeliveryReporter.throttledMarkRead(channel);
    };

    markReadIfVisible();
    const subscription = channel.on('message.new', markReadIfVisible);
    document.addEventListener('visibilitychange', markReadIfVisible);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', markReadIfVisible);
      channel.messagePaginator.setViewingLive(false);
    };
  }, [channel]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  // TODO:
  // - Add date separators
  // - Handle virtualized rendering for long lists if needed

  if (loading && !messages?.length) {
    // Show skeleton loading only on initial load
    return (
      <div className='flex-1 p-4 space-y-4'>
        <Skeleton className='h-16 w-3/4' />
        <Skeleton className='h-12 w-1/2 ml-auto' />
        <Skeleton className='h-16 w-3/4' />
      </div>
    );
  }

  return (
    <ScrollArea className='my-message-list flex-1' ref={scrollAreaRef}>
      <div className='p-4 space-y-2'>
        {messages?.map((msg) => (
          <CustomMessage key={msg.id} message={msg} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default CustomMessageList;
