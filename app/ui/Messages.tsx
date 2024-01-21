"use client";

import clsx from "clsx";
import React, { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";

type Props = {
  initialMessages: Message[];
  sessionId: string;
  chatPartner: User;
  sessionImage: string | null | undefined;
};

export default function Messages({
  initialMessages,
  sessionId,
  chatPartner,
  sessionImage,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const hasNextMessageFromSameUser = messages[index - 1]
          ? messages[index - 1].senderId === messages[index].senderId
          : false;

        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            <div
              className={clsx("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={clsx(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  },
                )}
              >
                <span
                  className={clsx("px-4 py-2 rounded-lg inline-block", {
                    "bg-darkRed text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {format(message.timestamp, "HH:mm")}
                  </span>
                </span>
              </div>

              <div
                className={clsx("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    (isCurrentUser ? sessionImage : chatPartner.image) ||
                    "/Default_pfp.png"
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
