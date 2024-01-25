"use client";

import React, { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Icons } from "./Icons";
import Button from "./Button";
import { useAction } from "next-safe-action/hooks";
import { sendMessageAction } from "../lib/nextSafeActions";
import toast from "react-hot-toast";

type Props = {
  chatId: string;
};

export default function ChatInput({ chatId }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const { execute: send, result, status } = useAction(sendMessageAction);
  const sendMessage = () => {
    if (input.trim() !== "") {
      send({ text: input, chatId });
      setInput("");
      textareaRef.current?.focus();
    } else {
      textareaRef.current?.blur();
    }
  };

  useEffect(() => {
    if (!!result.data?.error || !!result.serverError) {
      toast.error(result.data?.error! || result.serverError!);
    }
  }, [result.data?.error, result.serverError]);

  return (
    <div className="border-t flex gap-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-secondaryRed">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
          maxRows={10}
        />
      </div>

      <Button
        variant="ghost"
        onClick={sendMessage}
        isLoading={status === "executing"}
      >
        <Icons.SendHorizonal
          className="text-gray-900 size-5 sm:size-6"
          strokeWidth={1}
        />
      </Button>
    </div>
  );
}
