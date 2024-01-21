"use server";

import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { fetchRedis } from "./redis";
import { db } from "./data";
import { nanoid } from "nanoid";
import { messageValidator } from "./validators/message";

const action = createSafeActionClient();

export type NextSafeActionState = {
  error?: string;
  message?: string;
};

const SendMessageFormSchema = z.object({
  text: z.string(),
  chatId: z.string(),
});

export const sendMessageAction = action(
  SendMessageFormSchema,
  async ({ text, chatId }): Promise<NextSafeActionState> => {
    try {
      if (!text || !chatId)
        return {
          error: "Invalid data fields!",
        };

      const session = await getServerSession(authConfig);
      if (!session?.user)
        return {
          error: "Unauthorized!",
        };

      const [userId1, userId2] = chatId.split("--");
      if (!userId1 || !userId2)
        return {
          error: "Invalid ChatId, please refresh the page and try again!",
        };

      if (session.user.id !== userId2 && session.user.id !== userId1)
        return {
          error: "Unauthorized!",
        };

      const chatPartnerId = session.user.id === userId1 ? userId2 : userId1;
      const friendsList = (await fetchRedis(
        "smembers",
        `user:${session.user.id}:friends`,
      )) as string[];
      if (!friendsList.includes(chatPartnerId)) {
        return {
          error:
            "The person you are trying to message isn't available in your friend list.",
        };
      }

      const senderRaw = (await fetchRedis(
        "get",
        `user:${session.user.id}`,
      )) as string;
      const sender = JSON.parse(senderRaw) as User;

      const timestamp = Date.now();
      const messageData: Message = {
        id: nanoid(),
        text,
        timestamp,
        senderId: session.user.id,
      };
      const message = messageValidator.parse(messageData);

      await db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: JSON.stringify(message),
      });

      return {
        message: "Sent!!",
      };
    } catch (error) {
      console.log(error);
      throw new Error("Internal Server Error!");
    }
  },
);
