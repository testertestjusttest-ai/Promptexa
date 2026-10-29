import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Open a free DigiPlyra account — no email verification needed.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/auth/signup",
    title: "Register — DigiPlyra",
    description:
      "Open a free DigiPlyra account — no email verification needed.",
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
