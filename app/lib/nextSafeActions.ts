"use server";

import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { fetchRedis } from "./redis";
import { db } from "./data";
import { nanoid } from "nanoid";
import { messageValidator } from "./validators/message";
import { redirect } from "next/navigation";
import { pusherServer } from "./pushers";
import { toPusherKey } from "./utils";
import { revalidatePath } from "next/cache";

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

      pusherServer.trigger(
        toPusherKey(`chat:${chatId}:messages`),
        toPusherKey(`${chatId}:messages`),
        message,
      );

      db.zadd(`chat:${chatId}:messages`, {
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

const FriendRequestSchema = z.object({
  id: z.string(),
});

export const acceptFriendAction = action(
  FriendRequestSchema,
  async ({ id }): Promise<NextSafeActionState> => {
    try {
      const session = await getServerSession(authConfig);
      if (!session || !session.user) {
        redirect("/login");
      }

      await Promise.all([
        db.srem(`user:${session.user.id}:incoming_friend_requests`, id),
        db.sadd(`user:${session.user.id}:friends`, id),
        db.sadd(`user:${id}:friends`, session.user.id),
      ]);

      revalidatePath("/requests");
      return {
        message: "Successfully added a new friend",
      };
    } catch (error) {
      throw new Error("Failed to accept friend request!");
    }
  },
);

export const rejectFriendAction = action(
  FriendRequestSchema,
  async ({ id }): Promise<NextSafeActionState> => {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        redirect("/login");
      }

      await db.srem(`user:${session.user.id}:incoming_friend_requests`, id);

      revalidatePath("/requests");
      return {
        message: "Successfully rejected friend request",
      };
    } catch (error) {
      throw new Error("Failed to reject friend request!");
    }
  },
);
