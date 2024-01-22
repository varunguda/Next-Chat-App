"use client";

import { Check, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { acceptFriendAction, rejectFriendAction } from "../lib/nextSafeActions";
import { useRouter } from "next/navigation";
import { pusherClient } from "../lib/pushers";
import { toPusherKey } from "../lib/utils";

type Props = {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
};

export default function FriendRequests({
  incomingFriendRequests,
  sessionId,
}: Props) {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests,
  );

  const { execute: acceptFriend } = useAction(acceptFriendAction);
  const { execute: rejectFriend } = useAction(rejectFriendAction);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    );
    const friendRequestHandler = (data: IncomingFriendRequest) => {
      const newFriendRequests = friendRequests.concat([data]);
      setFriendRequests(newFriendRequests);
    };
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, []);

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <div className="relative h-8 w-8 bg-gray-50">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                src={request.senderImage || "/Default_pfp.svg"}
                alt={request.senderEmail}
              />
            </div>

            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend({ id: request.senderId })}
              aria-label="accept friend"
              type="submit"
              className="w-8 h-8 bg-secondaryRed hover:bg-primaryRed grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => rejectFriend({ id: request.senderId })}
              type="submit"
              aria-label="deny friend"
              className="w-8 h-8 bg-gray-500 hover:bg-gray-600 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
}
