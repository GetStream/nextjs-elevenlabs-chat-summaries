'use client';

import React from 'react';
import { useChannelStateContext } from 'stream-chat-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react'; // Example icon

const CustomChannelHeader: React.FC = () => {
  const { channel } = useChannelStateContext();
  // const { client } = useChatContext(); // Keep client if needed for other actions

  // Placeholder: log the client to satisfy linter for now
  // console.log('Chat client available in header:', client);

  // Function to get initials from name
  const getInitials = (name: string = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  if (!channel) {
    return (
      // Use Shadcn Skeleton later if desired
      <div className='flex items-center justify-between p-3 border-b'>
        <div className='h-6 bg-gray-200 rounded w-1/4'></div>
        <div className='h-8 w-8 bg-gray-200 rounded'></div>
      </div>
    );
  }

  const channelName = channel.data?.name || 'Unnamed Channel';
  const memberCount = channel.data?.member_count;

  return (
    <div className='flex items-center justify-between p-3 border-b'>
      <div className='flex items-center space-x-3'>
        <Avatar className='w-9 h-9'>
          <AvatarImage src={channel.data?.image as string} alt={channelName} />
          <AvatarFallback>{getInitials(channelName)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <span className='font-semibold text-sm'>{channelName}</span>
          {memberCount !== undefined && (
            <span className='text-xs text-muted-foreground'>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
      </div>
      {/* Replace with actual info button/dropdown functionality */}
      <Button variant='ghost' size='icon'>
        <Info className='h-4 w-4' />
        <span className='sr-only'>Channel Information</span>
      </Button>
    </div>
  );
};

export default CustomChannelHeader;
