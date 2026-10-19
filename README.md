# LINE OA Webchat

A web chat for a LINE Official Account. Messages that users send to the OA show up here, and you can pick a user and reply to them from the browser.

- **Webchat:** https://line-webchat-gamma.vercel.app
- **LINE OA (add friend):** https://line.me/R/ti/p/@433zkqiv

## Features

- Receive messages sent to the LINE OA (via webhook)
- See who sent each message (LINE display name and profile picture)
- Select a user and reply to them from the webchat
- New messages appear automatically (polling every 3 seconds)
- Works on desktop and mobile
- Unread message count for each user

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + Neon Postgres
- LINE Messaging API (`@line/bot-sdk`)
- Hosted on Vercel

## How it works

```
LINE user ──message──> LINE Platform ──webhook──> /api/line/webhook ──> Postgres
                                                                          │
Webchat (browser) <──────── polling /api/users, /api/users/:id/messages ──┘
       │
       └── reply ──> /api/users/:id/messages (POST) ──push API──> LINE user
```

1. A user sends a message to the OA. LINE calls `/api/line/webhook`.
2. The webhook verifies the `x-line-signature` header with the channel secret, fetches the user's profile, and saves the user and the message.
3. The webchat polls the API for the user list and the selected conversation.
4. When you reply, the server sends it with the LINE push message API, then saves it.

Replies use the push API instead of the reply token, because a reply token expires shortly after the user's message, and the person answering from the webchat may take longer than that.

## API

| Method | Path                      | Description                                                               |
| ------ | ------------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/line/webhook`       | LINE webhook endpoint                                                     |
| GET    | `/api/users`              | Users who have chatted with the OA, newest first, with their last message |
| GET    | `/api/users/:id/messages` | Conversation with a user                                                  |
| POST   | `/api/users/:id/messages` | Send a text message to a user (`{ "text": "..." }`)                       |

## Project structure

```
app/
  api/line/webhook/route.ts        LINE webhook
  api/users/route.ts               list users
  api/users/[id]/messages/route.ts get / send messages
  page.tsx                         webchat page
components/                        chat UI
lib/
  line.ts                          LINE client + signature check
  prisma.ts                        Prisma client
prisma/schema.prisma               LineUser, Message
```

## Running locally

Requirements: Node.js 20+, a Neon (or any Postgres) database, and a LINE Messaging API channel.

```bash
git clone https://github.com/bazlance/line-webchat.git
cd line-webchat
npm install
cp .env.example .env   # fill in the values
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000.

To receive webhooks locally, expose port 3000 with a tunnel (e.g. ngrok) and set the webhook URL in the LINE Developers Console to `https://<tunnel>/api/line/webhook`.

## LINE setup

1. Create a LINE Official Account and enable the Messaging API (LINE Official Account Manager > Settings > Messaging API).
2. Copy the **Channel secret** and issue a **Channel access token** in the LINE Developers Console.
3. Set the webhook URL to `https://line-webchat-gamma.vercel.app/api/line/webhook` and turn on **Use webhook**.
4. In Response settings, turn off auto-response and greeting messages.

## Deploying to Vercel

1. Import the repository into Vercel.
2. Add a Neon database from the Storage tab (this sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`).
3. Add `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` in Environment Variables.
4. Run `npx prisma migrate deploy` against the database, then deploy.

## Limitations

- Updates use polling rather than websockets. This is simple and works well on serverless; for real-time updates it could be replaced with something like Pusher or Ably.
- Non-text messages (stickers, images, etc.) are shown as placeholders like `[sticker]`.
- The webchat has no login, so anyone with the URL can read and reply. A real deployment would put it behind authentication.
- Push messages count toward the LINE OA monthly message quota.
