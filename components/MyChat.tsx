import {
  Chat,
  Channel,
  Thread,
  Window,
  useCreateChatClient,
} from 'stream-chat-react';
import { ChannelSort, User } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.layout.css';
import { EmojiPicker } from 'stream-chat-react/emojis';
import CustomChannelList from './CustomChannelList';
import CustomChannelHeader from './CustomChannelHeader';
import CustomMessageList from './CustomMessageList';
import CustomMessageInput from './CustomMessageInput';

export default function MyChat({
  apiKey,
  user,
  token,
}: {
  apiKey: string;
  user: User;
  token: string;
}) {
  const chatClient = useCreateChatClient({
    apiKey: apiKey,
    tokenOrProvider: token,
    userData: user,
  });

  if (!chatClient) {
    return <div>Loading Chat...</div>;
  }

  const filters = { members: { $in: [user.id] } };
  const sort: ChannelSort = { last_message_at: -1 };
  const options = { limit: 10 };

  return (
    <Chat client={chatClient}>
      <CustomChannelList filters={filters} sort={sort} options={options} />
      <Channel EmojiPicker={EmojiPicker}>
        <Window>
          <CustomChannelHeader />
          <CustomMessageList />
          <CustomMessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
