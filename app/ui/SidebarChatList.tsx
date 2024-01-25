"use client";

import React, { use, useEffect, useState } from "react";
import { chatHrefConstructor, toPusherKey } from "../lib/utils";
import { Tooltip } from "@nextui-org/tooltip";
import { usePathname, useRouter } from "next/navigation";
import { pusherClient } from "../lib/pushers";
import toast from "react-hot-toast";

type Props = {
  friends: User[];
  userId: string;
};

export default function SidebarChatList({ friends, userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:messages`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`));

    const messagesHandler = (
      data: Message & { senderImage: string; senderName: string },
    ) => {
      const shouldNotify =
        pathname !== `/chat/${chatHrefConstructor(userId, data.senderId)}`;
      if (shouldNotify) {
        toast.success(
          `hey look, you've got a new message from ${data.senderName}`,
        );
      }
    };
    const friendsHandler = () => {
      router.refresh();
    };

    pusherClient.bind("new_message", messagesHandler);
    pusherClient.bind("new_friend", friendsHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:messages`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));

      pusherClient.unbind("new_messages", messagesHandler);
      pusherClient.unbind("new_friend", friendsHandler);
    };
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (pathname.includes("/chat/")) {
      setUnseenMessages((msgs) =>
        msgs.filter((msg) => !pathname.includes(msg.senderId)),
      );
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount: number = unseenMessages.reduce(
          (count, msg) => (count += msg.senderId === friend.id ? 1 : 0),
          0,
        );
        return (
          <li key={friend.id}>
            <Tooltip content={friend.email} closeDelay={0}>
              <a
                href={`/chat/${chatHrefConstructor(userId, friend.id)}`}
                className="text-gray-700 hover:text-secondaryRed hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                <span
                  className={
                    unseenMessagesCount > 0 ? "font-semibold" : "font-medium"
                  }
                >
                  {friend.name}
                </span>
                {unseenMessagesCount > 0 && (
                  <div className="bg-secondaryRed font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                    {unseenMessagesCount}
                  </div>
                )}
              </a>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
