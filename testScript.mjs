import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  'mx97ehberwtb',
  'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns'
);

const channelObjects = [
  {
    id: 'general',
    type: 'messaging',
    name: 'General',
    image: 'https://getstream.io/random_png/?id=general',
    members: [
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
      '4h4Bzl0qQ2A7TWIA1iPL6',
      'QOsOH7ENQE5HNLEsDvoaY',
    ],
    created_by_id:
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
  },
  {
    id: 'random',
    type: 'messaging',
    name: 'Random',
    image: 'https://getstream.io/random_png/?id=random',
    members: [
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
      '4h4Bzl0qQ2A7TWIA1iPL6',
    ],
    created_by_id:
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
  },
  {
    id: 'announcements',
    type: 'messaging',
    name: 'Announcements',
    image: 'https://getstream.io/random_png/?id=announcements',
    members: [
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
      'QOsOH7ENQE5HNLEsDvoaY',
      'iLOBT0vUoyDC1m4RbHwK2',
      'umEn9Yc6ziCucGnJBix0T',
    ],
    created_by_id:
      'uypg6c2hmxu93shhbdnk8ezy2d343qp4zc5jzmcu9eajmgazdcb7m7a2e4tgprns',
  },
];

async function createChannels() {
  for (const channel of channelObjects) {
    const channelToCreate = serverClient.channel(channel.type, channel.id, {
      name: channel.name,
      image: channel.image,
      members: channel.members,
      created_by_id: channel.created_by_id,
    });
    const channelCreationResult = await channelToCreate.create();
    console.log(channelCreationResult);
  }
}

async function deleteChannels() {
  // Deleting channels
  const response = await serverClient.deleteChannels(
    channelObjects.map((c) => c.id),
    { hard_delete: true }
  );
  console.log(response);
}

await createChannels();

// deleteChannels();
