import { messagingApi, validateSignature } from "@line/bot-sdk";

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";

export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
});

export function verifySignature(body: string, signature: string) {
  if (!channelSecret || !signature) return false;
  return validateSignature(body, channelSecret, signature);
}
