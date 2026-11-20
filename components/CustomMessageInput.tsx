import React, { useState } from 'react';
import { useMessageComposerController } from 'stream-chat-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const CustomMessageInput: React.FC = () => {
  // The channel's MessageComposer (stream-chat) composes and sends the message.
  const messageComposer = useMessageComposerController();
  const [text, setText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    messageComposer.textComposer.setText(text);
    // send() shows the message optimistically and never rejects; a failed
    // message stays in the list marked as failed.
    messageComposer
      .send()
      .then((result) => {
        if (result !== 'nothing-to-send') setText(''); // Clear input once sent
      })
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
