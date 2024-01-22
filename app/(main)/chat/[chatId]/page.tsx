import { getChatMessages, getUserById } from "@/app/lib/actions";
import ChatInput from "@/app/ui/ChatInput";
import Messages from "@/app/ui/Messages";
import { authConfig } from "@/auth.config";
import { getServerSession } from "next-auth";
import Image from "next/image";
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
  const chatPartner = JSON.parse(chatPartnerRaw) as User;

  const initialMessages = await getChatMessages(params.chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative w-8 sm:w-12 h-8 sm:h-12">
            <Image
              fill
              referrerPolicy="no-referrer"
              src={chatPartner.image || "/Default_pfp.png"}
              alt={`${chatPartner.name} profile picture`}
              className="rounded-full"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages
        sessionId={session.user.id}
        sessionImage={session.user.image}
        initialMessages={initialMessages}
        chatId={params.chatId}
        chatPartner={chatPartner}
      />
      <ChatInput chatId={params.chatId} />
    </div>
  );
}
