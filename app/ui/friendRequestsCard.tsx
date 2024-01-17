"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FriendRequestState, acceptFriend, rejectFriend } from "../lib/actions";
import { useFormState } from "react-dom";

type Props = {
  request: IncomingFriendRequests;
};

export default function FriendRequestsCard({ request }: Props) {
  const [acceptState, acceptDispatch] = useFormState(
    acceptFriend,
    {} as FriendRequestState,
  );
  const [rejectState, rejectDispatch] = useFormState(rejectFriend, {
    message: "a",
  });

  return (
    <>
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
        <form action={acceptDispatch}>
          <input name="id" value={request.senderId} hidden />
          <button
            aria-label="accept friend"
            type="submit"
            className="w-8 h-8 bg-secondaryRed hover:bg-primaryRed grid place-items-center rounded-full transition hover:shadow-md"
          >
            <Check className="font-semibold text-white w-3/4 h-3/4" />
          </button>
        </form>

        <form action={rejectDispatch}>
          <input name="id" value={request.senderId} hidden />
          <button
            type="submit"
            aria-label="deny friend"
            className="w-8 h-8 bg-gray-500 hover:bg-gray-600 grid place-items-center rounded-full transition hover:shadow-md"
          >
            <X className="font-semibold text-white w-3/4 h-3/4" />
          </button>
        </form>
      </div>
    </>
  );
}
