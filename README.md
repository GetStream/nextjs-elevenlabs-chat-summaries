![ai_chat_summaries](https://github.com/user-attachments/assets/16e88520-ddc2-4d71-a632-63be2b444d6a)

# AI-Generated Chat Summaries with Next.js and ElevenLabs

This repository demonstrates how to build a [Next.js](https://nextjs.org/) chat application with modern architecture using Stream's [React Chat SDK](https://getstream.io/chat/sdk/react/).
We're using [shadcn](https://ui.shadcn.com) to build a beautiful UI and use a locally running LLM (in our case with [LMStudio](https://lmstudio.ai)) to summarize unread chat messages.

Finally, we're allowing the user to read out the message summaries using [ElevenLabs](https://elevenlabs.io).

Find the video version of how to build the project here:

- Part 1: [AI-Generated Chat Summaries](https://youtu.be/MvbkRiW2qu4)
- Part 2: Read Out Voice Summaries using ElevenLabs [coming soon]

## Features

- Beautiful UI using `shadcn`
- Modern React application powered by Next.js
- Uses Server Actions to execute server side code
- Chat integration with Stream Chat React
- Locally generated unread messages summaries powered by LMStudio
- Voice summaries generated from ElevenLabs

## Running locally

Follow these steps to get the project up and running for you.

## Step 1: Setup access to a Stream backend

Head to the [Stream Dashboard](https://dashboard.getstream.io/) and create an account. Create a new project to build up your application (all handled and managed by Stream).

This is necessary because you need two properties from this.

1. Your API key
2. Your Secret

See the red rectangle in the screenshot below on where you can retrieve this information from the Dashboard.

<img width="1511" alt="stream-apikey-and-secret" src="https://github.com/GetStream/nextjs-chat-template/assets/12433593/40201ab8-4c55-426d-94bc-e89649849ffc">

Create a `.env.local` file at the project's root and add the API key and the secret. A template file (`.env.template`) is available to view. Ensure you follow the correct naming conventions.

Inside `app/page.tsx`, you must update the values of `userId` and `userName` to be actual values instead of `undefined`.

If you forget to do this, your app will show an error, displaying what you have missed.

## Step 2: Run a LLM locally

For this project, we're using [LM Studio](https://lmstudio.ai/), but you can also use [other tools](https://getstream.io/blog/best-local-llm-tools/).

Make sure you have a local server running a model. We have used `Gemma 3 1B Instruct` and exposed it on port `1234`.

## Step 3: Run the project

First, install all the dependencies for the project:

```bash
npm install
# or
yarn
```

You're ready to run the app with the command:

```bash
npm run dev
# or
yarn dev
```

## Find more resources to enhance and further customize the Stream SDK

- [React Docs](https://getstream.io/chat/docs/sdk/react/)
- [Basic Theming](https://getstream.io/chat/docs/sdk/react/theming/themingv2/)
- [Customization of components](https://getstream.io/chat/docs/sdk/react/guides/customization/)
- Stream also has an [Audio & Video SDK](https://getstream.io/video/docs/) that blends in nicely with the Chat SDK.
