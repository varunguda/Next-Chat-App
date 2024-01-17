"use server";

import { z } from "zod";
import { fetchRedis } from "./redis";
import { Resend } from "resend";
import YelpRecentLoginEmail from "../ui/templates/sendRequestEmail";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { db } from "./data";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { messageArrayValidator } from "./validators/message";

const AddFriendFormSchema = z.object({
  email: z
    .string({ invalid_type_error: "Please enter an email address" })
    .email("Please enter a valid email address"),
});

export type State = {
  errors?: {
    email?: string[];
    message?: string;
  };
  message?: string | null;
};

export async function addFriend(prevState: State, formData: FormData) {
  const validateFields = AddFriendFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { email: emailToAdd } = AddFriendFormSchema.parse(
      Object.fromEntries(formData.entries()),
    );
    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`,
    )) as string;

    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return {
        errors: {
          mesage: "Unauthorized!!",
        },
      };
    }
    if (session.user.id === idToAdd) {
      return {
        errors: {
          message: "You cannot send a friend request to yourself.",
        },
      };
    }

    // If the email the user is trying to send a friend request doesnt have an account, a mail will be sent to that email adderess
    if (!idToAdd) {
      const resend = new Resend(process.env.RESEND_KEY);
      resend.emails.send({
        from: process.env.RESEND_DOMAIN
          ? process.env.RESEND_DOMAIN
          : "onboarding@resend.dev",
        to: emailToAdd,
        subject: "A New Request!!",
        react: YelpRecentLoginEmail({ userMail: session?.user.email! }),
      });
      return {
        message: "A friend request has been sent successfully!",
      };
    }

    // Checks if the user has already sent a friend request, if yes, an error message is returned
    const isAlreadySent = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id,
    )) as 0 | 1;
    if (isAlreadySent) {
      return {
        errors: {
          message: "A friend request has already been sent to this user.",
        },
      };
    }

    // Checks if the person whom the user is trying to send a request is in his friends list, if yes, returns an error message.
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd,
    )) as 0 | 1;
    if (isAlreadyFriends) {
      return {
        errors: {
          message: "This account is already added to your friends list!",
        },
      };
    }

    // Checks if the person has sent the user a friend request prior to user trying to send him a request, if yes, they become friends immediately!
    const isInYourRequests = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd,
    )) as 0 | 1;
    if (isInYourRequests) {
      await db.sadd(`user:${session.user.id}:friends`, idToAdd);
      return {
        message: `You are now friends with ${emailToAdd}`,
      };
    }

    // Valid request, send friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return {
      message: "A friend request has been sent successfully!",
    };
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return {
        errors: {
          message: "Invalid request payload",
        },
      };
    }
    return {
      errors: {
        message: "Something went wrong, please try again!",
      },
    };
  }
}

export async function getUnseenFriendRequestsCount(
  id: string,
): Promise<number> {
  try {
    const unseenFriendRequests = (
      (await fetchRedis(
        "smembers",
        `user:${id}:incoming_friend_requests`,
      )) as User[]
    ).length;
    return unseenFriendRequests;
  } catch (error) {
    throw new Error("Failed to fetch unseen friend requests!");
  }
}

export async function getFriendRequestsByUserId(id: string): Promise<string[]> {
  try {
    const data = (await fetchRedis(
      "smembers",
      `user:${id}:incoming_friend_requests`,
    )) as string[];
    return data;
  } catch (error) {
    throw new Error("Failed to fetch friend requests!");
  }
}

export async function getUserById(id: string): Promise<string> {
  try {
    return await fetchRedis("get", `user:${id}`);
  } catch (error) {
    throw new Error("Failed to fetch user!");
  }
}

const FriendRequestSchema = z.object({
  id: z.string(),
});

export type FriendRequestState = {
  message?: string;
};

export async function acceptFriend(
  prevState: FriendRequestState,
  formData: FormData,
): Promise<FriendRequestState> {
  const validateFields = FriendRequestSchema.safeParse({
    id: formData.get("id"),
  });
  if (!validateFields.success) {
    throw new Error("Missing fields: ID");
  }

  try {
    const { id } = FriendRequestSchema.parse(
      Object.fromEntries(formData.entries()),
    );

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
}

export async function rejectFriend(
  prevState: FriendRequestState,
  formData: FormData,
): Promise<FriendRequestState> {
  const validateFields = FriendRequestSchema.safeParse({
    id: formData.get("id"),
  });
  if (!validateFields.success) {
    throw new Error("Missing fields: ID");
  }

  try {
    const { id } = FriendRequestSchema.parse(
      Object.fromEntries(formData.entries()),
    );

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
}

export async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1,
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const orderedDBMessages = dbMessages.reverse();
    const messages = messageArrayValidator.parse(orderedDBMessages);

    return messages;
  } catch (error) {
    throw new Error("Failed to fetch chat messages!");
  }
}

export async function getFriendsOfAUserByID(id: string) {
  try {
    const friendsIDs = (await fetchRedis(
      "smembers",
      `user:${id}:friends`,
    )) as string[];
    const friendsRaw = (await Promise.all(
      friendsIDs.map((friendsID) => fetchRedis("get", `user:${friendsID}`)),
    )) as string[];
    return friendsRaw.map((friend) => JSON.parse(friend)) as User[];
  } catch (error) {
    console.log("Error fetching user's friends", error);
    throw new Error("Unable to fetch user's friends!");
  }
}
