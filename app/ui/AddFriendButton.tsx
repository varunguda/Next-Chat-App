"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { addFriend } from "../lib/actions";
import toast from "react-hot-toast";
import Button from "./Button";

export default function AddFriendButton() {
  const initialState = { errors: {}, message: null };
  const [state, dispatch] = useFormState(addFriend, initialState);

  useEffect(() => {
    if (state.errors?.message) {
      toast.error(state.errors?.message);
    }
  }, [state.errors?.message]);

  useEffect(() => {
    if (state.message) {
      toast.success(state.message);
    }
  }, [state.message]);

  return (
    <form action={dispatch} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>

      <div className="mt-2 flex gap-4">
        <input
          name="email"
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondaryRed sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button className="bg-secondaryRed hover:bg-primaryRed" type="submit">
          Add
        </Button>
      </div>
      <p className="mt-1 text-sm text-red-600">
        {state.errors?.email?.join(", ")}
      </p>
    </form>
  );
}
