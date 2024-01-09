import Button from "./ui/button";
import "./globals.css";
import { db } from "./lib/data";

export default async function Home() {
  await db.set("hello", "hello");

  return (
    <main>
      <Button isLoading={true}>Hello!</Button>
    </main>
  );
}
