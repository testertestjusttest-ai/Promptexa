import type { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Chat with buyers and sellers on DigiPlyra — marketplace deals, orders and support in one place. Log in to see your conversations.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/chat",
    title: "Chat — DigiPlyra",
    description:
      "Chat with buyers and sellers on DigiPlyra — marketplace deals, orders and support in one place. Log in to see your conversations.",
  },
};

export default function ChatPage() {
  return <ChatClient />;
}
