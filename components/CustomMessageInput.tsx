import React, { useState } from 'react';
import { useChannelActionContext } from 'stream-chat-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const CustomMessageInput: React.FC = () => {
  const { sendMessage } = useChannelActionContext();
  const [text, setText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage({
      text: text,
      // Add other potential fields like attachments, mentioned_users etc. if needed
    })
      .then(() => setText('')) // Clear input on success
      .catch((err) => console.error('Error sending message:', err));
  };

  // TODO:
  // - Add icons/buttons for attachments, emojis (requires more setup)
  // - Handle typing indicators
  // - Consider using Textarea for multi-line input

  return (
    <form
      onSubmit={handleSendMessage}
      className='p-3 border-t flex items-center space-x-2' // Removed dark mode specifics, relying on Shadcn/Tailwind theme
    >
      <Input
        type='text'
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setText(e.target.value)
        }
        placeholder='Type a message...'
        className='flex-1'
        autoComplete='off'
        aria-label='Message input'
      />
      <Button
        type='submit'
        size='icon'
        disabled={!text.trim()}
        aria-label='Send message'
      >
        <Send className='h-4 w-4' />
      </Button>
    </form>
  );
};

export default CustomMessageInput;
