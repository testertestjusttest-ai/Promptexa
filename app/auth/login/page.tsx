import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your DigiPlyra account and see your deliveries on your dashboard.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/auth/login",
    title: "Log In — DigiPlyra",
    description:
      "Log in to your DigiPlyra account and see your deliveries on your dashboard.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
