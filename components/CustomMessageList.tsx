import React, { useEffect, useRef } from 'react';
import {
  useChannelStateContext,
  // Try importing StreamMessage directly
  StreamMessage,
  useChatContext, // Import useChatContext to get the current user ID
} from 'stream-chat-react';
// import type { MessageResponse } from 'stream-chat'; // Keep commented for now
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils'; // Assuming you have a utility for classnames

// Remove the inferred type definition
// type StreamMessageType = ReturnType<typeof useChannelStateContext>['messages'][number];

interface CustomMessageProps {
  // Use the imported StreamMessage type
  message: StreamMessage;
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
            ? new Date(message.created_at).toLocaleTimeString([], {
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

const CustomMessageList: React.FC = () => {
  const { messages, loading } = useChannelStateContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
