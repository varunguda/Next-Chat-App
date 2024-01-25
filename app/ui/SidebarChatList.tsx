"use client";

import React, { useEffect, useState } from "react";
import { chatHrefConstructor } from "../lib/utils";
import { Tooltip } from "@nextui-org/tooltip";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  friends: User[];
  userID: string;
};

export default function SidebarChatList({ friends, userID }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

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
                href={`/chat/${chatHrefConstructor(userID, friend.id)}`}
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
