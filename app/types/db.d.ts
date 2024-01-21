interface User {
  name: string;
  email: string;
  image: string | null | undefined;
  id: string;
}

interface Chat {
  id: string;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}
