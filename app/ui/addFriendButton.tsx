"use client";

import React, { useEffect } from "react";
import Button from "./button";
import { useFormState } from "react-dom";
import { addFriend } from "../lib/actions";

export default function AddFriendButton() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(addFriend, initialState);

  useEffect(() => {
    console.log(state);
  }, [state]);

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
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button type="submit">Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">
        {JSON.stringify(state?.errors)}
      </p>
    </form>
  );
}
