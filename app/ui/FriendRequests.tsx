"use client";

import { Check, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import React from "react";
import { acceptFriendAction } from "../lib/nextSafeActions";

type Props = {
  incomingFriendRequests: IncomingFriendRequests[];
};

export default function FriendRequests({ incomingFriendRequests }: Props) {
  const { execute: acceptFriend } = useAction(acceptFriendAction);
  const { execute: rejectFriend } = useAction(acceptFriendAction);

  return (
    <>
      {incomingFriendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        incomingFriendRequests.map((request) => (
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
