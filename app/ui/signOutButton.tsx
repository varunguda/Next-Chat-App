"use client";

import React, { ButtonHTMLAttributes, useState } from "react";
import Button from "./button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Tooltip } from "@nextui-org/tooltip";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton = (props: Props) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      toast.error("Unable to signout, something went wrong!");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Tooltip content="Sign out" showArrow={true}>
      <div>
        <Button
          onClick={handleSignOut}
          {...props}
          variant="ghost"
          isLoading={isSigningOut}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </Tooltip>
  );
};

export default SignOutButton;
