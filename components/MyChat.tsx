import { useEffect, useMemo, useState } from 'react';
import {
  ChannelPaginator,
  type Channel as StreamChannel,
  type ClientUser,
  type SortParamRequest,
} from 'stream-chat';
import {
  Channel,
  ChannelList,
  ChannelPlaceholder,
  Chat,
  defaultWorkspaceNavigation,
  useCreateChatClient,
  WithComponents,
  WorkspaceNavigationProvider,
  type WorkspaceNavigation,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import {
  CustomChannelPreview,
  CustomListContainer,
  ListLoadingSkeleton,
} from './CustomChannelList';
import CustomChannelHeader from './CustomChannelHeader';
import CustomMessageList from './CustomMessageList';
import CustomMessageInput from './CustomMessageInput';

const sort: SortParamRequest[] = [{ field: 'last_message_at', direction: -1 }];

export default function MyChat({
  apiKey,
  user,
  token,
}: {
  apiKey: string;
  user: ClientUser;
  token: string;
}) {
  const chatClient = useCreateChatClient({
    apiKey: apiKey,
    tokenOrProvider: token,
    userData: user,
  });

  // The channel list is driven by a ChannelPaginator. Registering it with the
  // channel manager keeps it up to date with WebSocket events.
  const paginator = useMemo(() => {
    if (!chatClient) return undefined;
    return new ChannelPaginator({
      client: chatClient,
      filters: { members: { $in: [user.id] } },
      sort,
      id: 'channels:default',
      paginatorOptions: { pageSize: 10 },
    });
  }, [chatClient, user.id]);

  useEffect(() => {
    if (!chatClient || !paginator) return;
    chatClient.channelManager.insertPaginator({ paginator });
    return () => {
      chatClient.channelManager.removePaginator(paginator);
    };
  }, [chatClient, paginator]);

  // No channel is open until the user selects one in the list.
  const [activeChannel, setActiveChannel] = useState<StreamChannel>();
  const navigation = useMemo<WorkspaceNavigation>(
    () => ({
      ...defaultWorkspaceNavigation,
      isChannelActive: (cid) => !!cid && cid === activeChannel?.cid,
      openChannel: (channel) => setActiveChannel(channel),
      openChannels: activeChannel ? [activeChannel] : [],
    }),
    [activeChannel]
  );

  if (!chatClient || !paginator) {
    return <div>Loading Chat...</div>;
  }

  return (
    <Chat client={chatClient}>
      <WorkspaceNavigationProvider value={navigation}>
        <WithComponents
          overrides={{
            ChannelListItemUI: CustomChannelPreview, // Use our custom preview component
            FirstPageLoadingIndicator: ListLoadingSkeleton, // Use Shadcn Skeleton
            EmptyListIndicator: () => (
              <div className='p-4'>No channels found</div>
            ),
          }}
        >
          <aside className='my-channel-list'>
            <CustomListContainer paginator={paginator}>
              <ChannelList paginator={paginator} />
            </CustomListContainer>
          </aside>
        </WithComponents>
        {activeChannel ? (
          <Channel channel={activeChannel}>
            <CustomChannelHeader />
            <CustomMessageList />
            <CustomMessageInput />
          </Channel>
        ) : (
          <ChannelPlaceholder>
            <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
              Select a channel to start chatting
            </div>
          </ChannelPlaceholder>
        )}
      </WorkspaceNavigationProvider>
    </Chat>
  );
}
