import { getFriendRequestsByUserId, getUserById } from "@/app/lib/actions";
import FriendRequests from "@/app/ui/FriendRequests";
import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

export default async function page({}: Props) {
  const session = await getServerSession(authConfig);
  if (!session) {
    redirect("/login");
  }
  const friendRequestsIds = await getFriendRequestsByUserId(session.user.id!);
  const incomingFriendRequests = await Promise.all(
    friendRequestsIds.map(async (id): Promise<IncomingFriendRequests> => {
      const sender = await getUserById(id);
      const senderParsed = JSON.parse(sender) as User;

      return {
        senderId: senderParsed.id,
        senderName: senderParsed.name,
        senderImage: senderParsed.image,
        senderEmail: senderParsed.email,
      };
    }),
  );
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <FriendRequests incomingFriendRequests={incomingFriendRequests} />
      <div className="flex flex-col gap-4"></div>
    </main>
  );
}
