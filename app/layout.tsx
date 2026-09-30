import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptexa.com"),
  title: { default: "Promptexa — Discover Better AI Prompts", template: "%s | Promptexa" },
  description: "Discover visual AI prompts for image, video, writing, coding, marketing and more.",
  applicationName: "Promptexa",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  keywords: ["AI prompts","prompt library","image prompts","video prompts","ChatGPT prompts","Midjourney prompts"],
  openGraph: { title: "Promptexa — Discover Better AI Prompts", description: "A visual AI prompt discovery platform.", type: "website" },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}