import Button from "../ui/Button";
import "../globals.css";

export default async function Home() {
  return (
    <main>
      <Button isLoading={true}>Hello!</Button>
    </main>
  );
}
