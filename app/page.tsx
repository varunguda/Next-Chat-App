import Button from "./ui/button";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function Home() {
  const session = await getServerSession(authConfig);

  return (
    <main>
      {JSON.stringify(session)}
      <Button isLoading={true}>Hello!</Button>
    </main>
  );
}
