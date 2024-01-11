"use server";

import { z } from "zod";
import { fetchRedis } from "./redis";
import { Resend } from "resend";
import YelpRecentLoginEmail from "../ui/templates/sendRequestEmail";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { redirect } from "next/navigation";
import { db } from "./data";

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
          message: "Unauthorized!!",
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

    const isAlreadySent = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
    )) as 0 | 1;
    if (isAlreadySent) {
      return {
        errors: {
          message: "A friend request has already been sent to this user.",
        },
      };
    }

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

    // Valid request, send friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return {
      message: "",
    };
  } catch (error) {
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
