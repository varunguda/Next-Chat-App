"use client";

import { User } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { pusherClient } from "../lib/pushers";
import { toPusherKey } from "../lib/utils";

type Props = {
  initialUnseenRequestCount: number;
  sessionId: string;
};

const FriendRequestSidebarOptions = ({
  initialUnseenRequestCount,
  sessionId,
}: Props) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount,
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    );

    const friendRequestCountHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestCountHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      );
      pusherClient.unbind(
        "incoming_friend_requests",
        friendRequestCountHandler,
      );
    };

    //eslint-disable-next-line
  }, []);

  return (
    <Link
      href="/requests"
      className="text-gray-700 hover:text-secondaryRed hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-secondaryRed group-hover:text-secondaryRed flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-secondaryRed">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOptions;
