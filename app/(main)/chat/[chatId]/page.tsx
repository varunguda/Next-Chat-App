import { getChatMessages, getUserById } from "@/app/lib/actions";
import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

export default async function page({ params }: Props) {
  const session = await getServerSession(authConfig);
  if (!session) notFound();

  const [userId1, userId2] = params.chatId.split("--");
  const chatPartnerId = session.user.id === userId1 ? userId2 : userId1;
  const chatPartnerRaw = await getUserById(chatPartnerId);
  const chatPartner = JSON.parse(chatPartnerRaw);

  const initialMessages = await getChatMessages(params.chatId);

  return <div>{params.chatId}</div>;
}
