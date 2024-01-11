"use server";

import { z } from "zod";
import { fetchRedis } from "./redis";
import { Resend } from "resend";
import YelpRecentLoginEmail from "../ui/templates/sendRequestEmail";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

const AddFriendFormSchema = z.object({
  email: z
    .string({ invalid_type_error: "Please enter an email address" })
    .email("Please enter a valid email address"),
});

export type State = {
  errors?: {
    email?: string[];
  };
  message?: string | null;
};

export async function addFriend(prevState: State, formData: FormData) {
  const validateFields = AddFriendFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!validateFields.success) {
    return {
      // errors: validateFields.error.flatten().fieldErrors,
      message: "",
    };
  }

  const { email: emailToAdd } = AddFriendFormSchema.parse(
    Object.fromEntries(formData.entries()),
  );
  const idToAdd = (await fetchRedis(
    "get",
    `user:email:${emailToAdd}`,
  )) as string;

  const session = await getServerSession(authConfig);

  if (!idToAdd) {
    const resend = new Resend(process.env.RESEND_KEY);
    resend.emails.send({
      from: "onboarding@resend.dev",
      to: emailToAdd,
      subject: "A New Request!!",
      react: YelpRecentLoginEmail({ userMail: session?.user.email! }),
    });
    return {
      message: "Request Sent Successfully!",
    };
  }

  return {
    message: "",
  };
}
